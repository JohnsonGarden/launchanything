# Engineering contract — LaunchAnything (SDD + TDD)

LaunchAnything is a multi-platform per-application **proxy startup launcher**, not a VPN or universal network interception product. The verified baseline is macOS Apple Silicon; Windows x64 and macOS Intel are separate feature branches.

1. **Specification first:** Record every behavior-changing requirement in `docs/specs/`, including platform-specific edge cases, risk, measurable acceptance and rollback. Use `docs/adr/` for consequential choices.
2. **TDD:** Write a deterministic regression/failing test where feasible → implement the minimum safe change → refactor. Never label an unexecuted test as passing.
3. **Design:** Radix/shadcn UI conventions, Tailwind semantic rose tokens, bilingual Chinese/English UX, accessible focus, meaningful keyboard handling. Prefer native PingFang SC for Chinese on macOS; do not package font binaries.
4. **Native safety:** Rust owns validation. Never interpolate untrusted paths/arguments into a shell. Native launch adapters must be OS-specific; do not inject proxy config into an already-running process. No silent direct fallback on unreachable proxy port. Preserve launch-environment isolation.
5. **Claims:** TCP reachability, proxy handshake, egress IP, per-process launch and confirmed app traffic are distinct measurements. Do not conflate them. Do not imply universal routing guarantees.
6. **Persistence and privacy:** Keep current versioned JSON schema backward-compatible or include migration tests. Atomic on-device writes, no credentials, analytics, telemetry, uploaded logs or unrequested account data.
7. **Branch discipline:** `main` is the stable, accepted baseline; `dev` may mirror `main` for integration. Start each new platform effort from **the same recorded main SHA** on its own `feat/*` branch. Open a PR to `main` (draft until cross-platform CI and local runtime checks); do not merge one incomplete platform into another.
8. **Targets:** macOS uses an unsandboxed Swift/AppKit LaunchServices helper; Intel helper architecture must match the target bundle. Windows must use native process creation with safe argument/env handling and `.exe` selection. Do not claim portable code if an OS feature was not built and tested there.
9. **Definition of done:** TypeScript + unit tests, Rust tests, OS-native helper or equivalent test, build/bundle check, runtime smoke test on the target architecture, updated English/Chinese README and an explicit PR evidence/rollback note. CI success is not a substitute for real runtime verification.
