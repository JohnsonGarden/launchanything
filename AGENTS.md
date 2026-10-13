# Engineering contract (SDD + TDD)

This is a macOS desktop product, **not** a generic Electron wrapper and not a VPN.

1. **Specification first:** Every behavior-changing feature starts by updating `docs/specs/` with user scenario, failure mode and measurable acceptance criteria. Capture significant architectural changes under `docs/adr/`.
2. **Red → green → refactor:** Add or update a failing deterministic test first; implement the minimal behavior; run the relevant suites; then refactor. Do not mark unexecuted tests as passing.
3. **UI conventions:** shadcn/ui composition (Radix primitives + Tailwind + Lucide), accessible labels, macOS-friendly spacing, keyboard navigation, concise copy and zero placeholder controls.
4. **Security:** never interpolate user input into a shell command; Rust owns validation; native launcher receives JSON via stdin. Never silently fall back to direct connections when the TCP proxy port is unreachable. Never claim a TCP connection proves per-app traffic capture.
5. **Persistence:** prefer versioned, locally stored settings and atomic replacement; do not collect logs, API keys, analytics or credentials.
6. **Branches:** one scoped feature branch from `dev`; conventional commits (`feat`, `fix`, `test`, `docs`, `chore`); PR targets `dev`. Include tests, screenshots when available, rollback note and explicit untested concerns. Avoid merging unreviewed releases.
7. **Compatibility:** macOS 12+, both Apple Silicon and Intel. Mac App Sandbox must not be enabled for the current `NSWorkspace.OpenConfiguration.environment` method.
8. **Definition of done:** TypeScript typecheck + tests, Rust tests, macOS helper compilation, runtime smoke test, and updated docs. If a check cannot be executed in the current environment, explicitly record that gap in the PR.
