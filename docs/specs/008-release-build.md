# Release build stability — Tauri package alignment

Bug: the macOS source CI previously checked Rust unit tests and Vite only, not `tauri build`; the Rust manifest permitted the latest `tauri = "2"` and `tauri-plugin-dialog = "2"`, which Tauri CLI 2.8.4 rejects against pinned JS API 2.8.0 / plugin-dialog 2.4.0.

Acceptance:
- Rust tauri and tauri-build remain `=2.8.0` and dialog `=2.4.0` to match JavaScript's 2.8 / 2.4 minor releases.
- On macOS Apple Silicon CI, `npm run build` produces an unsigned `LaunchAnything.app` containing the required Swift helper. Source tests and native LaunchServices tests remain green.
- No app configuration/schema change; Windows and Intel platform initiatives retain their separate feature branches and CI gates.
- This does not add distribution signing/notarization or claim universal proxying.
