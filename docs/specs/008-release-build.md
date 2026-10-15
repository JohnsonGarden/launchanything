# Release build stability — coherent Tauri v2 dependencies

## Root cause

The original source CI tested Rust modules and Vite but not `tauri build`. On release packaging, Rust automatically resolved Tauri 2.12.x while the frontend SDK/CLI stayed on 2.8.x. An attempted piecemeal pin of Rust crates then exposed unsatisfiable transitive dependencies and runtime ABI/API mismatches.

## Coordinated dependency versions

- JavaScript: `@tauri-apps/api 2.12.3`, `@tauri-apps/cli 2.12.2`
- Dialog JS + Rust plugin: `2.8.3`
- Rust `tauri = 2.12.4` and `tauri-build = 2.7.3`, the latter satisfying the core's `^2.7.3` dependency.
- No direct runtime / Wry pins; the core selects its mutually compatible runtime dependencies. Avoid adding them back without Cargo lock evidence.

## Acceptance / rollback

- macOS CI must pass TypeScript, UI tests, native Swift helper launch tests, Rust unit tests and **full `npm run build`**.
- Verify the unsigned `LaunchAnything.app` includes `Contents/Resources/bin/launchanything-macos-helper`.
- No settings schema changes, no promise of signed/notarized distribution. Failures keep PR open and `main` untouched.
- Roll back this PR by reverting its single release maintenance merge if any platform regression is found.
