# LaunchAnything — Updater-enabled macOS Preview

**UNSIGNED / UNNOTARIZED MAC APP · Tauri signed update payloads · PRE-RELEASE, NOT STABLE**

This is a public developer preview for Apple Silicon (arm64) and Intel (x86_64). The app DMGs are still **not Apple Developer ID signed or notarized**. For in-app updates only, both native .app.tar.gz update bundles include independent cryptographic Tauri updater signatures, enforced by the client's embedded public key.

- About & Safety includes a bilingual update checker, browsing both stable and prerelease GitHub versions in SemVer order.
- Signed update bundles can be downloaded and installed with explicit user confirmation, followed by app relaunch. A system network route or saved HTTP/SOCKS5 local proxy can be selected for checking/downloading.
- Windows public Release is not included.
- Existing v0.1.0 Preview 1–3 installations lack the embedded update key and signed updater payloads. **Install this version manually once**, then install a later signed version using the in-app update control.
- Settings remain local; updater contacts only GitHub endpoints and does not transmit proxy profile details or application paths.

See [updater security and release checklist](../UPDATES.md) for verification, signing-key setup and compatibility constraints.
