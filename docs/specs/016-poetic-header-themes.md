# 016 — Poetic theme names and minimal header switcher (Design C)

## Approved user-facing labels

| Persisted ID (unchanged) | 中文 | English |
| --- | --- | --- |
| `rose` | 玫瑰轻语 | Rose Whisper |
| `parasol` | 晴光漫野 | Fields of Light |
| `monochrome` | 月下墨影 | Moonlit Ink |

## Scope
- Update only **the existing theme selector in the top header**; do not add a preferences/theme page or sidebar navigation.
- Remove theme-dependent palette/moon glyph. Show the same **tiny 15px rounded-square swatch** for all three themes; only the color changes (rose, warm sunlight, indigo gray).
- Preserve the trigger's compact size, selected name and dropdown chevron.
- Dropdown shows a primary name in the current UI language, the other language as a subtle secondary line, and a checkmark for the selected option. Use the existing accessible Radix UI Select keyboard/focus behavior, local persistence and ID values.
- Do not modify the semantic design tokens or the actual three theme palettes.
- The older Windows branch currently has no ThemeSwitch component; leave its UI architecture untouched rather than copy an unrelated Mac feature into it as a side effect of this small change.

## Verification
- The current `readTheme` values remain `rose`, `parasol`, `monochrome`.
- All six translations match the approved wording.
- One shared swatch geometry is used in both selector and menu for all theme IDs.
- Existing TypeScript, Vitest, Rust, release and native launcher checks pass.
- Visually inspect all three themes and both UI languages for menu clipping, selection, legibility and navigation.

## Rollback
Revert `ThemeSwitch.tsx`, its CSS and translation updates only. No user data conversion is necessary.
