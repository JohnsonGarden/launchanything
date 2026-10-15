#!/usr/bin/env bash
set -euo pipefail
[[ "$(uname -s)" == "Darwin" ]] || { echo "macOS required" >&2; exit 1; }
[[ "$(uname -m)" == "arm64" ]] || { echo "Apple Silicon arm64 only" >&2; exit 1; }
DIR="$HOME/Library/Application Support/LaunchAnything/source"
[[ ! -e "$DIR" ]] || { echo "Source already exists: $DIR; inspect instead of overwriting." >&2; exit 1; }
TMP="$(mktemp -d -t launchanything-source)"
trap 'rm -rf "$TMP"' EXIT
curl --proto '=https' --tlsv1.2 -fL --retry 2 \
  https://github.com/JohnsonGarden/launchanything/archive/refs/heads/main.tar.gz -o "$TMP/source.tar.gz"
mkdir -p "$TMP/unpacked"
tar -xzf "$TMP/source.tar.gz" -C "$TMP/unpacked"
[[ -f "$TMP/unpacked/launchanything-main/scripts/install-macos.sh" ]] ||
  { echo "Unexpected repository archive structure" >&2; exit 1; }
mkdir -p "$(dirname "$DIR")"
mv "$TMP/unpacked/launchanything-main" "$DIR"
echo "Source downloaded to $DIR"
bash "$DIR/scripts/install-macos.sh" "$@"
