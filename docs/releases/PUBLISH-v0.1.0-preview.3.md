# Explicit authorization — publish v0.1.0-preview.3

The LaunchAnything maintainer requested a new public **macOS dual-architecture unsigned developer Pre-release** following the accepted poetic theme name and rounded-square icon improvements.

Source `main`: `5d9fad147b3c72335dee27e590126d98e79e2369`
Release tag: `v0.1.0-preview.3`
Included architectures: native macOS **arm64 (Apple Silicon)** and **x86_64 (Intel)**.
Excluded platform: **Windows** (CI-only, no release asset).

This document is the **only change** on the opt-in publication branch. The workflow must verify this exact one-file marker above current main, compile from that main commit on both native Mac runners, verify main executable and Swift helper architecture and SHA-256 checksums, and publish only if both builds succeed.

The artifacts are **unsigned and not Apple-notarized** and must be published with `--prerelease --latest=false`; previous preview tags must not be modified or overwritten.
