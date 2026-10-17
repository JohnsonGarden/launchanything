# LaunchAnything v0.1.0 Preview 2 — Apple Silicon + Intel Mac

**UNSIGNED · NOT NOTARIZED · PUBLIC DEVELOPER PRE-RELEASE (NOT STABLE)**

此版本面向愿意测试未签名构建的 macOS 开发者。Apple Silicon 与 Intel 原生版本都来自同一份已合并代码，并经过各自的原生 GitHub Actions Runner 编译、验证；均**未经 Apple Developer ID 签名或公证**。

## 下载安装

| 芯片 | 安装包（Release Assets 中） |
| --- | --- |
| Apple Silicon / arm64（M 系列） | `LaunchAnything_v0.1.0_preview2_macos_arm64_UNSIGNED.dmg` |
| Intel / x86_64 | `LaunchAnything_v0.1.0_preview2_macos_x86_64_UNSIGNED.dmg` |

要求 **macOS 12+**。下载安装包与本页面 `SHA256SUMS.txt`、对应 `BUILD_INFO_arm64.txt` 或 `BUILD_INFO_x86_64.txt`。在下载文件所在目录执行 `shasum -a 256 -c SHA256SUMS.txt`（如果只下载了一个芯片的安装包，可手动对照清单中的该文件对应哈希）。SHA-256 只能核验文件与清单一致，不能证明发行者身份。

打开 DMG，将 LaunchAnything.app 拖入 Applications。首次如果只因**未知开发者或未公证**受阻：先尝试打开一次，再到 **系统设置 → 隐私与安全性 → 仍要打开 / Open Anyway** 针对该 App 单独放行。不要全局关闭 Gatekeeper、SIP 或使用 `xattr -cr`，发现“已损坏 / 恶意软件”警告则停止安装并反馈。

## 更新内容

- **修复代理配置弹窗的 HTTP/SOCKS5 协议下拉框**：改用可键盘操作的 Radix/shadcn 风格 Select。
- **修复添加/编辑应用弹窗的代理配置下拉框**：统一与输入框的高度、圆角、主题背景、焦点状态和选项高亮。
- 继续支持玫瑰粉白、晴空草地、黑白暗色三套主题；保持现有代理配置和启动逻辑不变。
- 同时提供两套原生 Mac 架构安装包。Intel 版本的 GUI 与通过代理启动其他应用已由测试用户验证。
- Windows 的同类 UI 修复仅在 Windows 开发分支进行，不包含在本次 macOS Release 中。

LaunchAnything 不改变系统全局代理，也不是强制所有请求走代理的 VPN。若遇到问题，可在 [Issues](https://github.com/JohnsonGarden/launchanything/issues) 提交脱敏日志；不要提供敏感代理链接或凭证。

## English

**Unsigned, unnotarized GitHub Pre-release — NOT a Stable Release.** Choose the `arm64` DMG for Apple Silicon M-series or `x86_64` DMG for Intel Macs (macOS 12+). Both come from the same reviewed source, built on native Apple Silicon / Intel GitHub runners. Verify the downloaded DMG against `SHA256SUMS.txt` and inspect its matching `BUILD_INFO_*.txt`.

The proxy protocol and app-profile native dropdowns are now shared accessible Radix Select controls aligned with the shadcn-style fields, across three themes. Existing config and launch behavior are unchanged.

On first launch, if macOS warns **only** about an unidentified developer or lack of notarization, use **System Settings → Privacy & Security → Open Anyway** for this one app after checking the source. Never disable macOS security globally. Stop on malware or damaged-app alerts. Windows is intentionally not part of this release.
