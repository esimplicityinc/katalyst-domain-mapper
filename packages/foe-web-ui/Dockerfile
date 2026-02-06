# ── Dev stage: Vite dev server with HMR ──────────────────────────────────────
# Usage: docker compose with target: dev
FROM oven/bun:1 AS dev
WORKDIR /app

# Copy workspace config and install deps
COPY package.json bun.lock ./
COPY packages/foe-web-ui ./packages/foe-web-ui

RUN bun install

WORKDIR /app/packages/foe-web-ui

ENV VITE_API_URL=http://localhost:3001
ENV VITE_OPENCODE_URL=http://localhost:4096

EXPOSE 5173

# Source dirs will be mounted over via volumes for HMR
CMD ["bunx", "vite", "--host", "0.0.0.0", "--port", "5173"]

# ── Stage 1: Build the static site ──────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /build

# Copy workspace config
COPY package.json bun.lock ./

# Copy just the web-ui package
COPY packages/foe-web-ui ./packages/foe-web-ui

# Install dependencies
RUN bun install

WORKDIR /build/packages/foe-web-ui

# Build args for URLs the browser will connect to
ARG VITE_API_URL=http://localhost:3001
ARG VITE_OPENCODE_URL=http://localhost:4096
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_OPENCODE_URL=$VITE_OPENCODE_URL

# Build static assets (skip tsc in Docker — already checked locally)
RUN bunx vite build

# ── Stage 2: Production — serve with nginx ───────────────────────────────────
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /build/packages/foe-web-ui/dist /usr/share/nginx/html

# Custom nginx config for SPA routing
COPY packages/foe-web-ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
