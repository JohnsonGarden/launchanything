# SDD 009 — End-user downloads, release drafts and bilingual README

Status: implementation. Verified stable baseline: macOS Apple Silicon main at 61851ab0d5c0343813d6a39e6d1276a9ec353ab6. Native Intel and Windows CI builds succeeded, but target-device installation and app-level proxy acceptance are outstanding.

## Product problem

Non-developers should download a Mac installer directly from GitHub Releases rather than first setting up Git, Rust, Node or the CLI. The initial README is stale and incorrectly describes Intel/Windows as not built; GitHub currently has **zero releases** even though platform CI uploaded expiring unsigned artifacts.

## Scope and release constraints

1. README.md and README.en.md give end users a **Download / 下载** entry at the top, platform/version matrix, true CI evidence and a separate section for developer source builds.
2. Neither README claims that an actual Release exists before the GitHub release workflow has created one. The GitHub Releases page is a stable future entry point, not a claim of current availability.
3. The Apple Silicon mainline supports a **manual, guarded, GitHub Actions draft-release builder**. Release version must match both package.json and tauri.conf.json. The workflow must be started from main, use a known main SHA, produce unsigned arm64 macOS .dmg and .app ZIP assets, verify bundled Swift helper and both arm64 Mach-O architectures, generate SHA256 checksums, upload a temporary artifact, then create a **draft + prerelease** on GitHub.
4. The release workflow must never publish automatically or claim Apple Developer ID signature / notarization that is not configured. The draft's asset filenames and release notes explicitly mark unsigned builds as developer previews; a public stable release requires separate signing, Apple notarization and a real installation smoke test.
5. Windows x64 and Intel x86_64 are still isolated in PR #4 and #3. Their green CI and short-lived unsigned artifacts are linked for testers but must not appear as validated production binaries of the Apple Silicon mainline tag. Once runtime verified and merged, they can join the multi-platform release matrix through new release work.
6. Release check contracts are tested without invoking real GitHub side effects. Documentation and CI tests must not require external credentials, only local file reads.
7. CI already passes for the source baseline; README-only and manually-dispatched release changes must not change runtime code, settings schema or proxy behavior.
8. Copyright and privacy: no personal keys, tokens, cookies, signed certificates or user logs in releases. Manual review is mandatory before publishing a draft.

## Acceptance

- `npm run test:release-contract` checks that the release automation is guarded and bilingual README status/download links are consistent.
- Regular macOS CI runs release-contract tests with other checks and still builds unsigned .app successfully.
- A maintainer may later run the workflow from main (Actions -> Prepare macOS release draft), inspect artifacts and the draft. The existence of the workflow itself is **not** evidence that a draft release or a public downloadable Release has already been created.
