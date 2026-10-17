# SDD 014 — Public unsigned Apple Silicon Pre-release

## Decision
The maintainer explicitly accepts distributing an **unsigned/unnotarized public GitHub Pre-release** at no Apple Developer fee, with prominent warnings and per-app macOS security override steps, **not** a stable certified release. Real Apple Silicon user has validated DMG installation and corrected default /Applications picker.

## Goals
- Permanent public GitHub Releases download for developers (not expiring Actions artifact).
- Stable Git tag `v0.1.0-preview.1`, distinct from future stable `v0.1.0`.
- Main-derived source **only**, explicit opt-in publishing marker branch, never auto-publish stable releases on ordinary main push.
- GitHub-hosted arm64 build, tests, main+Swift helper Mach-O verification, DMG + app ZIP + SHA256SUMS + BUILD_INFO.
- Release status `prerelease=true`, `draft=false`, marked **UNSIGNED** everywhere.
- Preserve `.github/workflows/release-draft.yml` for eventual signed / notarized stable release.

## Security / gating
- Trigger branch must be `publish-preview/v0.1.0-preview.1`, created from current main with **exactly one** marker file addition at `docs/releases/PUBLISH-v0.1.0-preview.1.md`.
- Reject stale, non-main, modified source, versions out of sync, or pre-existing tag.
- GitHub Actions job receives only the narrowly scoped `contents: write` capability necessary to publish. No Apple credentials or personal secrets.
- Run tests and checksum verification before `gh release create --prerelease --latest=false`.
- Documentation never suggests globally disabling Gatekeeper/SIP, removing quarantine or claiming publisher signing; stop if malware/damage warning is issued.

## Acceptance
- Public release exists at `/releases/tag/v0.1.0-preview.1` with visible DMG, ZIP, checksums, provenance.
- GitHub API reports prerelease=true, draft=false, and no Latest status.
- Package version remains 0.1.0; the preview tag is explicit.
- A user can download DMG directly from Releases without local source compilation.

## Rollback
If issues are discovered, mark the release as draft or delete it via GitHub Releases UI and document the issue. Never re-upload different binaries under the same tag without transparently explaining the provenance change.
