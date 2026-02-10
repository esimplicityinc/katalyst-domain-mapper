#!/bin/bash
set -euo pipefail

REPO_PATH="${1:-/repo}"

# Validate API key
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo '{"error": "ANTHROPIC_API_KEY environment variable is required"}' >&2
  exit 1
fi

# Validate repo path exists
if [ ! -d "$REPO_PATH" ]; then
  echo "{\"error\": \"Repository path '$REPO_PATH' does not exist\"}" >&2
  exit 1
fi

# Check if it's a git repository
if [ ! -d "$REPO_PATH/.git" ]; then
  echo "{\"warning\": \"Path '$REPO_PATH' is not a git repository - some metrics may be unavailable\"}" >&2
fi

# Change to repo directory
cd "$REPO_PATH"

# Run OpenCode with the scanner agent
# The agent will auto-detect tech stack and run analysis
opencode run \
  --agent foe-scanner-container \
  --format json \
  "Scan this repository and output complete FOE assessment as JSON. Target path: $REPO_PATH"
