#!/bin/bash
set -euo pipefail

REPO_PATH="${1:-/repo}"

# Validate at least one LLM API key is set
if [ -z "${ANTHROPIC_API_KEY:-}" ] && [ -z "${OPENROUTER_API_KEY:-}" ] && [ -z "${AWS_BEARER_TOKEN_BEDROCK:-}" ]; then
  echo '{"error": "Either ANTHROPIC_API_KEY, OPENROUTER_API_KEY, or AWS_BEARER_TOKEN_BEDROCK environment variable is required"}' >&2
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

# Determine which provider to use and set the model accordingly
# LLM_PROVIDER is set by the API when spawning the container
PROVIDER="${LLM_PROVIDER:-}"
MODEL_FLAG=""

if [ -n "${AWS_BEARER_TOKEN_BEDROCK:-}" ] || [ "$PROVIDER" = "bedrock" ]; then
  echo "Using AWS Bedrock provider" >&2
  MODEL_FLAG="--model amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0"
elif [ -n "${OPENROUTER_API_KEY:-}" ] || [ "$PROVIDER" = "openrouter" ]; then
  echo "Using OpenRouter provider" >&2
  MODEL_FLAG="--model openrouter/anthropic/claude-sonnet-4"
elif [ -n "${ANTHROPIC_API_KEY:-}" ] || [ "$PROVIDER" = "anthropic" ]; then
  echo "Using Anthropic provider" >&2
  # No model flag needed — OpenCode defaults to Anthropic
fi

# Run OpenCode from /app where opencode.json + .opencode/agents/ live
# The scanner agent will cd to the repo path and analyze it
cd /app

# shellcheck disable=SC2086
opencode run \
  --agent foe-scanner-container \
  --format json \
  $MODEL_FLAG \
  "Scan this repository and output complete FOE assessment as JSON. Target path: $REPO_PATH"
