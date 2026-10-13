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
xcrun swiftc -O -framework AppKit \
  "$ROOT/src-tauri/native/Launcher.swift" \
  -o "$ROOT/src-tauri/bin/launchanything-macos-helper"
chmod 755 "$ROOT/src-tauri/bin/launchanything-macos-helper"
