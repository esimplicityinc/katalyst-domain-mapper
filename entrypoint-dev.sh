#!/bin/bash
set -e

echo "Starting Katalyst Domain Mapper (DEV mode)..."

# ── Run Drizzle migrations ──────────────────────────────────────────────────
echo "Running database migrations..."
cd /app/packages/intelligence
bun run db:migrate || echo "WARN: Migration skipped (may already be applied)"
cd /app

# ── Start Vite dev server in background ──────────────────────────────────────
FRONTEND_PORT="${FRONTEND_PORT:-3002}"
echo "Starting Vite dev server on :${FRONTEND_PORT}..."
cd /app/packages/intelligence/web
bunx vite --host 0.0.0.0 --port "${FRONTEND_PORT}" &
VITE_PID=$!
echo "Vite started (PID: $VITE_PID)"
cd /app

# ── Start OpenCode server in background (optional) ──────────────────────────
if command -v opencode &>/dev/null; then
  echo "Starting OpenCode server on :4096..."
  opencode serve --port 4096 --hostname 127.0.0.1 &
  OPENCODE_PID=$!
  echo "OpenCode started (PID: $OPENCODE_PID)"
fi

# ── Start Bun API server in foreground ──────────────────────────────────────
echo "Starting Bun API on :${PORT:-3001}..."
exec bun --watch /app/packages/intelligence/api/main.ts
