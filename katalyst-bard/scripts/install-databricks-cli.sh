#!/bin/sh
# Install Databricks CLI into ./node_modules/.bin/databricks
# Runs as an npm postinstall step on Databricks Apps (linux-amd64).
# Skips on non-Linux (macOS/Windows devs install CLI via other means).
# Idempotent: skips if the target version is already present.

set -e

VERSION="0.296.0"
INSTALL_DIR="./node_modules/.bin"
TARGET="${INSTALL_DIR}/databricks"

# Only run on Linux (Databricks Apps containers are linux-amd64)
OS="$(uname -s 2>/dev/null || echo unknown)"
if [ "$OS" != "Linux" ]; then
  echo "[install-cli] Not Linux (${OS}) — skipping Databricks CLI install"
  exit 0
fi

# Detect architecture
ARCH_RAW="$(uname -m 2>/dev/null || echo x86_64)"
case "$ARCH_RAW" in
  x86_64)  ARCH="amd64" ;;
  aarch64) ARCH="arm64" ;;
  arm64)   ARCH="arm64" ;;
  *)       ARCH="amd64" ;;
esac

# Idempotency check
if [ -x "$TARGET" ]; then
  INSTALLED_VERSION="$("$TARGET" version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "")"
  if [ "$INSTALLED_VERSION" = "$VERSION" ]; then
    echo "[install-cli] Databricks CLI ${VERSION} already installed at ${TARGET}"
    exit 0
  fi
fi

FILE="databricks_cli_${VERSION}_linux_${ARCH}"
URL="https://github.com/databricks/cli/releases/download/v${VERSION}/${FILE}.tar.gz"
TMP="/tmp/databricks-cli-install"

echo "[install-cli] Downloading Databricks CLI ${VERSION} (${ARCH}) ..."
mkdir -p "$TMP"
curl -fsSL "$URL" -o "${TMP}/databricks.tar.gz"
tar -xzf "${TMP}/databricks.tar.gz" -C "$TMP" databricks
chmod +x "${TMP}/databricks"
mv "${TMP}/databricks" "$TARGET"
rm -rf "$TMP"

echo "[install-cli] Installed $("$TARGET" version 2>/dev/null || echo v${VERSION}) at ${TARGET}"
