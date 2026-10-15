#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/Applications/LaunchAnything.app"
SOURCE="$ROOT/src-tauri/target/release/bundle/macos/LaunchAnything.app"
CHECK=false; DRY=false; YES=false; LAUNCH=false; STAGE=""; BACKUP=""
usage() {
  cat <<'HELP'
LaunchAnything Apple Silicon source installer / Mac 安装器
Usage: bash scripts/install-macos.sh [--check] [--dry-run] [--yes] [--launch]
  --check    Inspect environment only / 只检查
  --dry-run  Explain installation; no changes / 预演
  --yes      Approve dependency installs and replacing app / 已授权
  --launch   Start app after successful install / 安装后启动
  --help     Help / 帮助
HELP
}
die() { printf '[ERROR] %s\n' "$*" >&2; exit 1; }
info() { printf '[LaunchAnything] %s\n' "$*"; }
has() { command -v "$1" >/dev/null 2>&1; }
node22() {
  has node && [[ "$(node -p "process.versions.node.split('.')[0]" 2>/dev/null)" =~ ^[0-9]+$ ]] &&
    (( $(node -p "Number(process.versions.node.split('.')[0])") >= 22 ))
}
confirm() {
  if "$YES"; then info "Approved: $1"; return 0; fi
  [[ -t 0 ]] || die "Approval required: $1. Review before retrying with --yes."
  local reply
  read -r -p "$1 [y/N] " reply
  [[ "$reply" == y || "$reply" == Y ]] || die "Cancelled."
}
cleanup() {
  local code="$?"
  if [[ -n "$BACKUP" && -d "$BACKUP" && ! -d "$DEST" ]]; then
    mv "$BACKUP" "$DEST" || true
  fi
  if [[ -n "$STAGE" && -d "$STAGE" ]]; then rm -rf "$STAGE"; fi
  if [[ "$code" -ne 0 && -n "$BACKUP" && -d "$BACKUP" ]]; then
    info "Backup preserved: $BACKUP"
  fi
}
trap cleanup EXIT
for arg in "$@"; do
  case "$arg" in
    --check) CHECK=true ;;
    --dry-run) DRY=true ;;
    --yes) YES=true ;;
    --launch) LAUNCH=true ;;
    --help|-h) usage; exit 0 ;;
    *) usage >&2; die "Unknown argument: $arg" ;;
  esac
done
[[ "$(uname -s)" == "Darwin" ]] || die "macOS required."
[[ "$(uname -m)" == "arm64" ]] || die "Stable installer requires Apple Silicon arm64; Intel is a preview branch."
info "Source: $ROOT"
info "Destination: $DEST"
if "$CHECK" || "$DRY"; then
  info "Inspection only: no installations, builds or file changes."
  xcrun --find swiftc >/dev/null 2>&1 && echo "Swift: available" || echo "Swift: missing"
  has cargo && echo "cargo: available" || echo "cargo: missing"
  has rustc && echo "rustc: available" || echo "rustc: missing"
  node22 && echo "Node.js 22+: available" || echo "Node.js 22+: missing"
  has npm && echo "npm: available" || echo "npm: missing"
  "$DRY" && info "Would install missing supported dependencies, build and copy into ~/Applications."
  exit 0
fi
if ! xcrun --find swiftc >/dev/null 2>&1; then
  confirm "Open Apple Command Line Tools installation dialog?"
  xcode-select --install || die "Could not start Apple's tools installation."
  die "Finish Apple's dialog and rerun the installer."
fi
if ! has cargo || ! has rustc; then
  confirm "Download and install official Rustup stable?"
  TMP_RUST="$(mktemp -t launchanything-rustup)"
  curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs -o "$TMP_RUST" ||
    die "Rustup download failed."
  sh "$TMP_RUST" -y --no-modify-path || die "Rustup installation failed."
  rm -f "$TMP_RUST"
fi
if [[ -f "$HOME/.cargo/env" ]]; then source "$HOME/.cargo/env"; fi
has cargo && has rustc || die "Rust unavailable. Check ~/.cargo/bin."
if ! node22 || ! has npm; then
  has brew || die "Node.js 22+ missing. Install Homebrew from https://brew.sh or Node.js from https://nodejs.org, then rerun."
  confirm "Install node@22 using the existing Homebrew?"
  brew install node@22 || die "Homebrew Node installation failed."
  export PATH="$(brew --prefix node@22)/bin:$PATH"
fi
node22 && has npm || die "Node.js 22+ and npm required. Check PATH."
info "Versions: $(node --version), $(npm --version), $(cargo --version)"
cd "$ROOT"
npm install --no-audit --no-fund
npm run doctor
npm run test:doctor
npm run typecheck
npm test
npm run build
[[ -d "$SOURCE" ]] || die "Build output .app missing."
[[ -f "$SOURCE/Contents/Resources/bin/launchanything-macos-helper" ]] ||
  die "Swift helper missing from bundle."
if [[ -e "$DEST" ]]; then
  confirm "Replace existing $DEST? The existing app will be backed up."
fi
mkdir -p "$HOME/Applications"
STAGE="$HOME/Applications/.LaunchAnything-staging-$$.app"
[[ ! -e "$STAGE" ]] || die "Staging directory already exists."
ditto "$SOURCE" "$STAGE" || die "Unable to stage the app."
[[ -f "$STAGE/Contents/Resources/bin/launchanything-macos-helper" ]] ||
  die "Staged bundle missing Swift helper."
if [[ -e "$DEST" ]]; then
  BACKUP="$HOME/Applications/LaunchAnything.backup-$(date +%Y%m%d-%H%M%S)-$$.app"
  mv "$DEST" "$BACKUP" || die "Could not back up existing app."
fi
mv "$STAGE" "$DEST" || die "Could not install app; old version will be restored."
STAGE=""
[[ -f "$DEST/Contents/Resources/bin/launchanything-macos-helper" ]] ||
  die "Installed app verification failed."
info "Installed: $DEST"
if [[ -n "$BACKUP" ]]; then info "Backup: $BACKUP"; fi
info 'Launch: open "$HOME/Applications/LaunchAnything.app"'
info "This is an unsigned source build; never disable Gatekeeper globally."
if "$LAUNCH"; then open "$DEST" || die "App installed but could not open."; fi
