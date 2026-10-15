# SDD 010 — Agent-friendly macOS source installer

## Intent
Provide a one-command installation method for nonexpert macOS users **without needing Git, Homebrew, preinstalled Node or Rust**. Agents such as Codex or Claude Code can inspect a read-only JSON prerequisite status, present a plan, and carry out permitted dependency installation and native application build.

## Contract
- `scripts/install-macos.sh --check --json` does not mutate files or access the network. Output one JSON object with platform, CPU, prerequisites, app state, and required user actions. `--plan` is also read-only.
- `--install --yes` explicitly authorizes **user-local** installation of Node 22+ (verified with official SHA-256), stable Rust from official rustup, then the GitHub source archive **resolved to one immutable commit SHA**. Build via npm + Tauri; verify main executable and bundled Swift helper architecture; install into `~/Applications/LaunchAnything.app` and optionally launch.
- Initial Xcode Command Line Tools installation cannot be made unattended. Use Apple's `xcode-select --install` prompt and exit **20 / USER_ACTION_REQUIRED**. Agent must wait for actual user interaction, then rerun the same command; never inject sudo or disable Gatekeeper / quarantine.
- Back up an existing app, keep all settings intact, refuse symlink destinations and running app replacements. Use separate build caches, source SHA receipt and retriable error codes.
- Stable default: macOS Apple Silicon arm64. Intel requires explicit `--intel-preview`, remains experimental until real-device validation. Windows client is separate.
- Include bilingual quick install in README and a specific agent operations runbook. A locally compiled app is **not** a signed/notarized Release; downloads and compilation can take 10–30+ minutes and GB of disk.
- No shell interpolation of untrusted filenames, network proxy interception, secret upload, or surprise system-wide toolchain installation.

## Tests
- Linux-hosted Bash syntax and isolated mock macOS contract tests for no-side-effect checks, JSON, invalid refs, consent, missing CLT user gate, Intel opt-in and proxy/system-safety invariants.
- macOS CI runs the contract, read-only status, Rust, Swift, Vite, and full native app packaging. Actual public-source installation and GUI confirmation still need manual Apple Silicon acceptance, so don't assert full E2E until measured.
