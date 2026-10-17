# SDD 015 — Theme-consistent Select & unsigned dual macOS Preview 2

## Problem
The Proxy Editor and App Editor used platform-native HTML `<select>` with `appearance:auto`. On macOS, the browser/system picker ignores the project's shadcn-derived appearance, and dropdowns diverge across themes and platforms.

## Scope
- Build a shared Radix UI Select using the existing dependency (no new runtime package).
- Match shadcn style semantics using project theme tokens and 40px Input dimensions, consistent radius, border, focus ring, selected check, keyboard navigation, constrained popover within dialogs.
- Proxy scheme values stay `http` and `socks5`; App profile ID values stay unchanged. Edit/save/persistence/launch are unaffected.
- Regression tests guard against reverting to native `<select>` and check accessible role and theme styles.
- Apply same feature-only patch on separate Windows branch and run Windows native build CI; **do not publish any Windows Release**.
- Merge accepted Intel x86_64 feature into current main, build `arm64` + `x86_64` native DMGs on separate native runners from the same main SHA.
- Publish `v0.1.0-preview.2` as **unsigned, unnotarized public prerelease** with two DMGs, two APP ZIPs, SHA256 and provenance.
- Preserve `v0.1.0-preview.1` historical Release, never overwrite existing releases, and keep Stable signing policy unchanged.

## Release safeguard
- New workflow only triggers on a special `publish-preview/v0.1.0-preview.2` branch, exactly one marker-file change from accepted main.
- Matrix build must pass both chip architectures and native Rust/Swift/frontend tests before the publish job can start.
- Verify `lipo` architecture of main executable and embedded Swift helper, verify both file hashes and source provenance.
- Tag version is a clearly labeled developer preview, `--prerelease --latest=false`. No sign-in/certificate claims; no Gatekeeper global bypass.

## Acceptance
- Mac UI: both menus render identical theme tokens in three themes; use keyboard navigation; saving data unchanged.
- PR CI green on main; Windows branch CI green.
- GitHub Release contains two DMG files, two app ZIP files, SHA256SUMS and two BUILD_INFO files; `isPrerelease=true`.
- Real Mac testers verify their arch-specific DMGs again after publication.
