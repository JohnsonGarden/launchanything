# LaunchAnything

**One launchpad. Your apps. Your proxy configuration.**

[简体中文](README.md) · [English](README.en.md) · [Report an issue](https://github.com/JohnsonGarden/launchanything/issues) · [License](LICENSE)

LaunchAnything is a lightweight, privacy-first desktop launcher for starting individual applications with reusable HTTP or SOCKS5 proxy settings **without changing the system-wide proxy**. Its interface uses React, TypeScript, Tailwind and shadcn-style components with a warm rose theme and instant Simplified Chinese / English switching.

> **Current stable baseline: v0.1.0 (macOS Apple Silicon).** App startup, configuration and TCP port checks have been exercised on a real Apple Silicon Mac, and macOS CI passed. This is **not a VPN**, and it cannot guarantee all traffic from every app uses the proxy. Intel Mac and Windows clients are developed on separate branches; signed, notarized installers have **not** been released.

## Features

- **App launchpad:** save `.app` bundles and launch them with remembered proxy and startup mode.
- **Proxy profiles:** HTTP and SOCKS5 endpoints, host/port, and optional bypass entries.
- **Three launch modes:** environment variables, Chromium flags, or both.
- **Native process startup:** validated Rust commands and a Swift/AppKit `NSWorkspace.OpenConfiguration` helper return a macOS-confirmed PID.
- **Fail-safe checks:** reject a launch when its local proxy TCP port is unreachable or the app is already running; clear stale inherited proxy variables.
- **Local-first storage:** versioned on-device JSON config, no account and no analytics.
- **Fast UX:** `⌘ K` to search, `⌘ N` to add an app, persistent 中文 / EN language control.

## Platform status

| Platform | Status | Notes |
|---|---|---|
| macOS Apple Silicon | **Available / real-device feedback** | Stable code baseline; unsigned local builds |
| macOS Intel (x86_64) | **In development** | Independent build, native-helper and packaging verification |
| Windows x64 | **In development** | Independent native process launcher, .exe packaging, CI and tests |
| Linux | Not planned | Not supported |

## Run locally on macOS

Requirements: macOS 12+, **Node.js 22+**, stable Rust (`cargo` and `rustc`), Xcode Command Line Tools and a separate, running proxy client with a local HTTP or SOCKS5 listener (such as Shadowrocket, Clash or Xray).

```bash
# Skip this if Apple Command Line Tools are already installed
xcode-select --install

# Official Rust toolchain installer (if Rust isn't installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
npm install
npm run doctor
npm run dev
```

Use the **separate LaunchAnything desktop window** that appears after `npm run dev`. `http://127.0.0.1:1420` opened in Chrome is only Vite's browser preview; it cannot access Tauri native IPC or real settings. The first Rust build may take some time.

Build a local `.app` / `.dmg` (signing and notarization not configured):

```bash
npm run build
```

In daily use, start your proxy client and verify its listener; configure the matching protocol/host/port under **Proxy profiles**, then add a `.app` with a selected proxy and launch mode. **Fully quit the target app first**. A reachable TCP port and returned process ID are **not proof** that every destination request was proxied.

### Which launch mode?

| Mode | Injected settings | Appropriate for |
|---|---|---|
| Environment | `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, etc. | Clients that explicitly respect proxy environment variables |
| Chromium flags | `--proxy-server`, `--proxy-bypass-list` | Chromium/Electron apps that accept startup flags |
| Combined | Both | Mixed network stacks; **not transparent routing enforcement** |

**SOCKS5 compatibility:** Generic environment URLs use `socks5h://` to request proxy-side DNS in compatible clients, while Chromium flags use `socks5://`. Some Electron components reject `socks5h://`. For such apps, use a separately verified HTTP/mixed listener and a dedicated HTTP profile. See the [Antigravity case study](docs/antigravity-proxy.md). Independently verify child-process traffic, authentication and destination-specific restrictions.

## Engineering and verification

```bash
npm run doctor
npm run test:doctor
npm run typecheck
npm test
npm run test:rust
npm run prepare:macos
npm run test:macos-launch
```

Stack: **Tauri 2 + Rust** for validated commands, configuration and TCP checks; **Swift/AppKit** for macOS LaunchServices; **React 19 + TypeScript + Tailwind / Radix** for the shadcn UI conventions. We use **SDD + TDD**: write a verifiable specification and failing tests, then implement, refactor, run CI and conduct manual smoke testing.

- [Requirements and acceptance](docs/specs/001-mvp.md) · [Architecture / security boundaries](docs/architecture.md)
- [Architecture decision record](docs/adr/0001-tauri-swift.md) · [Test strategy](docs/test-plan.md)
- [Theme tokens](docs/design/color-tokens.md) · [Bilingual UI spec](docs/specs/002-rose-theme-bilingual.md)
- [Contributor / AI agent contract](AGENTS.md)

### Branch workflow

- `main`: accepted stable baseline; unverified platform functionality stays off this branch.
- `dev`: integration starting point synchronized with the stable baseline as needed.
- `feat/windows-x64-launcher`, `feat/macos-intel-x64`: independent branches based on `main`, merged only after separate PR reviews.

## Security, privacy and limitations

LaunchAnything provides **per-process startup configuration**, not transparent tunneling, a firewall or a VPN. An app can ignore environment variables/Chromium flags, use its own sockets or helper processes, reuse an existing process, or route DNS/QUIC differently. TCP checks validate only a listening port; they do not prove an HTTP/SOCKS handshake, egress IP, TLS, authentication or app-level routing. Verify actual behavior using the destination app and network diagnostics.

The macOS helper must run without App Sandbox for injected startup environments; the app does not edit system proxy settings or install a network extension. Never commit access tokens, cookies, credentials or sensitive raw logs. Account sync, credential storage, transparent traffic interception and signed releases are out of scope for v0.1.

**License:** [MIT](LICENSE). Reproducible compatibility issues are welcome.
