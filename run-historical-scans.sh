#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# FOE Historical Scanner - Batch Analysis Tool
# ═══════════════════════════════════════════════════════════════════════════════
# Runs the FOE scanner against a repository at multiple historical points in time
# to track Flow Optimized Engineering maturity progression.
#
# Usage:
#   ./run-historical-scans.sh [OPTIONS]
#
# Options:
#   --dry-run     Preview commits without running scans
#   --resume      Skip already-completed scans
#   --help        Show this help message
#
# Environment Variables (loaded from .env):
#   AWS_BEARER_TOKEN_BEDROCK    AWS Bedrock credentials
#   AWS_REGION                   AWS region (default: us-east-1)
#   LLM_PROVIDER                 LLM provider override (default: bedrock)
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_PATH="/Users/aaron.west/Documents/Projects/prima-control_tower"
OUTPUT_DIR="$SCRIPT_DIR/foe-historical-scans"
DOCKER_IMAGE="foe-scanner:latest"
LOG_FILE="$OUTPUT_DIR/scan-log.txt"
SUMMARY_FILE="$OUTPUT_DIR/scan-summary.md"

# Target dates (15th of each month from June 2025 to February 2026)
TARGET_MONTHS=(
  "2025-06-15"
  "2025-07-15"
  "2025-08-15"
  "2025-09-15"
  "2025-10-15"
  "2025-11-15"
  "2025-12-15"
  "2026-01-15"
  "2026-02-15"
)

# Parse command-line arguments
DRY_RUN=false
RESUME=false

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --resume)
      RESUME=true
      shift
      ;;
    --help)
      grep '^#' "$0" | grep -v '#!/bin/bash' | sed 's/^# //' | sed 's/^#//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Run with --help for usage information"
      exit 1
      ;;
  esac
done

# ─── Helper Functions ───────────────────────────────────────────────────────────
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $*" | tee -a "$LOG_FILE"
}

log_error() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

log_success() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] ✓ $*" | tee -a "$LOG_FILE"
}

# ─── Pre-flight Checks ──────────────────────────────────────────────────────────
log "Starting FOE Historical Scanner"
log "Repository: $REPO_PATH"
log "Output: $OUTPUT_DIR"
log "Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE SCAN")"

# Load environment variables from .env
if [ -f "$SCRIPT_DIR/.env" ]; then
  log "Loading credentials from .env"
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
else
  log_error ".env file not found at $SCRIPT_DIR/.env"
  exit 1
fi

# Validate credentials
if [ -z "${AWS_BEARER_TOKEN_BEDROCK:-}" ]; then
  log_error "AWS_BEARER_TOKEN_BEDROCK not set in .env"
  exit 1
fi

# Set defaults
export AWS_REGION="${AWS_REGION:-us-east-1}"
export LLM_PROVIDER="${LLM_PROVIDER:-bedrock}"

# Check Docker image exists
if ! docker image inspect "$DOCKER_IMAGE" >/dev/null 2>&1; then
  log_error "Docker image '$DOCKER_IMAGE' not found"
  log "Build it with: docker build -t foe-scanner -f packages/assessment/Dockerfile ."
  exit 1
fi

# Check repository exists
if [ ! -d "$REPO_PATH" ]; then
  log_error "Repository not found: $REPO_PATH"
  exit 1
fi

if [ ! -d "$REPO_PATH/.git" ]; then
  log_error "Not a git repository: $REPO_PATH"
  exit 1
fi

# Check output directory
mkdir -p "$OUTPUT_DIR"

# Check disk space (require at least 5GB free)
AVAILABLE_GB=$(df -g "$OUTPUT_DIR" | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_GB" -lt 5 ]; then
  log_error "Insufficient disk space. Available: ${AVAILABLE_GB}GB, Required: 5GB"
  exit 1
fi

log "Pre-flight checks passed ✓"

# ─── Git State Management ───────────────────────────────────────────────────────
cd "$REPO_PATH"

# Save current git state
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
ORIGINAL_COMMIT=$(git rev-parse HEAD)

log "Current branch: $ORIGINAL_BRANCH"
log "Current commit: $ORIGINAL_COMMIT"

# Check for uncommitted changes (only tracked files)
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  log_error "Working directory has uncommitted changes to tracked files"
  log "Attempting to stash changes automatically..."
  
  if git stash push -m "FOE Historical Scanner - Auto-stash at $(date)" >/dev/null 2>&1; then
    log_success "Changes stashed successfully"
    STASHED=true
    trap 'cleanup; if [ "$STASHED" = true ]; then git -C "$REPO_PATH" stash pop >/dev/null 2>&1; fi' EXIT INT TERM
  else
    log_error "Failed to stash changes. Please manually commit or stash before running."
    exit 1
  fi
else
  STASHED=false
fi

# Warn about untracked files (but don't block)
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
if [ "$UNTRACKED_COUNT" -gt 0 ]; then
  log "Warning: $UNTRACKED_COUNT untracked files present (will be ignored during scans)"
fi

# Ensure cleanup on exit
cleanup() {
  log "Restoring git state..."
  cd "$REPO_PATH"
  if [ "$ORIGINAL_BRANCH" != "detached" ]; then
    git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1 || true
  else
    git checkout "$ORIGINAL_COMMIT" >/dev/null 2>&1 || true
  fi
  log "Git state restored"
}

trap cleanup EXIT INT TERM

# ─── Main Scan Loop ─────────────────────────────────────────────────────────────
TOTAL_MONTHS=${#TARGET_MONTHS[@]}
COMPLETED=0
SKIPPED=0
FAILED=0

log "Starting scans for $TOTAL_MONTHS months..."
log "─────────────────────────────────────────────────────────────────────────"

for i in "${!TARGET_MONTHS[@]}"; do
  TARGET_DATE="${TARGET_MONTHS[$i]}"
  MONTH_NUM=$((i + 1))
  
  # Generate output filename
  OUTPUT_FILE="$OUTPUT_DIR/prima-control-tower-$TARGET_DATE.json"
  
  log ""
  log "[$MONTH_NUM/$TOTAL_MONTHS] Processing $TARGET_DATE..."
  
  # Check if already completed (resume mode)
  if [ "$RESUME" = true ] && [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
    if [ "$FILE_SIZE" -gt 1000 ]; then
      log "Already completed ($(numfmt --to=iec-i --suffix=B $FILE_SIZE 2>/dev/null || echo "${FILE_SIZE}B")), skipping..."
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
  fi
  
  # Find closest commit to target date
  COMMIT_HASH=$(git log main --until="$TARGET_DATE 23:59:59" --format="%H" -1 2>/dev/null || echo "")
  
  if [ -z "$COMMIT_HASH" ]; then
    log_error "No commit found for $TARGET_DATE on main branch"
    FAILED=$((FAILED + 1))
    continue
  fi
  
  COMMIT_SHORT=$(git rev-parse --short "$COMMIT_HASH")
  COMMIT_DATE=$(git log -1 --format="%ai" "$COMMIT_HASH")
  COMMIT_MSG=$(git log -1 --format="%s" "$COMMIT_HASH" | head -c 60)
  
  log "  Commit: $COMMIT_SHORT ($COMMIT_DATE)"
  log "  Message: $COMMIT_MSG"
  
  if [ "$DRY_RUN" = true ]; then
    log "  [DRY RUN] Would scan and save to: $(basename "$OUTPUT_FILE")"
    COMPLETED=$((COMPLETED + 1))
    continue
  fi
  
  # Checkout the commit
  log "  Checking out commit..."
  if ! git checkout "$COMMIT_HASH" >/dev/null 2>&1; then
    log_error "Failed to checkout commit $COMMIT_HASH"
    FAILED=$((FAILED + 1))
    continue
  fi
  
  # Run the scanner
  log "  Running FOE scanner (this may take 5-15 minutes)..."
  SCAN_START=$(date +%s)
  
  # Create temporary file for raw output
  TEMP_OUTPUT="$OUTPUT_DIR/.temp-$(basename "$OUTPUT_FILE")"
  
  if docker run --rm \
      -v "$REPO_PATH:/repo" \
      -e AWS_BEARER_TOKEN_BEDROCK="$AWS_BEARER_TOKEN_BEDROCK" \
      -e AWS_REGION="$AWS_REGION" \
      -e LLM_PROVIDER="$LLM_PROVIDER" \
      "$DOCKER_IMAGE" \
      > "$TEMP_OUTPUT" 2>&1; then
    
    SCAN_END=$(date +%s)
    SCAN_DURATION=$((SCAN_END - SCAN_START))
    
    # Extract the final FOE report from NDJSON output
    # The report is embedded in a markdown code block in a text message
    if command -v jq >/dev/null 2>&1; then
      grep '"type":"text"' "$TEMP_OUTPUT" | \
        jq -r '.part.text' | \
        sed -n '/^```json$/,/^```$/p' | \
        sed '1d;$d' | \
        jq '.' > "$OUTPUT_FILE" 2>/dev/null
      
      # Check if extraction succeeded
      if [ ! -s "$OUTPUT_FILE" ] || ! jq -e '.version' "$OUTPUT_FILE" >/dev/null 2>&1; then
        log_error "Could not extract FOE report JSON from output"
        log "Saving raw output for inspection..."
        cp "$TEMP_OUTPUT" "$OUTPUT_FILE"
        FAILED=$((FAILED + 1))
        rm "$TEMP_OUTPUT"
        continue
      fi
    else
      log_error "jq not found - cannot parse output"
      cp "$TEMP_OUTPUT" "$OUTPUT_FILE"
      FAILED=$((FAILED + 1))
      rm "$TEMP_OUTPUT"
      continue
    fi
    
    rm "$TEMP_OUTPUT"
    
    # Validate output
    if [ -f "$OUTPUT_FILE" ]; then
      FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
      
      if [ "$FILE_SIZE" -lt 100 ]; then
        log_error "Output file too small ($FILE_SIZE bytes), likely an error"
        cat "$OUTPUT_FILE" | head -10 | tee -a "$LOG_FILE"
        FAILED=$((FAILED + 1))
        continue
      fi
      
      # Try to parse JSON
      if command -v jq >/dev/null 2>&1; then
        if ! jq empty "$OUTPUT_FILE" 2>/dev/null; then
          log_error "Invalid JSON output"
          cat "$OUTPUT_FILE" | head -10 | tee -a "$LOG_FILE"
          FAILED=$((FAILED + 1))
          continue
        fi
        
        # Extract key metrics
        OVERALL_SCORE=$(jq -r '.overallScore // "N/A"' "$OUTPUT_FILE" 2>/dev/null || echo "N/A")
        MATURITY=$(jq -r '.maturityLevel // "N/A"' "$OUTPUT_FILE" 2>/dev/null || echo "N/A")
        
        log_success "Scan completed in ${SCAN_DURATION}s"
        log "  Score: $OVERALL_SCORE | Maturity: $MATURITY"
        log "  Output: $(basename "$OUTPUT_FILE") ($(numfmt --to=iec-i --suffix=B $FILE_SIZE 2>/dev/null || echo "${FILE_SIZE}B"))"
      else
        log_success "Scan completed in ${SCAN_DURATION}s"
        log "  Output: $(basename "$OUTPUT_FILE") ($(numfmt --to=iec-i --suffix=B $FILE_SIZE 2>/dev/null || echo "${FILE_SIZE}B"))"
      fi
      
      COMPLETED=$((COMPLETED + 1))
    else
      log_error "Output file not created"
      FAILED=$((FAILED + 1))
    fi
  else
    log_error "Docker scan failed"
    if [ -f "$OUTPUT_FILE" ]; then
      log "Error output:"
      cat "$OUTPUT_FILE" | head -20 | tee -a "$LOG_FILE"
    fi
    FAILED=$((FAILED + 1))
  fi
  
  # Add delay between scans to avoid rate limiting
  if [ $MONTH_NUM -lt $TOTAL_MONTHS ]; then
    log "  Waiting 10 seconds before next scan..."
    sleep 10
  fi
done

# ─── Generate Summary Report ────────────────────────────────────────────────────
cd "$SCRIPT_DIR"

log ""
log "─────────────────────────────────────────────────────────────────────────"
log "Generating summary report..."

cat > "$SUMMARY_FILE" <<'EOF'
# FOE Historical Scan Summary - Prima Control Tower

Generated: $(date '+%Y-%m-%d %H:%M:%S')

## Overview

This report contains FOE (Flow Optimized Engineering) assessment scans of the Prima Control Tower repository at monthly intervals from June 2025 to February 2026.

## Results

| Month | Commit | Overall Score | Maturity Level | Feedback | Understanding | Confidence | File |
|-------|--------|--------------|----------------|----------|---------------|------------|------|
EOF

# Add data rows
for TARGET_DATE in "${TARGET_MONTHS[@]}"; do
  OUTPUT_FILE="$OUTPUT_DIR/prima-control-tower-$TARGET_DATE.json"
  
  if [ -f "$OUTPUT_FILE" ] && command -v jq >/dev/null 2>&1; then
    MONTH=$(echo "$TARGET_DATE" | cut -d'-' -f1-2)
    COMMIT=$(git -C "$REPO_PATH" log main --until="$TARGET_DATE 23:59:59" --format="%h" -1 2>/dev/null || echo "N/A")
    SCORE=$(jq -r '.overallScore // "N/A"' "$OUTPUT_FILE" 2>/dev/null || echo "N/A")
    MATURITY=$(jq -r '.maturityLevel // "N/A"' "$OUTPUT_FILE" 2>/dev/null || echo "N/A")
    FEEDBACK=$(jq -r '.dimensions.feedback.score // "N/A"' "$OUTPUT_FILE" 2>/dev/null || echo "N/A")
    UNDERSTANDING=$(jq -r '.dimensions.understanding.score // "N/A"' "$OUTPUT_FILE" 2>/dev/null || echo "N/A")
    CONFIDENCE=$(jq -r '.dimensions.confidence.score // "N/A"' "$OUTPUT_FILE" 2>/dev/null || echo "N/A")
    FILENAME=$(basename "$OUTPUT_FILE")
    
    echo "| $MONTH | $COMMIT | $SCORE | $MATURITY | $FEEDBACK | $UNDERSTANDING | $CONFIDENCE | $FILENAME |" >> "$SUMMARY_FILE"
  fi
done

# Add footer
cat >> "$SUMMARY_FILE" <<EOF

## Statistics

- **Total Scans:** $TOTAL_MONTHS
- **Completed:** $COMPLETED
- **Skipped:** $SKIPPED
- **Failed:** $FAILED

## Files

All scan results are available in: \`foe-historical-scans/\`

## Notes

- Scans were performed on the \`main\` branch
- Target date for each month was the 15th
- Scanner used: AWS Bedrock (Claude Sonnet 4.5)
- Each scan analyzes three dimensions:
  - **Feedback** (35%): CI/CD speed, deployment frequency, test coverage
  - **Understanding** (35%): Architecture clarity, domain modeling, documentation
  - **Confidence** (30%): Test quality, contract testing, change safety

## Next Steps

1. Review individual JSON files for detailed findings and recommendations
2. Track dimension scores over time to identify trends
3. Compare gap evolution between June 2025 and February 2026
4. Use insights to prioritize FOE improvements

---

**Repository:** prima-control_tower  
**Analysis Period:** June 2025 - February 2026  
**Generated By:** FOE Historical Scanner  
EOF

log_success "Summary report generated: $SUMMARY_FILE"

# ─── Final Summary ──────────────────────────────────────────────────────────────
log ""
log "═══════════════════════════════════════════════════════════════════════════"
log "FOE Historical Scan Complete"
log "═══════════════════════════════════════════════════════════════════════════"
log ""
log "Results:"
log "  ✓ Completed: $COMPLETED"
if [ $SKIPPED -gt 0 ]; then
  log "  ⊘ Skipped: $SKIPPED"
fi
if [ $FAILED -gt 0 ]; then
  log "  ✗ Failed: $FAILED"
fi
log ""
log "Output:"
log "  Reports: $OUTPUT_DIR/"
log "  Summary: $SUMMARY_FILE"
log "  Log: $LOG_FILE"
log ""

if [ "$DRY_RUN" = true ]; then
  log "This was a DRY RUN. No scans were performed."
  log "Run without --dry-run to execute actual scans."
  log ""
fi

if [ $FAILED -gt 0 ]; then
  log_error "Some scans failed. Check $LOG_FILE for details."
  exit 1
fi

log "Success! 🎉"
