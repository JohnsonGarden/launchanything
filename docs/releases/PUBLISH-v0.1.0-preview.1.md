# Explicit authorization — publish v0.1.0-preview.1

Maintainer authorized publishing an **unsigned, unnotarized Apple Silicon GitHub Pre-release** for developers. The tested DMG works on a real Apple Silicon Mac and the default /Applications file-picker fix has also been accepted.

This file is the **only** change on the special publishing branch above accepted main SHA `80a9993e0d53136ebfcc670935803ee9e6845462`. The publishing workflow verifies the single-file marker, compiles exactly that main SHA, runs CI tests and checksums, and publishes a public `--prerelease --latest=false` release.

This is **not** a Stable Release; no Apple signing or notarization has been performed. Intel x86_64 is a separate test track and is not included in this asset set.
