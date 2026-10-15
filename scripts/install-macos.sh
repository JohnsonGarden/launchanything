#!/usr/bin/env bash
# LaunchAnything macOS source installer. Stable: arm64; Intel requires preview opt-in.
# No sudo, no Gatekeeper bypass, no system-wide proxy modification.
set -Eeuo pipefail
REPOSITORY=JohnsonGarden/launchanything
APP="$HOME/Applications/LaunchAnything.app"
STATE="$HOME/Library/Application Support/LaunchAnything/installer"
CACHE="$HOME/Library/Caches/LaunchAnything/installer"
NODE_HOME="$STATE/node22"
MODE=help; JSON=0; YES=0; NO_LAUNCH=0; INTEL=0; REF=main; REF_SET=0
TEMP=""; STAGE=""
log() { printf '[LaunchAnything] %s\n' "$*" >&2; }
error() { local c="$1" k="$2"; shift 2; log "ERROR[$k]: $*"; exit "$c"; }
cleanup() {
  [[ -z "$TEMP" || ! -d "$TEMP" ]] || rm -rf -- "$TEMP"
  [[ -z "$STAGE" || ! -d "$STAGE" ]] || rm -rf -- "$STAGE"
}
trap cleanup EXIT
help_text() {
  cat <<'HELP'
LaunchAnything macOS installer / macOS 安装助手
  --check --json      Read-only, agent-readable readiness status
  --plan              Read-only action plan
  --install --yes     Install missing user-local Node 22 and Rust, build and install
  --no-launch         Finish without opening the app
  --intel-preview     Opt in to unverified Intel x86_64 branch
  --ref REF           Official repository branch/tag/SHA, default main
  --help              Display this help
Agent flow: --check --json; --plan; --install --yes --no-launch
Exit 20: user must finish Apple's native Xcode CLT dialog or quit running APP; retry.
Exit 21: unsupported OS/CPU; 22: consent; 23: download; 24: build; 25: install.
Location: ~/Applications/LaunchAnything.app
HELP
}
while (( $# )); do
  case "$1" in
    --help|-h) MODE=help;;
    --check) MODE=check;;
    --plan) MODE=plan;;
    --install) MODE=install;;
    --json) JSON=1;;
    --yes) YES=1;;
    --no-launch) NO_LAUNCH=1;;
    --intel-preview) INTEL=1;;
    --ref)
      (( $# >= 2 )) || error 2 INVALID_ARGUMENT "--ref requires a value"
      REF="$2"; REF_SET=1; shift;;
    *) error 2 INVALID_ARGUMENT "Unknown option: $1";;
  esac
  shift
done
[[ "$MODE" != help ]] || { help_text; exit 0; }
[[ "$JSON" == 0 || "$MODE" == check ]] || error 2 INVALID_ARGUMENT "--json needs --check"
[[ "$REF" =~ ^[a-zA-Z0-9._/-]+$ && "$REF" != *..* && "$REF" != /* && "$REF" != -* ]] ||
  error 2 INVALID_REF "Unsafe or invalid GitHub ref"
if [[ "$INTEL" == 1 && "$REF_SET" == 0 ]]; then REF=feat/macos-intel-x64; fi
OS="$(uname -s)"; ARCH="$(uname -m)"
if [[ -x "$NODE_HOME/bin/node" ]]; then export PATH="$NODE_HOME/bin:$PATH"; fi
if [[ -f "$HOME/.cargo/env" ]]; then
  source "$HOME/.cargo/env"
elif [[ -d "$HOME/.cargo/bin" ]]; then
  export PATH="$HOME/.cargo/bin:$PATH"
fi
node_ready() {
  command -v node >/dev/null 2>&1 || return 1
  local major
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)" || return 1
  [[ "$major" =~ ^[0-9]+$ ]] && (( major >= 22 ))
}
rust_ready() {
  command -v cargo >/dev/null 2>&1 && command -v rustc >/dev/null 2>&1 &&
    cargo --version >/dev/null 2>&1 && rustc --version >/dev/null 2>&1
}
swift_ready() { command -v xcrun >/dev/null 2>&1 && xcrun --find swiftc >/dev/null 2>&1; }
supported=0
[[ "$OS" == Darwin && "$ARCH" == arm64 ]] && supported=1 || :
[[ "$OS" == Darwin && "$ARCH" == x86_64 && "$INTEL" == 1 ]] && supported=1 || :
swift_ok=0; swift_ready && swift_ok=1 || :
node_ok=0; node_ready && node_ok=1 || :
rust_ok=0; rust_ready && rust_ok=1 || :
app_ok=0; [[ -d "$APP/Contents" ]] && app_ok=1 || :
bool() { [[ "$1" == 1 ]] && printf true || printf false; }
if [[ "$MODE" == check ]]; then
  if [[ "$JSON" == 1 ]]; then
    printf '{"schemaVersion":1,"platform":"%s","architecture":"%s","supported":%s,"xcodeToolsReady":%s,"nodeReady":%s,"rustReady":%s,"appInstalled":%s,"needsUserAction":%s}\n' \
      "$OS" "$ARCH" "$(bool "$supported")" "$(bool "$swift_ok")" \
      "$(bool "$node_ok")" "$(bool "$rust_ok")" "$(bool "$app_ok")" \
      "$(bool "$((supported && !swift_ok))")"
  else
    log "OS=$OS/$ARCH supported=$supported swift=$swift_ok node=$node_ok rust=$rust_ok app=$app_ok"
  fi
  exit 0
fi
if [[ "$MODE" == plan ]]; then
  log "PLAN: check Apple CPU and Swift/Xcode CLT; missing CLT requires user dialog."
  log "PLAN: install Node 22 with nodejs.org SHA256 and Rust stable via rustup if missing."
  log "PLAN: resolve official GitHub $REF to immutable SHA; download source; compile Tauri."
  log "PLAN: verify arm64/x86_64 Mach-O, back up prior APP, install to ~/Applications."
  exit 0
fi
[[ "$supported" == 1 ]] || error 21 UNSUPPORTED_PLATFORM \
  "Stable installer supports macOS arm64; Intel needs --intel-preview; Windows is separate."
[[ "$INTEL" != 1 ]] || log "WARNING: Intel preview is unverified on real Intel devices."
if [[ "$YES" != 1 ]]; then
  [[ -t 0 ]] || error 22 CONSENT_REQUIRED "Obtain user consent, then use --yes."
  log "Install user-local toolchains and compile APP without sudo. Proceed? [y/N]"
  read -r answer || error 22 CONSENT_REQUIRED "Confirmation missing"
  [[ "$answer" =~ ^[yY]([eE][sS])?$ ]] || error 22 CONSENT_REQUIRED "User declined"
fi
if ! swift_ready; then
  log "Apple Xcode Command Line Tools missing; requesting macOS installation dialog."
  if command -v xcode-select >/dev/null 2>&1; then xcode-select --install >&2 || :; fi
  error 20 USER_ACTION_REQUIRED "Confirm Apple's CLT dialog; wait until finished and rerun same command."
fi
for tool in curl tar shasum ditto; do
  command -v "$tool" >/dev/null 2>&1 || error 23 MISSING_SYSTEM_TOOL "Missing $tool"
done
mkdir -p "$STATE" "$CACHE" "$HOME/Applications"
TEMP="$(mktemp -d "${TMPDIR:-/tmp}/launchanything.XXXXXXXX")"
LOGFILE="$STATE/installer-last.log"
fetch() {
  local url="$1" output="$2"
  log "Downloading: $url"
  curl --proto '=https' --tlsv1.2 --fail --silent --show-error --location \
    --retry 3 --connect-timeout 20 --max-time 240 "$url" --output "$output" ||
    error 23 DOWNLOAD_FAILED "Could not fetch $url; check network or proxy"
}
if ! node_ready; then
  fetch "https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt" "$TEMP/SHASUMS256.txt"
  asset="$(awk -v arch="$ARCH" '$2 ~ ("^node-v22\\.[0-9]+\\.[0-9]+-darwin-" arch "\\.tar\\.gz$") {print $2; exit}' "$TEMP/SHASUMS256.txt")"
  [[ -n "$asset" ]] || error 23 NODE_ASSET_NOT_FOUND "No official v22 tar archive for $ARCH"
  expected="$(awk -v name="$asset" '$2 == name {print $1; exit}' "$TEMP/SHASUMS256.txt")"
  [[ "$expected" =~ ^[a-fA-F0-9]{64}$ ]] || error 23 NODE_HASH_INVALID "Official SHA256 unavailable"
  fetch "https://nodejs.org/dist/latest-v22.x/$asset" "$TEMP/$asset"
  (cd "$TEMP" && printf '%s  %s\n' "$expected" "$asset" | shasum -a 256 -c -) ||
    error 23 NODE_CHECKSUM_MISMATCH "Downloaded Node archive failed official SHA256"
  mkdir -p "$TEMP/node"
  tar -xzf "$TEMP/$asset" -C "$TEMP/node" ||
    error 23 NODE_EXTRACT_FAILED "Verified Node archive could not be unpacked"
  unpacked="$TEMP/node/${asset%.tar.gz}"
  [[ -x "$unpacked/bin/node" ]] || error 23 NODE_EXTRACT_FAILED "Node executable missing"
  staged="$STATE/.node-new-$$"
  mv "$unpacked" "$staged"
  if [[ -e "$NODE_HOME" ]]; then mv "$NODE_HOME" "$STATE/node22-backup-$(date +%Y%m%d%H%M%S)-$$"; fi
  mv "$staged" "$NODE_HOME"
  export PATH="$NODE_HOME/bin:$PATH"
fi
node_ready || error 24 NODE_NOT_READY "Node 22+ unavailable"
command -v npm >/dev/null 2>&1 || error 24 NPM_NOT_READY "npm missing"
if ! rust_ready; then
  fetch "https://sh.rustup.rs" "$TEMP/rustup.sh"
  sh "$TEMP/rustup.sh" -y --profile minimal --default-toolchain stable ||
    error 24 RUSTUP_FAILED "Rustup installer failed"
  [[ ! -f "$HOME/.cargo/env" ]] || source "$HOME/.cargo/env"
fi
rust_ready || error 24 RUST_NOT_READY "cargo or rustc unavailable"
if [[ "$ARCH" == x86_64 ]]; then
  command -v rustup >/dev/null 2>&1 || error 24 RUSTUP_MISSING "Intel target requires rustup"
  rustup target add x86_64-apple-darwin || error 24 RUST_TARGET_FAILED "Intel Rust target missing"
fi
fetch "https://api.github.com/repos/$REPOSITORY/commits/$REF" "$TEMP/commit.json"
commit="$(sed -n 's/^[[:space:]]*"sha": "\([0-9a-f]\{40\}\)".*/\1/p' "$TEMP/commit.json" | sed -n '1p')"
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] ||
  error 23 INVALID_COMMIT_RESPONSE "Cannot establish immutable GitHub source SHA"
log "Building official source SHA $commit"
fetch "https://codeload.github.com/$REPOSITORY/tar.gz/$commit" "$TEMP/source.tar.gz"
mkdir -p "$TEMP/unpack"
tar -xzf "$TEMP/source.tar.gz" -C "$TEMP/unpack" ||
  error 23 SOURCE_EXTRACT_FAILED "Cannot unpack source archive"
source_dir="$(find "$TEMP/unpack" -mindepth 1 -maxdepth 1 -type d -print -quit)"
[[ -n "$source_dir" && -f "$source_dir/package.json" && -f "$source_dir/src-tauri/tauri.conf.json" ]] ||
  error 23 INVALID_SOURCE "Expected application source is missing"
build_dir="$CACHE/build/$commit"
mkdir -p "$build_dir"
ditto "$source_dir" "$build_dir" || error 25 STAGING_FAILED "Cannot copy source for build"
if [[ "$ARCH" == arm64 ]]; then
  build_script=build
  bundle="$build_dir/src-tauri/target/release/bundle/macos/LaunchAnything.app"
else
  build_script=build:macos-intel
  bundle="$build_dir/src-tauri/target/x86_64-apple-darwin/release/bundle/macos/LaunchAnything.app"
  node -e 'if(!require(process.argv[1]).scripts["build:macos-intel"]) process.exit(1)' "$build_dir/package.json" ||
    error 21 INTEL_PREVIEW_UNAVAILABLE "Ref does not provide Intel build script"
fi
log "Starting first local build (may take 10–30+ minutes); log: $LOGFILE"
(cd "$build_dir" && npm install --no-audit --no-fund && npm run "$build_script") 2>&1 | tee "$LOGFILE" ||
  error 24 BUILD_FAILED "Tauri failed; inspect log and rerun"
[[ -d "$bundle/Contents" ]] || error 24 MISSING_APP_BUNDLE "No application bundle"
helper="$bundle/Contents/Resources/bin/launchanything-macos-helper"
[[ -f "$helper" ]] || error 24 MISSING_NATIVE_HELPER "Bundled Swift helper missing"
app_bin="$(find "$bundle/Contents/MacOS" -maxdepth 1 -type f -print -quit)"
[[ -n "$app_bin" ]] || error 24 MISSING_APP_EXECUTABLE "Missing native executable"
for binary in "$app_bin" "$helper"; do
  xcrun lipo "$binary" -verify_arch "$ARCH" ||
    error 24 WRONG_ARCH "Invalid native architecture: $binary"
done
if command -v pgrep >/dev/null 2>&1; then
  if pgrep -x LaunchAnything >/dev/null 2>&1 || pgrep -x launchanything >/dev/null 2>&1; then
    error 20 APP_IS_RUNNING "Quit the running application; rerun to replace it"
  fi
fi
[[ ! -L "$APP" ]] || error 25 UNSAFE_APP_DESTINATION "Cannot overwrite symlink at APP destination"
STAGE="$(mktemp -d "$HOME/Applications/.launchanything-new.XXXXXX")"
ditto "$bundle" "$STAGE/LaunchAnything.app" ||
  error 25 STAGING_FAILED "Cannot stage app"
backup=""
if [[ -e "$APP" ]]; then
  backup="$HOME/Applications/LaunchAnything.backup.$(date +%Y%m%d%H%M%S)-$$.app"
  mv "$APP" "$backup" || error 25 BACKUP_FAILED "Cannot save prior app"
fi
if ! mv "$STAGE/LaunchAnything.app" "$APP"; then
  if [[ -n "$backup" && ! -e "$APP" ]]; then mv "$backup" "$APP" || :; fi
  error 25 INSTALL_FAILED "Failed app installation; old version restored where possible"
fi
printf 'commit=%s\nref=%s\narch=%s\napp=%s\n' "$commit" "$REF" "$ARCH" "$APP" > "$STATE/install-receipt.txt"
log "SUCCESS[INSTALLED]: $APP"
log "Source SHA: $commit"
if [[ -n "$backup" ]]; then log "Previous app backup: $backup"; fi
if [[ "$NO_LAUNCH" != 1 ]]; then
  open "$APP" || error 25 OPEN_FAILED "Installed but could not open app automatically"
fi
