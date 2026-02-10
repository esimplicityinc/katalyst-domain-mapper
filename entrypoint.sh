#!/bin/bash
set -e

echo "Starting Katalyst Domain Mapper..."

# ── Start OpenCode server in background ──────────────────────────────────────
# Internal only (127.0.0.1) — Bun proxies /opencode/* to it
if command -v opencode &>/dev/null; then
  echo "Starting OpenCode server on :4096..."
  opencode serve \
    --port 4096 \
    --hostname 127.0.0.1 \
    &
  OPENCODE_PID=$!
  echo "OpenCode started (PID: $OPENCODE_PID)"
else
  echo "WARNING: opencode binary not found, AI chat will be unavailable"
fi

# ── Start Bun API + static server in foreground ─────────────────────────────
echo "Starting Bun server on :${PORT:-8090}..."
exec bun run /app/packages/intelligence/api/main.ts
