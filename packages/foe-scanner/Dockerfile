# ═══════════════════════════════════════════════════════════════════════════════
# FOE Scanner — AI-powered repository analysis container
# ═══════════════════════════════════════════════════════════════════════════════
# Spawned by the API to scan repositories via `docker run`.
# Uses OpenCode + Claude to analyze codebases and produce FOE reports.
#
# Usage (standalone):
#   docker run -v /path/to/repo:/repo -e ANTHROPIC_API_KEY=sk-ant-... foe-scanner
# ═══════════════════════════════════════════════════════════════════════════════

FROM debian:bookworm-slim
WORKDIR /app

# Install minimal runtime dependencies + download OpenCode CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates git bash \
  && ARCH=$(uname -m) \
  && OPENCODE_ARCH=$([ "$ARCH" = "aarch64" ] && echo "arm64" || echo "x64") \
  && curl -fsSL "https://github.com/anomalyco/opencode/releases/latest/download/opencode-linux-${OPENCODE_ARCH}.tar.gz" \
     | tar xz -C /usr/local/bin \
  && rm -rf /var/lib/apt/lists/* \
  && opencode --version

# Copy agent definitions
COPY packages/foe-scanner/.opencode ./.opencode

# Copy pre-built Field Guide indices (already built by foe-field-guide-tools)
COPY packages/foe-field-guide-tools/dist/methods-index.json ./data/
COPY packages/foe-field-guide-tools/dist/observations-index.json ./data/

# Copy entrypoint script
COPY packages/foe-scanner/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Set environment variables
ENV FOE_METHODS_INDEX=/app/data/methods-index.json
ENV FOE_OBSERVATIONS_INDEX=/app/data/observations-index.json

# Default to scanning /repo
VOLUME ["/repo"]
WORKDIR /repo

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["/repo"]
