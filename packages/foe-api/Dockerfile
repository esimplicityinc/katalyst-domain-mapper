# ── Dev stage: hot-reload with bun --watch ───────────────────────────────────
# Usage: docker compose with target: dev
FROM oven/bun:1 AS dev
WORKDIR /app

# Copy workspace config and install deps
COPY package.json bun.lock ./
COPY packages/foe-schemas ./packages/foe-schemas
COPY packages/foe-api ./packages/foe-api

RUN bun install --ignore-scripts

# Build schemas (API depends on them at runtime)
WORKDIR /app/packages/foe-schemas
RUN bun run build

WORKDIR /app/packages/foe-api

# Create data directory for SQLite
RUN mkdir -p /app/data

# Install docker CLI so scans can be triggered in dev mode too
RUN apt-get update && apt-get install -y --no-install-recommends \
    docker.io \
  && rm -rf /var/lib/apt/lists/*

ENV DATABASE_URL=/app/data/foe.db
ENV HOST=0.0.0.0
ENV PORT=3001
ENV NODE_ENV=development

EXPOSE 3001

VOLUME ["/app/data"]

# Source dirs will be mounted over via volumes for hot reload
CMD ["bun", "--watch", "src/main.ts"]

# ── Stage 1: Build @foe/schemas (workspace dependency) ──────────────────────
FROM oven/bun:1 AS builder
WORKDIR /build

# Copy workspace config
COPY package.json bun.lock ./

# Copy the schemas package and the api package
COPY packages/foe-schemas ./packages/foe-schemas
COPY packages/foe-api ./packages/foe-api

# Install dependencies (ignore-scripts skips native builds like better-sqlite3
# which is a drizzle-kit transitive dep — we use bun:sqlite at runtime)
RUN bun install --ignore-scripts

# Build schemas first (api depends on it)
WORKDIR /build/packages/foe-schemas
RUN bun run build

# ── Stage 2: Production runtime ─────────────────────────────────────────────
FROM oven/bun:1-slim AS production
WORKDIR /app

# Copy the full workspace from builder (needed for workspace: resolution at runtime)
COPY --from=builder /build/package.json /build/bun.lock ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/packages/foe-schemas ./packages/foe-schemas
COPY --from=builder /build/packages/foe-api ./packages/foe-api

# Install docker CLI for scan orchestration
RUN apt-get update && apt-get install -y --no-install-recommends \
    docker.io \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/packages/foe-api

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV DATABASE_URL=/app/data/foe.db
ENV HOST=0.0.0.0
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

# Persistent volume for the database
VOLUME ["/app/data"]

CMD ["bun", "run", "src/main.ts"]
