# ADR-0001: Tauri + native Swift launch bridge

Status: Accepted (2026-10-13)

## Context

The product needs shadcn-quality UI, small runtime overhead, local storage and launching arbitrary user-selected macOS `.app` bundles with proxy environment variables/argv. macOS does not guarantee target apps consume these settings.

## Decision

- **Tauri 2 + React 19 + TypeScript + Tailwind 4 + shadcn conventions** for WebKit-native shell and accessible interface.
- **Rust** for typed IPC, profile validation, deterministic launch-plan functions, persistence and connectivity checking.
- **Swift AppKit helper** for `NSWorkspace.OpenConfiguration` environment/arguments instead of using `/usr/bin/open`, `osascript`, or injecting variables through a shell. Swift is invoked as a bundled resource, via JSON stdin.
- **No App Sandbox**, since Apple ignores custom launch environment for sandboxed callers.
- **Tests at both model and process-plan layers**. CI on macOS builds Swift bridge; manual app-level tests still required.

## Alternatives

- Pure SwiftUI: excellent native integration, but limits reuse of preferred shadcn frontend patterns and may slow independent UI iteration.
- Electron: easier shell ecosystem but significantly heavier than Tauri for this small utility.
- `open -a` with exported environment: LaunchServices process inheritance is not a supported guarantee for injecting target app proxy env; declined.
- TUN/Network Extension: could support more complete routing, but requires entitlements, user permissions and a much broader security/design review; deferred.

## Consequences

Two native implementation languages (Rust and Swift), a prebuild helper compilation step, and release-signing considerations. In exchange, app launching uses documented macOS APIs rather than undocumented hacks. In v0.1 we make no universal-proxy claims.
