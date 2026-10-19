# LaunchAnything App Icon — Scheme A / Folded Path（折叠路径）

> **状态：第一备选 / First shortlisted concept**  
> **用途：设计评审与后续品牌资产定稿**  
> **注意：本方案尚未成为正式发行图标，暂不覆盖 `src-tauri/icons/` 和 Tauri 打包配置。**

## 1. 设计定位 / Positioning

LaunchAnything 是一款本地优先、可为不同桌面应用单独指定 HTTP / SOCKS5 代理的启动器，不是 VPN、网络过滤器或流量劫持工具。

**图标的第一识别必须是大写字母 `L`（Launch）；第二层含义才是路径的选择、折转和精准启动。**

品牌表达：*自由启动，一切尽在掌控。*  
设计关键词：**简约、抽象、路径、启动、选择、克制、品牌感**。

## 2. 灵感来源 / Inspiration

- **字母 L：** 以 LaunchAnything 的首字母构成主轮廓，避免依赖解释才能辨识。
- **路径折转：** 在 L 的横向尾部加入一处克制的上扬折角，隐喻将应用导向用户指定的运行环境。
- **桌面工具语言：** 使用稳定的几何比例、连续的轮廓、温和圆角与足够的负空间，适合 macOS Dock 与 Finder 的图标环境。
- **避免功能堆叠：** 不使用火箭、拟物门、VPN 盾牌、多个节点或对称分叉，避免小尺寸出现“乌贼/触手”等错误联想。

## 3. 形态逻辑 / Geometry

1. **竖向笔画** — 表达稳定的控制入口；保持主干宽度，保证 L 的第一眼识别。
2. **底部横向笔画** — 表达路径展开；形体连续、不拆成多个网络分支。
3. **尾端局部上扬** — 暗示转向与启动；变化必须明显小于 L 的主体，不得演化成独立火箭、箭头或另一字母。
4. **负空间** — 保持 L 内部足够空白，让 32px 尺寸仍能分辨横竖结构。

**视觉优先级：L 的轮廓 ＞ 折转细节 ＞ 轻微层次。** 单色版故意删除折转叠色，作为更可靠的小尺寸/辅助场景备选。

> 本目录中的 SVG 是根据选定视觉方向**手工矢量重构的候选稿**，并非从 AI 设计展示板导出的原生矢量源文件。形态和微小比例仍需最终品牌评审；不要将其视为已经通过 Apple 审核的生产资源。

## 4. Rose Whisper 色彩 / Design tokens

所有主配色取自 `src/styles.css` 及 [color-tokens.md](color-tokens.md)，不另造一套蓝绿品牌色：

| Token | Hex | 在图标中的作用 |
| --- | --- | --- |
| `--primary` | `#D1244F` | 玫红底色主识别 / 反色前景 |
| `--primary-hover` | `#B91F46` | 主色深层渐变 |
| `--primary-light` | `#E16C94` | 主色浅层渐变、折叠辅助层 |
| `--primary-soft` | `#F9DCE7` | 浅色符号的柔和过渡 |
| `--background` | `#FFF7FA` | 单色图标背景 |
| `--card` | `#FFFBFC` | 反色图标背景及主图标前景 |
| `--foreground` | `#39252E` | 单色版本墨色 |

应用当前有「玫瑰轻语 / 晴光漫野 / 月下墨影」三种主题；**应用图标作为稳定品牌资产，不因应用内主题切换而自动改色**。本候选与默认「玫瑰轻语」主题保持一致。

## 5. SVG 交付 / Vector assets

| 版本 | 预览 | 文件 | 使用方向 |
| --- | --- | --- | --- |
| **主图标** | ![Main](../../assets/brand/icon-scheme-a/icon-main.svg) | [icon-main.svg](../../assets/brand/icon-scheme-a/icon-main.svg) | App Icon 的主候选 |
| **反色版** | ![Inverse](../../assets/brand/icon-scheme-a/icon-inverse.svg) | [icon-inverse.svg](../../assets/brand/icon-scheme-a/icon-inverse.svg) | 浅背景/演示稿 |
| **单色版** | ![Monochrome](../../assets/brand/icon-scheme-a/icon-monochrome.svg) | [icon-monochrome.svg](../../assets/brand/icon-scheme-a/icon-monochrome.svg) | 无渐变/小尺寸辅助版 |
| **独立符号** | ![Symbol](../../assets/brand/icon-scheme-a/symbol-transparent.svg) | [symbol-transparent.svg](../../assets/brand/icon-scheme-a/symbol-transparent.svg) | 品牌区域、文档与网页使用 |

所有 SVG 使用 `1024 × 1024` 的 `viewBox`；独立符号版不包含底板，可在任意背景上按需排版。图标底板使用圆角矩形，外部区域透明；如未来需要无透明方形商店资源，应在正式生产导出步骤针对目标平台另行处理，不能直接认定这些 SVG 已满足商店的最终资产要求。

## 6. 缩放与验收 / Acceptance

- 在 **1024、128、64、32、16 px** 做实际栅格化检查（展示板上的缩略图不等于最终验证）。
- 第一眼能识别为大写 **L**；尾部上扬不能误判成数字、动物、丝带或网络拓扑。
- 使用默认玫瑰主题 Token，不引入与现有产品视觉冲突的新色系。
- 反色版与单色版保持**同一几何轮廓**；透明符号版可独立排版。
- 不修改 Rust/Tauri 启动行为、代理逻辑、现有 Release 图标或图标打包配置。
- 定稿后再根据目标平台生成并验收 PNG、`.icns` / 其他平台图标资源，更新 `src-tauri/icons/`，通过构建、打包与真机验证后单独合并。

## 7. 后续决策 / Decision

当前 A 为**第一备选**，而 B（Open Portal）与 C（Dual Track）仍是设计比较方向。选中最终方案之前，禁止将此候选直接描述为正式 App Store 上架图标。

这个 PR 仅引入可审核的设计文档和可编辑 SVG 资源，不改变任何应用运行时行为。
