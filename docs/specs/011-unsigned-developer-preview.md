# 011 — macOS unsigned developer preview (2026-10-16)

## Goal
Provide an opt-in, reproducible **Apple Silicon** macOS DMG downloadable from GitHub Actions without requiring users to compile locally or the maintainer to purchase an Apple Developer ID certificate. This is **not** a stable, signed or notarized distribution.

## Scope
- Preserve the existing signed-release draft workflow and its manual approval gate unchanged.
- Add a separate Actions workflow that can be run on push to `release-preview/**` branches and manually after merging to the default branch.
- Generate `.dmg` and `.app.zip` for **arm64**, `SHA256SUMS.txt`, a provenance/info text, and upload the files together as an Actions artifact with a clear `UNSIGNED` marker.
- Run release contract tests, typecheck, frontend tests and Rust tests before packaging.
- Confirm the app bundle contains the macOS Swift helper and that both executables contain the target arm64 architecture.
- No publishing a stable Release, no signing secrets, no auto-update, no new privilege requirements.

## Safety and honest claims
- Display `unsigned / not notarized / developer preview` on every download instruction.
- Avoid instructions to globally disable Gatekeeper or to run `spctl --master-disable`, `xattr -cr`, or similar quarantine-removal commands.
- On macOS, instruct testers to **attempt to open the app first**, then go to **System Settings → Privacy & Security → Open Anyway** (only for a trusted, verified download) and confirm. This is an app-specific exception, not an “Any Source” global security setting.
- Verify SHA-256 of both downloadable files before opening; note checksums protect against accidental corruption but are not a cryptographic publisher identity.
- Treat any macOS warning identifying known malware or damaged/tampered app as a **stop condition**, not as a reason to bypass protections.
- Uninstall by deleting the app; warn configuration persists and may be backed up before removal.

## Acceptance
1. Push to `release-preview/v0.1.0-arm64` starts macOS arm64 preview build.
2. Successful run includes `.dmg`, `.app.zip`, `SHA256SUMS.txt`, `BUILD_INFO.txt` in an Actions artifact.
3. macOS fresh-user smoke-test: verify archive hashes, mount DMG, install app, start once via Apple’s “Open Anyway”, configure a proxy and save/relaunch, launch a trusted target app in verified proxy mode.
4. Neither the existing manual Release draft nor `main` is modified by a preview build.

## Rollback
Delete this workflow/preview branch, or discontinue preview uploads. Existing formal release workflow is unchanged.
