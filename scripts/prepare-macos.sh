#!/usr/bin/env bash
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "LaunchAnything currently builds only on macOS."
  exit 1
fi
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ ! -f "$ROOT/src-tauri/icons/icon.icns" ]]; then
  "$ROOT/node_modules/.bin/tauri" icon "$ROOT/src-tauri/icons/icon.svg" --output "$ROOT/src-tauri/icons"
fi

ARCH="${LAUNCHANYTHING_MACOS_ARCH:-$(uname -m)}"
case "$ARCH" in
  arm64) SWIFT_TARGET="arm64-apple-macos12.0" ;;
  x86_64) SWIFT_TARGET="x86_64-apple-macos12.0" ;;
  *)
    echo "Unsupported macOS architecture: $ARCH (expected arm64 or x86_64)." >&2
    exit 2
    ;;
esac
HELPER="$ROOT/src-tauri/bin/launchanything-macos-helper"
echo "Building LaunchAnything Swift launcher for $SWIFT_TARGET"
xcrun swiftc -O -target "$SWIFT_TARGET" -framework AppKit \
  "$ROOT/src-tauri/native/Launcher.swift" \
  -o "$HELPER"
chmod 755 "$HELPER"
# Never package a helper built for another architecture.
xcrun lipo -verify_arch "$ARCH" "$HELPER" || {
  echo "Wrong-architecture Swift helper. Refusing to continue." >&2
  exit 3
}
