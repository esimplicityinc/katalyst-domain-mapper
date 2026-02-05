# Stage 1: Build Field Guide tools and generate methods index
FROM oven/bun:1 AS builder
WORKDIR /build

# Copy workspace configuration
COPY package.json bun.lockb ./

# Copy packages needed for build
COPY packages/foe-schemas ./packages/foe-schemas
COPY packages/foe-field-guide-tools ./packages/foe-field-guide-tools

# Copy field guide documentation (needed to build index)
COPY docs/docs ./docs/docs

# Install dependencies
RUN bun install

# Build schemas package
WORKDIR /build/packages/foe-schemas
RUN bun run build

# Build field guide tools and generate methods index
WORKDIR /build/packages/foe-field-guide-tools
RUN bun run build

# Stage 2: Runtime with OpenCode
FROM node:22-slim
WORKDIR /app

# Install OpenCode globally
RUN npm install -g opencode@latest

# Copy agent definitions
COPY packages/foe-scanner/.opencode ./.opencode

# Copy entrypoint script
COPY packages/foe-scanner/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Bake in methods index from builder stage
COPY --from=builder /build/packages/foe-field-guide-tools/dist/methods-index.json ./data/
COPY --from=builder /build/packages/foe-field-guide-tools/dist/observations-index.json ./data/

# Set environment variables
ENV FOE_METHODS_INDEX=/app/data/methods-index.json
ENV FOE_OBSERVATIONS_INDEX=/app/data/observations-index.json
ENV NODE_ENV=production

# Default to scanning /repo
VOLUME ["/repo"]
WORKDIR /repo

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["/repo"]
