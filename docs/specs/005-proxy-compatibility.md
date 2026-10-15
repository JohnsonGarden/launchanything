# SDD-005 — Proxy protocol compatibility and isolated launch settings

## Scenario and evidence

Antigravity IDE on an Apple M5 starts through LaunchAnything but its updater reports
`ERR_NO_SUPPORTED_PROXIES`. Its language server separately reports
`FAILED_PRECONDITION (code 400): User location is not supported for the API use.`
These failures must not be conflated. A successful curl TLS handshake or API-root
404 does not verify an authenticated Agent request.

A probe using the installed Electron runtime in a temporary, isolated bundle
reproduced `ERR_NO_SUPPORTED_PROXIES` with `session.setProxy` using `socks5h://`;
`socks5://` and `http://` on the same mixed listener returned HTTP 204.
Installed Antigravity IDE code reads HTTPS/HTTP proxy environment variables and
passes them to Electron `setProxy`, potentially overriding Chromium flags.

A separate native fixture demonstrated that `NSWorkspace.OpenConfiguration`
inherits the helper's proxy environment even when `configuration.environment`
is empty. Thus the original Chromium-only comparison was not isolated.

## Contract / acceptance criteria

1. Keep SOCKS5 Environment and Combined URLs as `socks5h://` for existing clients;
   keep Chromium's URL as `socks5://`, including IPv6 brackets.
2. At the Swift launch boundary, explicitly set missing uppercase/lowercase
   HTTP_PROXY, HTTPS_PROXY, ALL_PROXY, NO_PROXY values to empty strings. A native
   fixture with poisoned parent variables must observe only the requested proxy
   values; empty bypass lists must not inherit a parent's NO_PROXY.
3. Preserve arguments, validation, existing-process refusal and unreachable-port
   launch guard. Never change system proxy settings or installed app bundles.
4. Show a Chinese/English compatibility notice when an app uses a SOCKS5 profile
   with Environment or Combined. Recommend an independently verified HTTP/mixed
   listener; explain that Chromium flags alone do not configure child processes.
5. Reuse the existing HTTP profile/mode for Antigravity when that listener supports
   HTTP CONNECT. Never assume a SOCKS-only port accepts HTTP or change generic
   SOCKS behavior to fix one client's updater.
6. Document the actual Antigravity IDE log directory, safe error-only inspection,
   and independent updater/Agent acceptance. Do not collect logs or credentials.

## Scope

Swift helper, native launch fixture, Rust protocol matrix, app-editor notice,
translations, package/CI check, README/test plan and diagnostic notes. No config
schema migration, new launch mode, dependencies, proxy discovery, dylib injection,
MITM, account changes or automatic node switching.

## Verification boundary

Native fixture and isolated Electron results verify launch/protocol behavior.
Only a real Agent response can verify the user workflow. Region rejection remains
unresolved until a subsequent authenticated request succeeds.
