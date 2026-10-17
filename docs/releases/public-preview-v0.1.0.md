# LaunchAnything v0.1.0 Preview 1 — macOS Apple Silicon

**公开开发预览 / PUBLIC DEVELOPER PREVIEW — UNSIGNED, UNNOTARIZED, NOT STABLE**

这个 GitHub Pre-release 面向能够自行判断软件来源、愿意参与测试的开发者，并非 Apple 签名公证过的正式稳定版。无需在本机编译 Node.js、Rust 或 Tauri。

## 适用系统 / Compatibility
- macOS 12.0+ on Apple Silicon (arm64 M-series)
- **不适用于 Intel 芯片 Mac**；Intel 原生 DMG 正在单独测试。
- 不提供系统 VPN、透明全流量代理或流量劫持；不同应用的网络组件对代理参数的支持存在差异。

## 下载及安全说明 / Download and security
1. 下载 `LaunchAnything_v0.1.0_preview1_macos_arm64_UNSIGNED.dmg`、`SHA256SUMS.txt` 和 `BUILD_INFO.txt`（三者均在本 Release Assets 中）。ZIP 包作为替代分发格式，可选。
2. 将下载文件放在同一目录，运行 `shasum -a 256 -c SHA256SUMS.txt` 核对 DMG / ZIP（两种包都应存在，或仅校验你实际下载的文件），查看 `BUILD_INFO.txt` 的构建来源；校验和不是开发者身份签名。
3. 安装 DMG 到 `/Applications`。首次因**未验证开发者**受阻时，先尝试打开，再到 **系统设置 → 隐私与安全性 → 仍要打开** 针对这一个 App 授权。
4. 不要全局关闭 Gatekeeper 或 SIP，也不要清除隔离属性；如果 macOS 提示恶意软件、文件受损或可疑篡改，请停止安装并反馈。
5. 使用 [Issue](https://github.com/JohnsonGarden/launchanything/issues) 反馈 macOS 版本、步骤和已脱敏日志。不要发送私密代理地址、token、Cookie 等。

## 功能 / Features
- 本机独立 HTTP/SOCKS5 代理配置、不同 App 启动模式、代理端口连通性预检查。
- React/Tauri 桌面启动台、三套主题、中文/English UI。
- 新增应用时默认打开 `/Applications` 文件选择器，可选择其他路径。
- 配置完全本地持久化；不修改系统全局代理。

## English
This GitHub **Pre-release** is a test build for developers, **unsigned and not notarized by Apple**. It is **not a Stable Release**. Download the arm64 DMG and check SHA-256 with `SHA256SUMS.txt`, read `BUILD_INFO.txt`, copy the app to Applications, then use macOS **Privacy & Security → Open Anyway** only if macOS blocks an *unidentified developer*. No global Gatekeeper/SIP changes are necessary or recommended. Do not bypass malware or damaged-app alerts. Intel x86_64 and Windows versions are not included.
