# SDD 003 — macOS development prerequisite diagnostics

Status: Implementing

## Problem

When a contributor runs `npm run dev` without Rust's `cargo` available, the Tauri CLI emits `failed to run 'cargo metadata' ... No such file or directory`, which provides no actionable installation guidance. Node dependencies may be correctly installed, and the auto-generated untracked `package-lock.json` is not related to this error.

## Acceptance criteria

1. `npm run doctor` reports OS, Node version, Cargo, rustc, and Apple's `swiftc` availability using local CLI checks; no network, sudo, or installations.
2. Before `npm run dev` and `npm run build`, preflight runs automatically; missing tools cause an actionable Chinese-and-English error with the official Rustup install command, `source "$HOME/.cargo/env"` guidance, and `xcode-select --install` as applicable.
3. Distinguish an absent executable from a failure executing an installed tool.
4. Guard macOS-only builds and Node.js 22+ in a consistent way.
5. Tests cover missing Cargo, missing Swift toolchain, unsupported Node version, unsupported OS, and a healthy environment.
6. CI continues to typecheck, test, compile Swift and Rust, and verify the new preflight test in a macOS runner.
7. No change to the application launch proxy or its security boundaries; no lockfile is pushed until existing contributors with untracked lockfiles can safely reconcile it.
