# LaunchAnything — three appearance themes

The three skins use the same shadcn-style semantic token architecture. They change presentation, not Tauri/Rust proxy behavior or saved application/profile data. The locally persisted key `launchanything.theme` defaults to Rose.

| Skin | Canvas | Card | Primary action | Text |
| --- | --- | --- | --- | --- |
| Rose · 玫瑰粉白 | `#FFF7FA` | `#FFFBFC` | `#D1244F` | `#39252E` |
| Parasol · 晴空草地 | `#F8FCFF` | `#FEFDF9` | `#35728E` | `#263039` |
| Monochrome · 黑白暗色 | `#09090B` | `#18181B` | `#FAFAFA` | `#FAFAFA` |

## Source fidelity and accessibility

- **Rose:** established MiMo-derived warm rose palette, from the owner's original reference screenshots.
- **Parasol:** based on the supplied *Parasol Community · 用户分享社区设计规范* HTML, inspired by Monet's *Woman with a Parasol*. Extracted colors are Sky 25 `#F8FCFF`, Sky 100 `#E5F3FA`, Sky 200 `#CDE7F5`, Sky 500 `#5698B8`, Sky 600 `#3E7E9E`, Cloud 25 `#FEFDF9`, Cloud 50 `#FAF8F0`, Sage 100 `#E4EFDC`, Sage 200 `#C8DDBB`, Moss 600 `#4F5E39`, Butter 100 `#FFF2B7`, Lilac 100 `#EEE8F7`, and Ink 900 `#263039`.
  - The source's `Sky 500 #5698B8` is preserved as a decorative brand accent. White text over that swatch has only ~3.19:1 contrast. For primary buttons, the same blue family is darkened to `#35728E` (~5.32:1 contrast against white) to improve legibility.
  - Moss and Sage remain the trust/success accent and surface colors. Butter indicates warnings. Rose marks errors. These are not generic action colors.
- **Monochrome:** shadcn-inspired Zinc-dark semantic palette; not a wholesale inversion of the light skin.

## Component consistency

- PingFang SC is the primary Chinese UI font. No stylized Chinese fonts.
- Theme selection is in the top-right header, uses accessible Radix Select options with an actual checked indicator, and persists between restarts.
- The Add/Edit Application dialog uses three **independent radio cards**, not adjacent action buttons. The shared shadcn-style dialog has a viewport-bounded scrollable body and visible save/cancel footer.
- Use `var(--token)` for navigation, input, border, overlays, buttons, status indicators, popovers and dialogs. Avoid rose hardcoded colors in shared UI.
- Check short-window viewport, scroll and footer visibility, keyboard navigation, radio selection, English/Chinese labels, and all three themes. UI edits should pass typecheck, unit tests, native integration tests and full Tauri packaging before merge.
