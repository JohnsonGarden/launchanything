# SDD 004 — Native IPC readiness and browser safety

Status: In progress. Incident: a contributor launched the frontend after the macOS setup and saw `Cannot read properties of undefined (reading 'invoke')` in the "Cannot load settings" banner.

## Diagnosis and invariants

- `@tauri-apps/api/core.invoke()` requires the Tauri-injected IPC bridge. Loading Vite at `http://127.0.0.1:1420` in a regular browser does **not** provide that bridge.
- A missing bridge may also indicate faulty injection **inside the native Tauri window**. Without observing the user's window and runtime logs, do not claim which case occurred.
- A missing bridge is **not** a corrupt JSON configuration; never delete/overwrite local configuration or silently fall back to an empty persistent state.
- Vite listens on 127.0.0.1:1420 and Tauri's devUrl points to 127.0.0.1:1420; do not randomly change port settings.

## Acceptance criteria

1. All Rust command invocations share a typed gateway that uses Tauri's supported `isTauri()` runtime check before attempting `invoke()`.
2. In a regular browser, `load_state` rejects with a dedicated diagnostic code (`NATIVE_BRIDGE_UNAVAILABLE`), not a raw `TypeError`. `invoke()` is never called in this case.
3. Missing IPC after runtime detection (unexpected partial native injection) produces the same actionable diagnostic; do not mask other Tauri errors, such as configuration, permission or JSON parsing failures.
4. The application shows a bilingual diagnosis: use the standalone LaunchAnything window opened by `npm run dev`; the browser URL is only Vite preview. If already in the native window, restart and capture the terminal log.
5. The load-error state must prevent UI actions from pretending settings were loaded; "Retry" remains usable after a bridge is available. Keep the user's existing files untouched.
6. The adapter passes commands and parameters through unchanged in native mode, preserving current proxy launch security and functionality.
7. Vitest tests cover missing bridge, successful IPC, partial injection error normalization and unrelated error propagation. CI runs TypeScript, Vitest, Swift, Rust and frontend builds.
8. Final diagnosis remains conditional pending an actual macOS Tauri window smoke test.

## Manual repro and acceptance

- Run `npm run dev` on macOS; wait for the independent LaunchAnything application to open. Expected: settings load normally.
- Open `http://127.0.0.1:1420` in Chrome while dev server is running. Expected: helpful runtime guidance, not "undefined invoke".
- Reload the browser tab or switch 中文/EN; the guidance translates instantly.
- Simulate an actual Rust command rejection; ensure the backend error is retained instead of being mislabeled as a missing IPC bridge.
