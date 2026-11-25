# SDD-006 — 0.2.0 native proxy and diagnostics
Status: development draft; no release or runtime compatibility claim.
Baseline: ad2ebe07ce5f03806be6bb9b8e865b08ba1f3a58.
## Contract
- P0: keep TCP reachability separate from an explicit HTTP CONNECT/SOCKS5 TLS request, probe egress IP/country only on an explicit user action, no credentials or raw logs. Use fixed HTTPS endpoint, no redirect or direct fallback. Probe result is NOT application egress.
- P0: inspect only a launched process, compare proxy environment against requested settings, show socket observations without storing logs. PID reuse, helper processes, UDP, DNS and brief connections limit coverage.
- P1: label non-loopback sockets as suspected bypass, never infer a leak from missing samples. No silent blocking or global settings changes.
- P2: separate signed Network Extension system extension using NETransparentProxyProvider, source signing identity allowlist, explicit TCP CONNECT/SOCKS5 forwarding, scoped UDP policy (no silent direct fallback for selected flows), exclude proxy own traffic/loopback and preserve corporate network. Install/start/stop/uninstall with user approval, rollback to existing modes. No SIP/Gatekeeper bypass, no TLS MITM. Require Developer ID provisioning, entitlement and notarization before distribution.
## Acceptance
Local fake proxy fixtures: success, wrong protocol, refusal, timeout; TLS probe confirms exit country separately. Verify environment matching and socket classification with deterministic tests; verify PID identity and helper coverage on real Mac. P2 requires signed extension build, user approval, TCP and UDP tests, IPv4/v6 and DNS/QUIC leak tests, extension failure/rollback and unrelated app/enterprise DNS regression. Gemini: login, model list, conversation, restart and token refresh with TUN/system proxy off. Retain three original launch modes and schema 1.
## Rollback
Disable/uninstall extension via supported macOS APIs; use 0.1.0 or existing launch modes. No changes to existing proxy settings. Do not publish 0.2.0 stable until all gates pass.
