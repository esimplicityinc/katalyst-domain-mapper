# FOE Scanner (Container)

Containerized Flow Optimized Engineering repository scanner powered by OpenCode AI agents.

## Overview

The FOE Scanner analyzes your repository for alignment with Flow Optimized Engineering principles across three dimensions:

- **Feedback** (35%): CI/CD speed, deployment frequency, test coverage, feedback loops
- **Understanding** (35%): Architecture clarity, domain modeling, documentation quality
- **Confidence** (30%): Test quality, contract testing, dependency health, change safety

The scanner produces a scored JSON report with:
- Overall FOE score (0-100) and maturity level
- Dimension-specific scores and subscores
- Top strengths and gaps with evidence
- Prioritized recommendations linked to FOE methods
- Cognitive triangle diagnosis

## Quick Start

```bash
# Scan current directory
docker run -v $(pwd):/repo \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/your-org/foe-scanner

# Save report to file
docker run -v $(pwd):/repo \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/your-org/foe-scanner > foe-report.json

# Pretty-print with jq
docker run -v $(pwd):/repo \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/your-org/foe-scanner | jq '.'
```

## Usage

### Basic Scan

```bash
docker run \
  -v $(pwd):/repo \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/your-org/foe-scanner
```

### Scan Specific Directory

```bash
# Scan a monorepo package
docker run \
  -v $(pwd):/repo \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/your-org/foe-scanner /repo/packages/api

# Scan a subdirectory
docker run \
  -v /path/to/project:/repo \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/your-org/foe-scanner
```

### Configuration

Environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | - | Anthropic API key for Claude |
| `OPENCODE_MODEL` | ❌ No | `claude-sonnet-4` | Model to use for analysis |

### Output Format

The scanner outputs a JSON object to stdout:

```json
{
  "version": "1.0",
  "generated": "2026-02-05T15:30:00Z",
  "repository": {
    "name": "my-project",
    "path": "/repo",
    "techStack": ["node", "typescript"],
    "monorepo": false
  },
  "dimensions": {
    "feedback": {
      "score": 72,
      "maxScore": 100,
      "subscores": { ... },
      "findings": [ ... ],
      "gaps": [ ... ]
    },
    "understanding": { ... },
    "confidence": { ... }
  },
  "triangleDiagnosis": {
    "cycleHealth": "practicing",
    "weakestDimension": "confidence",
    "pattern": "Understanding without full Confidence",
    "intervention": "Add test coverage to match architecture quality"
  },
  "overallScore": 65,
  "maturityLevel": "practicing",
  "topStrengths": [ ... ],
  "topGaps": [ ... ],
  "methodology": {
    "scanDuration": "45s",
    "agentsUsed": ["ci", "tests", "arch", "domain", "docs"]
  }
}
```

## How It Works

The scanner uses 5 specialized AI agents running in parallel:

1. **foe-scanner-ci**: Analyzes CI/CD configuration (GitHub Actions, GitLab CI, etc.)
2. **foe-scanner-tests**: Analyzes test practices and coverage
3. **foe-scanner-arch**: Analyzes software architecture patterns
4. **foe-scanner-domain**: Analyzes domain modeling practices
5. **foe-scanner-docs**: Analyzes documentation quality

Each agent:
- Uses deterministic analysis (file patterns, metrics)
- Leverages AI for qualitative assessment
- Returns structured findings with evidence
- Links recommendations to FOE methods

The orchestrator combines results, calculates scores, and performs cognitive triangle diagnosis.

## Supported Technologies

The scanner auto-detects and analyzes:

**Languages:**
- JavaScript/TypeScript (Node.js)
- Python
- Go
- Java
- Ruby
- Rust

**CI/CD Platforms:**
- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins
- Azure Pipelines
- Bitbucket Pipelines

**Test Frameworks:**
- Jest, Vitest, Mocha (JS/TS)
- pytest (Python)
- go test (Go)
- JUnit (Java)

## CI/CD Integration

### GitHub Actions

```yaml
name: FOE Scan

on:
  pull_request:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  foe-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run FOE Scanner
        run: |
          docker run \
            -v $(pwd):/repo \
            -e ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }} \
            ghcr.io/your-org/foe-scanner > foe-report.json
      
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: foe-report
          path: foe-report.json
```

### GitLab CI

```yaml
foe-scan:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker pull ghcr.io/your-org/foe-scanner
    - docker run -v $(pwd):/repo -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY ghcr.io/your-org/foe-scanner > foe-report.json
  artifacts:
    paths:
      - foe-report.json
  only:
    - schedules
```

## Building Locally

```bash
# Build the image
docker build -t foe-scanner -f packages/foe-scanner/Dockerfile .

# Run locally
docker run -v $(pwd):/repo -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY foe-scanner
```

## Maturity Levels

| Score | Level | Description |
|-------|-------|-------------|
| 0-25 | Hypothesized | Minimal FOE practices, significant gaps |
| 26-50 | Emerging | Some practices in place, inconsistent application |
| 51-75 | Practicing | Solid foundation, room for optimization |
| 76-100 | Optimized | Strong FOE alignment, continuous improvement culture |

## Cognitive Triangle

The scanner diagnoses the health of your FOE cognitive triangle:

**Minimum Thresholds:**
- Understanding: 35
- Feedback: 40
- Confidence: 30

**Common Patterns:**
- **Confident Ignorance**: Acting boldly without understanding why
- **Analysis Paralysis**: Know what to do but won't act
- **Vicious Cycle Risk**: All dimensions degrading together
- **Virtuous Cycle Potential**: All dimensions supporting each other

## License

MIT

## Contributing

See the main repository for contribution guidelines.
