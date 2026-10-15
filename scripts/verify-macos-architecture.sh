#!/usr/bin/env bash
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Mach-O architecture verification requires macOS." >&2
  exit 1
fi
ARCH="${1:-x86_64}"
if [[ "$ARCH" != "x86_64" ]]; then
  echo "Only x86_64-apple-darwin bundle verification is defined here." >&2
  exit 2
fi
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/src-tauri/target/x86_64-apple-darwin/release/bundle/macos/LaunchAnything.app"
HELPER="$APP/Contents/Resources/bin/launchanything-macos-helper"
if [[ ! -d "$APP" ]]; then
  echo "Intel app bundle not found at $APP. Run npm run build:macos-intel first." >&2
  exit 3
fi
if [[ ! -f "$HELPER" ]]; then
  echo "Intel app is missing required LaunchServices helper: $HELPER" >&2
  exit 4
fi
APP_BIN="$(find "$APP/Contents/MacOS" -maxdepth 1 -type f | head -n 1)"
if [[ -z "$APP_BIN" ]]; then
  echo "Intel app bundle contains no main Mach-O executable." >&2
  exit 5
fi
for BIN in "$APP_BIN" "$HELPER"; do
  echo "Verifying $BIN"
  xcrun lipo -verify_arch x86_64 "$BIN" || {
    echo "Found incompatible Mach-O binary in Intel app bundle." >&2
    exit 6
  }
done
echo "Intel macOS bundle and bundled native helper are x86_64."
