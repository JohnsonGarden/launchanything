# Opt-in publication marker — v0.1.0-preview.2

Maintainer approved publishing **unsigned / unnotarized developer Pre-release** install packages for **macOS Apple Silicon arm64 and native Intel x86_64**. The proxy-protocol and application-profile dropdowns were corrected to consistent Radix shadcn style and passed mainline CI.

Source commit: `a14467585b21f9681631516f00b2f9fe9e7874c6` (merged UI fix PR #16 and native Intel support PR #13). The publish workflow must verify this marker is the **only one-file commit above current main**, run both native Mac builds and checksums, then publish `v0.1.0-preview.2` with `--prerelease --latest=false`.

Windows is **explicitly excluded** from this release. Its separate branch gets the UI fix and builds an unsigned Windows test artifact only; do not attach Windows binaries to this release.
