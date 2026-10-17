# SDD 013 — Intel unsigned developer preview on current main

## Motivation
Original Intel feature PR #3 was validated via native CI in an old branch, but had diverged by 22+ commits from main (new themes, app picker default path, CI installer safety). Do **not** merge the stale branch wholesale and roll back accepted user features.

## Goal
Start from the accepted main (including PR #12), port **only** Intel-native build support, and produce an unsigned native x86_64 DMG + app ZIP using a GitHub-hosted Intel runner. This is a **test artifact, not stable distribution**. No Intel end-user machine acceptance has been completed yet.

## Scope
- Native Swift helper compiler chooses arm64/x86_64 target via `LAUNCHANYTHING_MACOS_ARCH`; default remains host architecture.
- Separate `build:macos-intel`, `verify:macos-intel`, and `test:intel-contract` commands, without replacing ordinary arm64 build.
- Intel workflow runs on `macos-15-intel` on opted-in preview branches, tests native helper, Rust, TypeScript, app/UI regressions and existing release contracts.
- Verify bundled `Contents/MacOS/*` executable and `Contents/Resources/bin/launchanything-macos-helper` are **x86_64**, fail on mismatch.
- Build **.dmg** and **.app.zip**, `SHA256SUMS.txt` and `BUILD_INFO.txt`; upload as a GitHub Actions artifact, retention 30 days.
- Explicit macOS gatekeeper per-app exception note, no global bypass instructions.

## Acceptance
1. Native Intel Actions workflow succeeds and contains expected artifact files.
2. Main Apple Silicon CI remains green with adapted `prepare:macos` script.
3. App picker regression still passes; expected browse directory remains `/Applications`.
4. Separate real Intel Mac tester installs via DMG, opens, verifies app picker, persistent settings, local proxy connectivity and controlled routing before marking Intel stable.

## Rollback
Revert Intel-only scripts/workflow/package additions and architecture branching in `prepare-macos.sh`. Existing user data and stable arm64 code stay unchanged.
