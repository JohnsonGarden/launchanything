# LaunchAnything v0.1.0 Preview 3 — Apple Silicon + Intel Mac

**UNSIGNED · NOT NOTARIZED · PUBLIC DEVELOPER PRE-RELEASE · NOT STABLE**

这是面向开发者的测试版本，提供两种 macOS 原生芯片安装包，**不需要本地编译**。它们均未经 Apple Developer ID 签名或公证，并非正式稳定版。Windows **不包含在本次 Release 中**。

## 本次更新

顶部导航栏的主题选择器采用更简洁的 **方案 C：统一圆角色块**，替代原来的调色盘/月亮图标。菜单现在提供诗意的中英文双语命名：

| 中文 | English |
| --- | --- |
| 玫瑰轻语 | Rose Whisper |
| 晴光漫野 | Fields of Light |
| 月下墨影 | Moonlit Ink |

- 当前语言为主标题，另一种语言作为副标题；选中项仍有对勾。
- 主题 ID `rose`、`parasol`、`monochrome`、真实主题配色和本地已保存的设置均保持不变，**无需迁移配置**。
- 仍在顶部直接切换，不新建单独的设置页面。
- 继承 Preview 2 已修复的代理协议、应用绑定代理两处 Radix/shadcn 风格下拉框。

## 下载与安装 / Downloads

| Mac 芯片架构 | 下载安装包 |
| --- | --- |
| Apple Silicon M 系列（arm64） | `LaunchAnything_v0.1.0_preview3_macos_arm64_UNSIGNED.dmg` |
| Intel（x86_64） | `LaunchAnything_v0.1.0_preview3_macos_x86_64_UNSIGNED.dmg` |

支持 macOS 12+。请下载对应架构的 `.dmg`、`SHA256SUMS.txt`、`BUILD_INFO_arm64.txt` 或 `BUILD_INFO_x86_64.txt`。两个架构都提供 `.app.zip` 作为替代安装格式。

验证 SHA-256：若下载了全部 DMG 和 ZIP，可以在相同目录执行 `shasum -a 256 -c SHA256SUMS.txt`；若只下载一个 DMG，则执行 `shasum -a 256 下载的安装包文件名.dmg`，与校验清单的对应行比较。哈希可验证文件与清单一致，**不能**代替发行者签名或证明软件安全。

打开 DMG，将 `LaunchAnything.app` 拖入 Applications。如果 macOS 首次打开只因**未知开发者或未经公证**拒绝，先尝试启动，再到**系统设置 → 隐私与安全性 → 仍要打开（Open Anyway）**针对这个 App 放行。不要关闭全局 Gatekeeper 或 SIP，不要批量移除隔离属性。遇到软件损坏、已识别恶意软件、异常篡改告警时应停止安装并反馈。

配置继续本地存储；LaunchAnything 不是系统级 VPN，也不保证每个目标 App 所有流量都经过代理。请勿在 Issue 中泄露私有代理地址、Cookie、token 或凭据。

## English

This **unsigned, unnotarized public developer Pre-release** ships separate native `arm64` (Apple Silicon) and `x86_64` (Intel) macOS 12+ DMGs. It is **not an Apple-certified Stable Release**. Windows is intentionally excluded.

Preview 3 refreshes the header theme selector with minimal identical rounded-square color swatches and bilingual theme labels: **玫瑰轻语 / Rose Whisper**, **晴光漫野 / Fields of Light**, **月下墨影 / Moonlit Ink**. Existing saved theme IDs and palette colors remain unchanged, so no settings migration is necessary. Preview 2's Radix dropdown improvements remain included.

Choose the correct DMG for your CPU, verify its SHA-256 against the supplied `SHA256SUMS.txt`, and inspect the architecture-specific `BUILD_INFO`. If macOS blocks **only an unidentified developer or lack of notarization**, use **System Settings → Privacy & Security → Open Anyway** after confirming the source. Do not disable Gatekeeper globally or bypass malware/damaged-app warnings.

Report issues at https://github.com/JohnsonGarden/launchanything/issues with non-sensitive steps and sanitized logs.
