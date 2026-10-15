# TDD validation & release checklist

## Automated

| Test group | Command | Coverage |
|---|---|---|
| TS validation and helper formatting | `npm test` | Port, host, bypass, absolute `.app` path, display output. |
| TS strict types | `npm run typecheck` | Props, JSON DTOs, state flow. |
| Rust pure unit tests | `npm run test:rust` | State invariants, SSRF-like host/path rejection, launch args and SOCKS5 DNS notation. |
| macOS helper compile | `npm run prepare:macos` | Swift/AppKit compile + app icons. |
| Native LaunchServices fixture | `npm run test:macos-launch` | Actual target environment/arguments with poisoned parent proxies; HTTP, SOCKS5 and Chromium-only. Requires a macOS GUI session; skipped on other OSes. |
| Frontend bundle | `npm run web:build` | React/Vite output and toolchain. |

## Manual acceptance on a Mac (required before release)

- [ ] Clone, `npm install`, `npm run dev` opens a stable interactive window.
- [ ] Add/edit/delete profile; state survives quit and restart.
- [ ] Choose `.app` using native file chooser; if app bundles appear as directories, enter absolute path manually.
- [ ] Add/edit/remove app; original `.app` remains untouched.
- [ ] Start local HTTP test proxy, test TCP endpoint, launch an env-aware app; confirm PID.
- [ ] Start SOCKS5 listener, validate env and Chromium scenarios with compatible real targets.
- [ ] Stop listener: verify fail-closed and no target app start.
- [ ] Keep selected app running: verify explicit rejection and no success notification.
- [ ] For each supported target app, independently verify proxy exit IP and DNS; document apps that ignore settings.
- [ ] Verify keyboard shortcuts and accessible focus in dialogs.
- [ ] Build `.app` and `.dmg`, verify resource helper exists and is executable inside bundle.
- [ ] Validate Apple Silicon and Intel behavior, code-signing and notarization before distribution.

## Quality gates

A green CI is necessary but not sufficient for claims about app traffic routing. Mac runtime and each target app's actual networking require separate smoke tests. Preserve failing reproducible cases as tests where deterministic.

## Proxy compatibility regression (SDD-005)

- Before the fix, native Chromium and empty HTTP bypass fixtures failed because
  parent proxy values reached the target; explicit SOCKS5 configuration passed.
- Before implementation, the new bilingual compatibility notice tests failed.
  TSX discovery is now included, also enabling the existing language-switch tests.
- Rust's six protocol/mode combinations preserve socks5h environment values and
  socks5 Chromium flags; native tests cover their propagation separately.
- Isolated Electron `session.setProxy` smoke result on the user's M5: socks5h
  produced ERR_NO_SUPPORTED_PROXIES; socks5 and HTTP produced 204. This does not
  exercise the authenticated Agent API.
- Follow [Antigravity diagnostics](antigravity-proxy.md) for the remaining real
  Agent acceptance. Never substitute updater success for Agent success.
