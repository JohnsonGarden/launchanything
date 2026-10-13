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

## Get started

```bash
git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
git checkout dev # after this change is merged
npm install
npm run dev
```

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

## Engineering

- [Product spec & acceptance criteria](docs/specs/001-mvp.md) — SDD contract
- [Architecture and threat model](docs/architecture.md)
- [Architecture decision record](docs/adr/0001-tauri-swift.md)
- [Test strategy / manual macOS checks](docs/test-plan.md)
- [Contributor & agent guidelines](AGENTS.md)

```bash
npm run typecheck
npm test
npm run test:rust
```

macOS CI runs TypeScript tests, Rust tests, Swift compilation, and frontend build. Linux-only development hosts cannot build or exercise the macOS-specific helper; please do not mistake a static review for a verified macOS runtime test.

## Scope boundaries

LaunchAnything configures **process startup**, not arbitrary kernel-level traffic capture. Native apps using `Network.framework`, embedded URLSession sessions, direct sockets or proprietary networking may ignore the settings. True transparent per-app routing would require a separately specified and permissioned Network Extension/TUN implementation. See `docs/specs/001-mvp.md` for deferred capabilities.

MIT © 2026 JohnsonGarden contributors.

## Appearance and languages

The warm rose color system is derived from the project owner's MiMo TTS reference screenshots and defined through semantic Tailwind/shadcn tokens (`src/styles.css`). The UI supports Simplified Chinese and English: use the **中文 / EN** switch in the top-right. It defaults to the macOS UI language on first launch and remembers the choice locally; no proxy settings are changed by switching languages. See `docs/specs/002-rose-theme-bilingual.md`.
