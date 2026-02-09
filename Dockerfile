# ═══════════════════════════════════════════════════════════════════════════════
# Katalyst Domain Mapper — Unified Single-Container Build
# ═══════════════════════════════════════════════════════════════════════════════
# Runs everything in one container:
#   - Bun: serves static web UI + API + /opencode proxy
#   - OpenCode: AI chat server (background subprocess on :4096)
#   - Docker CLI: for spawning scanner containers
#
# Usage:
#   docker build -t katalyst .
#   docker run -p 8090:8090 -v /var/run/docker.sock:/var/run/docker.sock \
#     -e ANTHROPIC_API_KEY=sk-ant-... katalyst

# ── Stage 1: Build the web UI ────────────────────────────────────────────────
FROM oven/bun:1 AS web-builder
WORKDIR /build

COPY package.json bun.lock ./
COPY packages/foe-web-ui ./packages/foe-web-ui

RUN bun install

WORKDIR /build/packages/foe-web-ui

# In unified mode, the browser talks to the same origin — no separate hosts
ARG VITE_API_URL=
ARG VITE_OPENCODE_URL=/opencode
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_OPENCODE_URL=$VITE_OPENCODE_URL

RUN bunx vite build

# ── Stage 2: Build schemas (API dependency) ──────────────────────────────────
FROM oven/bun:1 AS api-builder
WORKDIR /build

COPY package.json bun.lock ./
COPY packages/foe-schemas ./packages/foe-schemas
COPY packages/foe-api ./packages/foe-api

RUN bun install --ignore-scripts

WORKDIR /build/packages/foe-schemas
RUN bun run build

# ── Stage 3: Unified runtime ─────────────────────────────────────────────────
FROM oven/bun:1
WORKDIR /app

# Install Docker CLI + download OpenCode CLI (glibc binary from GitHub releases)
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates \
  && ARCH=$(uname -m) \
  && curl -fsSL "https://download.docker.com/linux/static/stable/${ARCH}/docker-27.5.1.tgz" \
     | tar xz --strip-components=1 -C /usr/local/bin docker/docker \
  && OPENCODE_ARCH=$([ "$ARCH" = "aarch64" ] && echo "arm64" || echo "x64") \
  && curl -fsSL "https://github.com/anomalyco/opencode/releases/latest/download/opencode-linux-${OPENCODE_ARCH}.tar.gz" \
     | tar xz -C /usr/local/bin \
  && rm -rf /var/lib/apt/lists/* \
  && docker --version \
  && opencode --version

# Copy API workspace (schemas + api + node_modules)
COPY --from=api-builder /build/package.json /build/bun.lock ./
COPY --from=api-builder /build/node_modules ./node_modules
COPY --from=api-builder /build/packages/foe-schemas ./packages/foe-schemas
COPY --from=api-builder /build/packages/foe-api ./packages/foe-api

# Copy built web UI static files
COPY --from=web-builder /build/packages/foe-web-ui/dist ./web-dist

# Copy OpenCode agents and project config (for the AI chat server)
COPY .opencode ./.opencode
COPY opencode.json ./
COPY AGENTS.md ./

# Copy entrypoint
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Create data directory
RUN mkdir -p /app/data

# Environment
ENV PORT=8090
ENV HOST=0.0.0.0
ENV DATABASE_URL=/app/data/foe.db
ENV SCANNER_IMAGE=foe-scanner
ENV SCAN_POLL_INTERVAL_MS=5000
ENV LOG_LEVEL=info
ENV NODE_ENV=production
ENV WEB_DIST_DIR=/app/web-dist
ENV OPENCODE_INTERNAL_URL=http://127.0.0.1:4096

EXPOSE 8090

VOLUME ["/app/data"]

ENTRYPOINT ["./entrypoint.sh"]
