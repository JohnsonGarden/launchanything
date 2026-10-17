# 012 — Default macOS application picker to /Applications

## Context
The unsigned DMG preview builds and starts successfully on a real Apple Silicon Mac. The user reports that when using **Add Application → Browse**, the native picker no longer initially displays Applications, unlike their earlier local-source build.

## Root cause and scope
The `@tauri-apps/plugin-dialog` call in `src/components/AppEditor.tsx` does not set `defaultPath`. This was true in earlier source revisions too, so no source-code regression was established. A native macOS dialog without an explicit directory can use remembered locations that vary between app instances and launches.

## Requirements
- On macOS, when the user presses the App Editor browse button (new or existing app), open a **file** picker initially in `/Applications`.
- Preserve `directory: false` and `multiple: false`; allow navigating elsewhere for user-installed apps (`~/Applications` etc.).
- Preserve cancellation behavior, automatic app name derivation and all validation, persistence and launch logic.
- No permissions, security exceptions, runtime network behavior or release workflow changes.

## Test and acceptance
- Regression unit test confirms the dialog-options builder always selects `/Applications` and still requests one file, in Chinese and English.
- Typecheck, frontend unit tests, release contract tests, Rust tests and macOS packaging CI continue passing.
- On a newly installed unsigned preview DMG, open Add Application → Browse: the native picker **initially** displays `/Applications`. Verify users can navigate outside this directory and select an existing `.app` successfully.
- If the native dialog cannot access `/Applications` on a device, the dialog may choose a system fallback; capture the macOS version and dialog screenshot before pursuing a platform-specific fix.

## Rollback
Revert the application picker options and its new regression test only. Existing saved application paths remain unchanged.
