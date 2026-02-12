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

# Copy agent definitions and OpenCode config
COPY packages/assessment/.opencode ./.opencode
COPY packages/assessment/opencode.json ./opencode.json

# Copy entrypoint script
COPY packages/assessment/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Default to scanning /repo
VOLUME ["/repo"]
WORKDIR /repo

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["/repo"]
