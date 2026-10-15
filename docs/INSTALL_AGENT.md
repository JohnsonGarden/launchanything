# LaunchAnything AI Agent Installation Runbook / AI Agent 自动安装手册

## Supported platform / 支持平台

- Stable installer: **macOS Apple Silicon arm64**, from reviewed `main` source.
- macOS Intel and Windows are independent unverified feature branches. **Do not** run this installer on them.
- This builds from source and installs into `~/Applications`. It does not require Developer ID notarization, but the resulting app is **unsigned**, and macOS security notices may still apply.

## Quick install / 快捷安装

Inspect [bootstrap](../scripts/bootstrap-macos.sh) and [installer](../scripts/install-macos.sh) source before running a remote installer.

```bash
curl --proto '=https' --tlsv1.2 -fsSLo /tmp/launchanything-bootstrap.sh https://raw.githubusercontent.com/JohnsonGarden/launchanything/main/scripts/bootstrap-macos.sh && bash /tmp/launchanything-bootstrap.sh
```

The bootstrap downloads `main` via HTTPS into `~/Library/Application Support/LaunchAnything/source` and invokes `scripts/install-macos.sh`. It refuses to overwrite an existing source directory. Reusing that directory requires the user or Agent to inspect it first.

## Agent protocol / Agent 连续执行流程

1. **Consent**: explain that dependencies (Rust, Node, Apple CLT) and an unsigned app may be installed; ask approval before changes. `--yes` is allowed only once the user explicitly authorizes the described actions and any existing-app replacement.
2. **System inspection**: use `uname -s`, `uname -m`, `sw_vers`; reject non-macOS-arm64.
3. **Provenance**: obtain the GitHub source over HTTPS, inspect scripts and record the exact source SHA when possible. Mutable `main` is not cryptographically pinned.
4. **Preflight**: run `bash scripts/install-macos.sh --check` and `--dry-run` in checked-out source. These are non-mutating.
5. **Install**: after authorization run `bash scripts/install-macos.sh --yes`. If Xcode Command Line Tools are missing, Apple's UI dialog requires the human to finish before re-running. Never pretend this step is fully unattended.
6. **Dependencies**: Rust comes from official Rustup (downloaded to a temporary file, not piped to the shell). Node 22+ uses existing Homebrew. If Homebrew is missing, stop and request Node or Homebrew installation; do not silently bootstrap extra tools.
7. **Verification**: script runs `npm install`, doctor, frontend tests, `npm run build`, validates bundled Swift helper, copies into `~/Applications/LaunchAnything.app`, preserves a backup if replacing an older version and verifies the final copy.
8. **Launch**: only if approved, use `--launch` or `open "$HOME/Applications/LaunchAnything.app"`.
9. **Report**: versions, source revision, test/build outcome, destination and backup path; redact any tokens, cookies and private logs.
10. **Product acceptance**: confirm app opens and can store proxy profiles, but remind that a TCP check is not proof of all traffic being proxied.

## Recovery table / 故障恢复

| Condition | Action |
|---|---|
| Apple CLT dialog pending | Stop; wait for user to complete; rerun |
| Rust installed but not in PATH | `source "$HOME/.cargo/env"`, verify cargo |
| Node missing and Homebrew absent | Ask user to install Homebrew or Node from official sites |
| Network download blocked | Diagnose HTTPS; do not change system proxy without permission |
| Existing app found | Ask before overwrite, preserve old .app backup |
| Build fails | Collect bounded logs; do not delete preferences or bypass tests |
| Gatekeeper warns on unsigned build | Explain risk; **do not** disable Gatekeeper or auto-remove quarantine |

## Security limits / 安全边界

Never run `sudo`, globally disable Gatekeeper, erase user settings, use secret tokens or silently install other software. The script will stop where Apple requires interactive confirmation. Windows and Intel installers require separate designs and validation.
