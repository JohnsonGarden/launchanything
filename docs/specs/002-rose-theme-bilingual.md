# SDD 002 — Warm rose visual system & English / Simplified Chinese

Status: **Implemented, pending Mac desktop manual smoke test**

## Background and scope

The product owner supplied two screenshots of the previous MiMo TTS project as the visual reference and explicitly rejected the indigo/purple launcher palette. Keep the existing shadcn component architecture, page structure and behavior; change only color tokens and extend the header with a language switch. Never duplicate the screens of the reference product.

## Functional requirements

1. The macOS app supports two complete **UI** locales: `zh-CN` and `en`.
2. The header shows a compact, keyboard-accessible **中文 / EN** control on Applications, Proxy profiles, About & safety, and both dialogs.
3. The selected locale switches all frontend copy immediately, with no page refresh or loss of state/forms.
4. On first launch, choose Chinese if the host `navigator.language` starts with `zh` (including zh-Hans); otherwise choose English.
5. Manually selecting a locale persists across restarts in `localStorage` under `launchanything.locale`. Invalid previous values fall back to the system locale; blocked storage must not crash the app.
6. Both locales cover navigation, headings, cards, action labels, dialog form fields, validator feedback, success/error toasts, removal confirmations, empty-state copy, accessibility labels, and transparency guidance.
7. Proxy URLs, application names, paths, environment keys, protocol names, operating-system/process details and unstructured backend error messages remain unchanged. Translating the latter requires structured error codes in a future backend iteration.
8. UI color is exclusively from semantic tokens (see `docs/design/color-tokens.md`); actual network status still uses semantic green/red.

## Acceptance scenarios

- Given a fresh install and `navigator.language = 'zh-CN'`, initial labels are in Simplified Chinese.
- Given a fresh install with `en-US`, labels are in English.
- Given English selection on a Chinese-language Mac, restart preserves English.
- Given a corrupt stored locale, system language wins.
- Switching while an editor is open immediately translates the editor but retains unsaved values and selection.
- Both buttons expose accessible `aria-label` and `aria-pressed` and work via keyboard.
- Selected navigation, buttons, icon tiles and empty-state gradients are rose, not indigo.
- Port status remains green (reachable) or destructive red (unreachable), independent of theme.
- Changing locale must not alter persisted proxy profile or application path data.

## Test plan and limits

Automated tests: locale detection, persistence preference precedence, key parity, dynamic message formatting, bilingual validation messages; existing app validation/unit tests; TypeScript typecheck; frontend build; Swift/Rust CI regression.

Manual macOS checks still required for live Tauri webview rendering, system locale behavior and app networking. Browser/static previews are not substitutes for actual macOS smoke testing.
