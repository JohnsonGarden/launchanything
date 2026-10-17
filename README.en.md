# LaunchAnything

**One launchpad. Launch desktop apps with the proxy you choose.**

[**简体中文**](README.md) · [**English**](README.en.md) · [Downloads & versions](https://github.com/JohnsonGarden/launchanything/releases) · [Report an issue](https://github.com/JohnsonGarden/launchanything/issues) · [MIT License](LICENSE)

[![macOS CI](https://github.com/JohnsonGarden/launchanything/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/JohnsonGarden/launchanything/actions/workflows/ci.yml)

LaunchAnything is a **lightweight, privacy-first, cross-platform desktop proxy launcher**. Assign reusable local HTTP / SOCKS5 profiles to individual apps and start them with the chosen proxy settings **without changing the system-wide proxy**. Its React, TypeScript, Tailwind and shadcn-style UI has a minimal rose theme and instant Simplified Chinese / English switching.

> **Release status — October 17, 2026:** Apple Silicon and native Intel macOS builds have both passed basic on-device installation and proxy-launch testing. [v0.1.0-preview.2](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.2) provides separate **unsigned, unnotarized DMGs** and fixes the two native-look dropdowns. **This is a developer Pre-release, NOT a signed Stable Release.** Windows x64 remains an unsigned Actions artifact only; no Windows Release is published.

## Download and install
> **Prebuilt macOS developer DMGs:** [Apple Silicon arm64](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.2/LaunchAnything_v0.1.0_preview2_macos_arm64_UNSIGNED.dmg) · [Intel x86_64](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.2/LaunchAnything_v0.1.0_preview2_macos_x86_64_UNSIGNED.dmg) · [Release notes and checksums](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.2). Pick the correct CPU architecture. Both are unsigned and unnotarized; read [Preview 2 installation notes](docs/releases/public-preview-v0.1.0-preview2.md) before running.


> Historical GitHub Actions artifacts are still available for debugging. Prefer the immutable public Pre-release assets and checksums for normal testing, and do not disable macOS security protections globally.

### One-command Mac installation

**macOS Apple Silicon (M-series) users can install from the official source without first installing Git, Homebrew, Node.js or Rust.**

```bash
INSTALLER="$(mktemp "${TMPDIR:-/tmp}/launchanything-installer.XXXXXXXX")" && curl --proto '=https' --tlsv1.2 -fsSL https://raw.githubusercontent.com/JohnsonGarden/launchanything/main/scripts/install-macos.sh -o "$INSTALLER" && bash "$INSTALLER" --install --yes
```

With user authorization, this script checks the Mac architecture and prerequisites, installs user-local Node.js 22 (official SHA-256 verified) and Rust if missing, builds an immutable GitHub commit of LaunchAnything and copies the APP into **`~/Applications/LaunchAnything.app`**, then launches it. **This is a local source build, NOT a signed or notarized DMG.** The first native build may require 10–30+ minutes and multiple GB of disk space.

If **Xcode Command Line Tools** are missing, macOS displays Apple's standard installation dialog, which **the user must approve**. Wait for it to finish and **rerun the same command**. No sudo, Gatekeeper bypass or system-wide proxy changes are needed.

Review the [installer source](scripts/install-macos.sh) before executing remote code. `--yes` authorizes user-local dependency installation. For Codex, Claude Code and other Agents, inspect `bash "$INSTALLER" --check --json` and `--plan` first, then run `--install --yes --no-launch` with approval. Exit `20` indicates a necessary user interaction; retry afterward. See the bilingual [Agent installation runbook](docs/AGENT_INSTALL.md).

> Intel Macs require `--intel-preview` for the unverified experimental branch. Windows has its own development installer and **must not** use this macOS Bash script. Apple Silicon users can already download the [unsigned public Pre-release](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.1); a signed stable build is planned for later.

**For users who prefer a prebuilt installer:** Download the current unsigned Apple Silicon developer preview directly from [GitHub Releases](https://github.com/JohnsonGarden/launchanything/releases). No Rust, Node.js or local build is needed. Intel and Windows are still in separate development tracks.

| Platform | Availability | Build and verification |
|---|---|---|
| **macOS Apple Silicon (arm64)** | **Public unsigned Pre-release** | [Preview 2 DMG](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.2/LaunchAnything_v0.1.0_preview2_macos_arm64_UNSIGNED.dmg), [Preview 1 history](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.1) |
| **macOS Intel (x86_64)** | **Public unsigned Pre-release** | [Preview 2 DMG](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.2/LaunchAnything_v0.1.0_preview2_macos_x86_64_UNSIGNED.dmg); [prior Intel CI](https://github.com/JohnsonGarden/launchanything/actions/runs/38745634965) |
| **Windows 10/11 x64** | **CI-only unsigned testing; no Release** | [Updated test build](https://github.com/JohnsonGarden/launchanything/actions/runs/39000990367); [prior Windows CI](https://github.com/JohnsonGarden/launchanything/actions/runs/38745714406); [PR #4](https://github.com/JohnsonGarden/launchanything/pull/4) |
| Linux | Not supported | No Linux client |

### Preview the Windows / Intel development builds
> **Updated Intel Mac preview:** Native x86_64 [GitHub Actions workflow](https://github.com/JohnsonGarden/launchanything/actions/workflows/macos-intel-preview.yml) integrates the latest mainline UI and app picker, producing an unsigned Intel DMG and ZIP. The build requires [real Intel Mac acceptance](docs/INTEL_PREVIEW.md) before it can be called stable.


The build artifacts are available in the **Artifacts** section at the bottom of the Intel and Windows CI run pages linked above:

- Intel: `LaunchAnything-macos-intel-unsigned`
- Windows: `LaunchAnything-windows-x64-unsigned`

GitHub Actions downloads require a GitHub account, and current artifact retention is **7 days**. These are **not production releases**: the Intel app is not Apple-notarized; the unsigned Windows installer may trigger Microsoft SmartScreen. Test only if you understand the implications and trust the build provenance; do not disable security checks casually.

## Features

- **Application launchpad:** a remembered proxy per app. Stable macOS accepts `.app` bundles; the Windows development branch accepts `.exe` files.
- **Reusable proxy profiles:** HTTP / SOCKS5, local or remote host and port, bypass hosts.
- **Three launch modes:** environment variables, Chromium / Electron flags, or combined.
- **Native process launching:** Rust validates requests; macOS uses Swift/AppKit LaunchServices; the Windows branch uses native Windows process creation.
- **Safer defaults:** refuse to launch when a proxy TCP port is unreachable; isolate inherited proxy environment; guard against silently reusing an already-running target.
- **Local-first:** versioned on-device JSON settings; no account and no telemetry.
- **Bilingual and efficient:** persistent 简体中文 / English selection; Mac shortcuts `⌘ K` to search and `⌘ N` to add an app.

## Everyday use

1. Start a local HTTP or SOCKS5 listener in Shadowrocket, Clash, v2rayN, Xray or another proxy client.
2. In **Proxy profiles**, enter the actual protocol, host and port, then test local TCP connectivity.
3. Add the target application, assign its proxy and choose a launch mode. **Fully quit the app and its background processes** before launching it with LaunchAnything.
4. Verify real proxy behavior using the target application's network logs, requests or egress IP.

| Launch mode | Injected settings | Best for |
|---|---|---|
| Environment | `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, etc. | Programs and child processes that respect proxy environment variables |
| Chromium flags | `--proxy-server`, `--proxy-bypass-list` | Chromium / Electron applications honoring startup flags |
| Combined | Both | Testing compatibility with mixed networking stacks; **not transparent enforcement** |

**SOCKS5 compatibility:** Some applications support `socks5h://` to request proxy-side DNS, whereas Chromium expects `socks5://`. Certain Electron components reject `socks5h://`; an independently verified local HTTP / mixed proxy listener may work better for those apps. See the [Antigravity proxy compatibility notes](docs/antigravity-proxy.md).

**Limitations:** A reachable TCP port and a successfully started process do **not** prove that all application traffic uses the configured proxy. LaunchAnything is not a VPN, firewall, transparent proxy or traffic interception system, and it does not change global proxy settings or install a network extension.

## Developers: run from source

This section is for contributors. **Apple Silicon developer testers can use the unsigned downloadable Pre-release; ordinary users should prefer a future signed/notarized Stable Release.**

### macOS Apple Silicon (current `main`)

Requires macOS 12+, Node.js 22+, stable Rust and Xcode Command Line Tools. Install missing prerequisites only:

```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
npm install
npm run doctor
npm run dev
```

Use the **separate native LaunchAnything window** opened by `npm run dev`. Chrome at `http://127.0.0.1:1420` only renders Vite; it cannot access Tauri native settings or launch IPC.

Build an unsigned local `.app` / `.dmg`:

```bash
npm run build
```

### macOS Intel (development branch)

```bash
git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
git switch --track origin/feat/macos-intel-x64
npm install
rustup target add x86_64-apple-darwin
npm run build:macos-intel
npm run verify:macos-intel
```

Requires the Apple developer command-line tools, Node.js 22+ and Rust on an Intel Mac. See the [Intel build guide](https://github.com/JohnsonGarden/launchanything/blob/feat/macos-intel-x64/docs/platforms/macos-intel.md).

### Windows 10/11 x64 (development branch)

Use PowerShell with Node.js 22+, Rust MSVC, Visual Studio C++ Build Tools / Windows SDK and WebView2 Runtime:

```powershell
git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
git switch --track origin/feat/windows-x64-launcher
npm install
npm run doctor:windows
npm run dev:windows
# Or create an unsigned NSIS setup.exe:
npm run build:windows
```

See the [Windows build guide](https://github.com/JohnsonGarden/launchanything/blob/feat/windows-x64-launcher/docs/platforms/windows-x64.md).

### Tests and architecture

```bash
npm run doctor
npm run test:doctor
npm run test:release-contract
npm run typecheck
npm test
npm run test:rust
npm run prepare:macos
npm run test:macos-launch
npm run build
```

Stack: **Tauri 2.12 / Rust, Swift/AppKit on macOS or native Windows APIs, React 19 / TypeScript / Tailwind / Radix (shadcn conventions)**. Development follows **SDD + TDD**: specification and acceptance criteria, tests, implementation and refactoring, CI, then physical-device verification.

Documentation: [Architecture and security](docs/architecture.md) · [Test strategy](docs/test-plan.md) · [Engineering contract](AGENTS.md) · [Theme tokens](docs/design/color-tokens.md) · [Release and signing plan](docs/RELEASING.md).

## Branch and release policy

- `main`: accepted stable Apple Silicon source baseline; unverified platform features do not merge into it.
- `dev`: integration baseline kept in sync with stable main.
- [Intel PR #3](https://github.com/JohnsonGarden/launchanything/pull/3) and [Windows PR #4](https://github.com/JohnsonGarden/launchanything/pull/4): native CI passed; still Draft pending real-device testing.
- **Releases:** manually build a macOS arm64 Draft Release from `main` first; inspect installer, SHA256, signing and notarization status before public release. **An unsigned Apple Silicon Pre-release is public; no signed Stable Release exists yet.**

**Privacy:** Never post access tokens, cookies, credentials or raw sensitive logs in Issues. The macOS launch helper must run outside App Sandbox to inject new-process settings. Cloud sync, credential storage and forced packet interception are not part of this version.

[MIT License](LICENSE) · [Open an issue](https://github.com/JohnsonGarden/launchanything/issues)
