# SDD 010 — Agent-friendly macOS source installer

## Context

Developer ID signing and notarization are not yet configured. A user/agent needs a deterministic installer that checks and installs source-build dependencies, creates an app in the user's home Applications folder and verifies completion without disabling Gatekeeper.

## Scope

Stable `main` macOS Apple Silicon only. Intel and Windows remain on draft feature branches; do not misrepresent those as supported by the stable script.

## Acceptance

1. `scripts/install-macos.sh` works from a trusted checked-out repository and supports `--check`, `--dry-run`, `--yes`, `--launch` and `--help`; unknown arguments fail.
2. Fail fast on non-macOS/non-arm64; never silently install another architecture. `--check` and `--dry-run` do not mutate disk or system state.
3. Check git, Xcode CLT Swift compiler, Rust stable cargo/rustc, Node >=22 and npm; only install missing dependencies.
4. For missing Xcode Command Line Tools, issue `xcode-select --install` in interactive mode, explain that the user must finish Apple's dialog and rerun script, then exit nonzero without starting a broken build.
5. Rust is installed using official Rustup in a temporary file, never `curl | sh`; review action requires explicit confirmation unless `--yes` is supplied; source environment for current session. Homebrew (if installed) provides Node 22+; if absent and Node missing, do not silently bootstrap Homebrew — instruct user to install from brew.sh or nodejs.org and rerun.
6. Do not run sudo (or request admin password) from the script; never modify system-wide proxy, Gatekeeper, security preferences, login shell, or system installation paths.
7. Install JavaScript dependencies with `npm install` (do not assume lockfile exists), run `npm run doctor`, `npm run test:doctor`, `npm run typecheck`, `npm test`, `npm run build`.
8. Locate `src-tauri/target/release/bundle/macos/LaunchAnything.app`, verify Swift helper under bundle Resources, install via `ditto` to `~/Applications/LaunchAnything.app`; never overwrite existing app without warning/approval. Replace atomically with backup; avoid deleting backup if rollback fails.
9. Verify the copied app and helper exist, show installed path and launch command. Launch only on request (`--launch`) and after successful installation.
10. Separate `docs/INSTALL_AGENT.md` states an autonomous agent runbook with permission boundaries, interactive checkpoints, error-recovery mapping, verification and redaction. README.md and README.en.md show installation shortcut near the top with true unsigned/developer-build caveats and source trust instructions.
11. Deterministic script contract tests validate no Gatekeeper bypass/sudo, bash syntax, options, guarded install, backup and verification. Existing macOS CI runs new tests.
12. Completion means CI green and manual local smoke test remains required; never imply having executed on user's Mac.

## Trust model

One-line shortcut clones GitHub repository over HTTPS, then invokes an inspected repo-local script. Users should review source at `scripts/install-macos.sh` first; a mutable branch is not cryptographically pinned. Agent can use `git rev-parse HEAD` to log the exact version. Never request credentials.
