# LaunchAnything

**One place. Every app. Your proxy.** A polished, local-first macOS launcher that starts individual applications with HTTP or SOCKS5 proxy settings, without changing your system-wide proxy.

> **Status: 0.1.0 / first engineering slice.** Source is ready for macOS CI and manual verification. It is **not** a transparent per-app tunnel and does not promise to proxy every application. See the [compatibility and threat model](docs/specs/001-mvp.md).

## What it does

- Save `.app` bundles and assign each to a reusable proxy profile.
- Manage HTTP or SOCKS5 endpoints, including bypass patterns.
- Select per-app startup mode: standard proxy **environment variables**, **Chromium/Electron flags**, or **both**.
- Launch using macOS `NSWorkspace.OpenConfiguration` via a small native Swift helper.
- Check proxy TCP port reachability before launching (fail closed if the port is unavailable).
- Reject launches when a target app is already running, avoiding silently ignored new settings.
- Keep profiles and paths in local, atomic JSON settings. No account, analytics or remote sync.
- Search with **⌘K** and add an app with **⌘N**.

## Requirements

- macOS 12+ (Apple Silicon / Intel), Xcode Command Line Tools (`xcode-select --install`), Rust stable, Node 22+.
- A **separate, running proxy client** exposing an HTTP or SOCKS5 TCP listening port, e.g. Shadowrocket or Clash.
- App runs **outside the App Sandbox**: Apple documents that sandboxed callers cannot pass `OpenConfiguration.environment`. The project does not request network interception entitlements.

## Get started (macOS)

Before installing Node dependencies, make sure your Mac has **Node.js 22+**, the **Rust stable toolchain** (Cargo + rustc), and **Xcode Command Line Tools**. Tauri needs all three; an error containing `cargo metadata ... No such file or directory` most commonly means `cargo` is missing or not on your `PATH`.

```bash
# macOS Swift compiler; skip if already installed
xcode-select --install

# Official Rustup installer; follow the default interactive prompts
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Confirm native prerequisites
cargo --version
rustc --version
xcrun --find swiftc

git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
git switch feat/macos-proxy-launcher-mvp  # while PR #1 is still under review

npm install
npm run doctor
npm run dev
```

`npm run dev` and `npm run build` run the environment check automatically. No elevated privileges are needed for the check itself.

**Already cloned the repo?** Stay in its directory, install Rust and `source "$HOME/.cargo/env"`, then retry `npm run dev`. No need to reinstall npm dependencies.

**Common non-errors:** `npm install` may create an untracked `package-lock.json`—it does not cause Cargo errors, and `git add` without a path simply stages nothing. An npm `allow-scripts` warning is separate; review individual packages before approving any install scripts. If a later Vite/esbuild command fails due to blocked postinstall scripts, investigate that independently.

To build an `.app` / `.dmg` on your Mac:

```bash
npm run build
```

The macOS prepare script creates app icons and compiles the Swift LaunchServices helper. Do not run the release `.app` until the package has been properly verified/signed for your distribution scenario.

## Daily use

1. Ensure your proxy client has an actual HTTP or SOCKS5 listener enabled. In **Proxy profiles**, edit the prefilled `127.0.0.1:7890` to match your client (the default is an example, not an auto-detected port).
2. Test the TCP port. **Reachable** is not equivalent to **traffic successfully proxied**.
3. Select **Add application**, choose a `.app` bundle, then choose its proxy and launch method.
4. **Completely quit the target app** if it is already running. Click **Launch**.
5. Verify behavior from the *target app* (or its network diagnostics). For high assurance, use packet inspection or supported OS-level per-app proxy routing.

### Choosing a launch method

| Mode | Works when | Caveat |
|---|---|---|
| Environment | App honors `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` | Many GUI clients ignore these. |
| Chromium flags | Chromium/Electron process honors `--proxy-server` and `--proxy-bypass-list` | Browser profiles, extensions, DNS, QUIC or existing helper processes may affect results. |
| Combined | App uses both styles | Does not guarantee all traffic follows either setting. |

SOCKS5 environment URLs use `socks5h://` for clients supporting remote DNS. Proxy bypass is application-dependent. No proxy credential storage is provided in v0.1.

Some Electron components read `HTTPS_PROXY` and pass it to Electron's proxy API,
which does not accept `socks5h://`, even when Chromium flags are also present.
Use an independently verified HTTP/mixed listener with an HTTP profile for those
apps. Chromium-only mode clears inherited proxy variables; its flags do not
configure independent child processes. Omitted bypass variables are also cleared,
so an empty bypass list does not reuse the launching terminal's settings.
See [Antigravity diagnosis / 代理诊断](docs/antigravity-proxy.md) for the separate
updater compatibility and Agent location-rejection findings.

## Engineering

- [Product spec & acceptance criteria](docs/specs/001-mvp.md) — SDD contract
- [Architecture and threat model](docs/architecture.md)
- [Architecture decision record](docs/adr/0001-tauri-swift.md)
- [Test strategy / manual macOS checks](docs/test-plan.md)
- [Contributor & agent guidelines](AGENTS.md)

```bash
npm run doctor
npm run test:doctor
npm run typecheck
npm test
npm run test:rust
npm run test:macos-launch
```

macOS CI runs TypeScript tests, Rust tests, Swift compilation, and frontend build. Linux-only development hosts cannot build or exercise the macOS-specific helper; please do not mistake a static review for a verified macOS runtime test.

## Scope boundaries

LaunchAnything configures **process startup**, not arbitrary kernel-level traffic capture. Native apps using `Network.framework`, embedded URLSession sessions, direct sockets or proprietary networking may ignore the settings. True transparent per-app routing would require a separately specified and permissioned Network Extension/TUN implementation. See `docs/specs/001-mvp.md` for deferred capabilities.

MIT © 2026 JohnsonGarden contributors.

## Appearance and languages

The warm rose color system is derived from the project owner's MiMo TTS reference screenshots and defined through semantic Tailwind/shadcn tokens (`src/styles.css`). The UI supports Simplified Chinese and English: use the **中文 / EN** switch in the top-right. It defaults to the macOS UI language on first launch and remembers the choice locally; no proxy settings are changed by switching languages. See `docs/specs/002-rose-theme-bilingual.md`.
