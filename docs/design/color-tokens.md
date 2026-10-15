# LaunchAnything — warm rose color tokens

**Scope:** Palette-only update. Page layout, typography, spacing, shadcn-style component anatomy, functionality, and states are unchanged.

Reference: MiMo TTS screenshots supplied by the product owner, 2026-10-13. The hues are adjusted for desktop contrast rather than directly duplicating JPEG pixels.

| Semantic token | Hex | Purpose |
| --- | --- | --- |
| `--background` | `#fff7fa` | Warm white app canvas |
| `--card` | `#fffbfc` | Slightly brighter surfaces |
| `--foreground` | `#39252e` | Deep chocolate-rose text |
| `--primary` | `#d1244f` | Action buttons, selected nav, main brand accents |
| `--primary-hover` | `#b91f46` | Hover/pressed action |
| `--primary-light` | `#e16c94` | Brand gradient (together with primary) |
| `--primary-soft` | `#f9dce7` | Selected states and focus highlights |
| `--primary-subtle` | `#fff0f5` | Icon tiles and gentle tinted surfaces |
| `--muted-foreground` | `#916d7d` | Secondary labels |
| `--border` | `#e8d4dd` | Neutral rose-tinted outlines |
| `--ring` | `#dc83a5` | Focus ring |
| `--success` | `#21ae80` | Connectivity/ready state (deliberately not pink) |
| `--destructive` | `#c23e5a` | Destructive/error semantic color |

**Rules:** Use semantic tokens rather than hard-coded indigo/blue/purple colors. Do not recolor status indicators as generic theme accents. Contrast of `--primary-foreground` on `--primary` should be at least WCAG AA (4.5:1). The UI remains light-only in this iteration.
