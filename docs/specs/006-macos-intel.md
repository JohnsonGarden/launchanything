# SDD 006 — macOS Intel x86_64 distribution

Status: implementation in `feat/macos-intel-x64`. Base main SHA: `4665f2fefa0db3322572a111a794f9450caca703`.

## Objective

Provide the same LaunchAnything v0.1 desktop launcher for **Intel Macs (x86_64)** without altering the already-accepted Apple Silicon behavior, settings schema, proxy plans, Chinese/English UX or LaunchServices security contract.

## Behavior / acceptance

1. `npm run build:macos-intel` generates a `x86_64-apple-darwin` Tauri macOS bundle. Requirements: macOS 12+, Node 22+, stable Rust including the x86 target and Xcode Command Line Tools.
2. The **bundled Swift LaunchServices helper and main executable must both be x86_64 Mach-O**. A wrong-arch helper is a hard build/verification failure, never a fallback to a stale binary from another architecture.
3. Swift helper is regenerated deterministically for the requested architecture; the ordinary `npm run dev` / `npm run build` still target the host architecture.
4. The unsigned `.app` / `.dmg` (when bundling is available) must contain `Contents/Resources/bin/launchanything-macos-helper`, which is the path resolved by the current Rust startup code.
5. On a real Intel runner, the existing native fixture suite continues to prove environment isolation, app process startup and forwarded Chromium flags. Rust, TypeScript and frontend tests must also pass.
6. CI builds on `macos-15-intel` and verifies the actual Mach-O architecture using `lipo -verify_arch`. The branch PR stays draft until a real Intel user has smoke-tested app launch and settings persistence.
7. Signing/notarization are out of scope; no silent invocation of Rosetta or automatic changes to a user's security settings.
8. CI uses an isolated branch, and main continues to ship the reviewed Apple Silicon baseline.

## Tests (TDD)

- Static deterministic test: package declares the Intel build entry point and preflight; prepare script explicitly selects the Swift target; CI verifies x86 architecture for native helper and bundled executable.
- Actual Intel macOS runner: TypeScript, Vitest, `cargo test`, native LaunchServices fixtures, `npm run build:macos-intel`, native bundle architecture assertion.
- On-device gate: launch unsigned artifact through normal local developer verification, create an HTTP proxy profile and .app entry, test a reachable local TCP listener, launch and verify actual target PID; persist and reopen settings. Report gaps explicitly.
