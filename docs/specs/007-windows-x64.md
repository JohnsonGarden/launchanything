# SDD 007 — Windows x64 native .exe launcher

Status: feature development in `feat/windows-x64-launcher`, forked from accepted main `4665f2fefa0db3322572a111a794f9450caca703`.

## User story

On Windows 10/11 x64, a user runs the same warm-rose, bilingual LaunchAnything application, assigns a reusable local HTTP/SOCKS5 proxy to installed `.exe` applications, and launches a **new process** with the chosen environment variables and/or Chromium flags. The tool never changes global system proxy, requires no administrator privileges and never pretends to enforce arbitrary network capture.

## Acceptance criteria

- Separate `npm run dev:windows` and `npm run build:windows` paths; TypeScript + React UI remain unchanged visually except Windows-specific absolute `.exe` picker/path copy and macOS keyboard shortcut fallback.
- Rust validates Windows absolute `.exe` paths and checks they are existing ordinary files before spawning. Mac `.app` contract stays intact via conditional compilation.
- Native Windows launcher creates the process directly with `std::process::Command` (Windows CreateProcess), no `cmd.exe`, PowerShell interpolation, shell escape tricks, DLL injection or registry changes.
- Proxy env keys inherited from the parent are **removed** before applying the explicit launch plan; Chromium-only mode must not inherit stale HTTP/SOCKS variables.
- Startup refuses to quietly reuse an already-running matching `.exe` process: process enumeration compares full image path; errors or inaccessible ambiguous processes fail closed.
- Rust uses the **same** `build_launch_plan` and `check_proxy` fail-closed TCP guard as macOS. PID is returned only for a confirmed spawned process. Does not claim per-app routing was verified.
- Tauri v2 platform-specific config isolates macOS resource helper, icons and build scripts from Windows; Windows NSIS builds a user-scoped `-setup.exe` installer. Signing and SmartScreen trust not claimed.
- Windows runner checks TypeScript, frontend tests, Windows validation/proxy unit tests, Rust check/test, bundle compilation and installer existence. No macOS shell/Swift prebuild scripts run on Windows.
- Both Chinese and English UI strings describe `.exe` selection; language toggle, stored schema version 1 and existing local proxy profiles are unchanged. Configuration is per OS, no silent cross-OS path migration.
- Real Windows 10/11 desktop user smoke test and unsigned installer trust review are required before PR can leave Draft.

## Red / green tests

1. Pure TypeScript tests for `C:\Program Files\Example\Example.exe` path and displayed name, wrong-platform rejection, stable existing macOS `.app` behavior.
2. Rust `validate_app` Windows absolute path tests and known-running-process native guard test, plus the existing 6-way proxy mode matrix.
3. Contract test for Windows NSIS platform config and separate prep paths.
4. CI on `windows-latest`: test, build, installer verification; optional manual runtime check documented explicitly.
