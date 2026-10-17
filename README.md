# LaunchAnything

**一个启动台，按你指定的代理启动桌面应用。**

[**简体中文**](README.md) · [**English**](README.en.md) · [下载与版本](https://github.com/JohnsonGarden/launchanything/releases) · [反馈问题](https://github.com/JohnsonGarden/launchanything/issues) · [MIT License](LICENSE)

[![macOS CI](https://github.com/JohnsonGarden/launchanything/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/JohnsonGarden/launchanything/actions/workflows/ci.yml)

LaunchAnything 是一款**轻量、隐私优先的跨平台桌面代理启动器**：为不同 APP 设置自己的 HTTP / SOCKS5 本地代理，按需启动应用，**不修改系统全局代理**。界面采用 React、TypeScript、Tailwind 与 shadcn/ui 设计规范，使用简洁的玫瑰粉色系，支持中文 / English 即时切换。

> **2026-10-17 发行状态：** macOS Apple Silicon 和 Intel 两种原生架构都已在真实 Mac 上验证基础启动及代理拉起功能，已公开的 [v0.1.0-preview.3](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.3) 将同时提供两套未签名 DMG，并修复“代理协议”和“绑定代理”原生下拉框样式。**两套都未经 Apple 签名与公证，属于开发者 Pre-release，非正式稳定版。** Windows x64 仅提供 CI 测试工件，不公开发布 Windows Release。

> **Preview 3 新增：** 顶部主题切换器采用极简圆角色块，三套主题更名为「玫瑰轻语 / Rose Whisper」「晴光漫野 / Fields of Light」「月下墨影 / Moonlit Ink」。原有主题偏好不变；Windows 仍仅保留 CI 测试包。

## 下载与安装
> **Mac 下载入口（未签名 Pre-release）：** [Apple Silicon arm64 DMG](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.3/LaunchAnything_v0.1.0_preview3_macos_arm64_UNSIGNED.dmg) · [Intel x86_64 DMG](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.3/LaunchAnything_v0.1.0_preview3_macos_x86_64_UNSIGNED.dmg) · [下载与 SHA-256 校验](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.3)。按芯片选择，均无需本地编译；首次启动仅在确认下载可信且属于未识别开发者拦截时，对该应用执行“仍要打开”。


> 开发者仍可使用 [Actions 构建工件](https://github.com/JohnsonGarden/launchanything/actions/workflows/developer-preview.yml) 排查问题；日常测试建议从 Releases 下载固定版本。安全说明见 [Preview 3](docs/releases/public-preview-v0.1.0-preview3.md)。

### Mac 快捷安装：复制一条命令

**macOS Apple Silicon（M 系列）现在可以不预装 Git、Homebrew、Node.js 或 Rust，直接通过官方脚本从源码安装。**

```bash
INSTALLER="$(mktemp "${TMPDIR:-/tmp}/launchanything-installer.XXXXXXXX")" && curl --proto '=https' --tlsv1.2 -fsSL https://raw.githubusercontent.com/JohnsonGarden/launchanything/main/scripts/install-macos.sh -o "$INSTALLER" && bash "$INSTALLER" --install --yes
```

安装器会检查 macOS 和芯片架构，在用户授权下安装缺少的 Node.js 22（校验官方 SHA-256）和 Rust，从本仓库锁定某次 Git 提交的源码编译 APP，并复制到 **`~/Applications/LaunchAnything.app`**，完成后自动打开。**这是本机编译安装，并非已经签名公证的 DMG。** 初次编译可能需要 10–30 分钟以上、数 GB 空间，具体取决于机器与网络。

如果缺少 **Xcode Command Line Tools**，macOS 会显示需要用户亲自确认的系统安装对话框。**完成安装后，重新运行同一条命令即可继续**；不会重复安装已有工具，也不会要求关闭 Gatekeeper、执行 sudo 或修改系统代理。

运行远程脚本前，建议[先查看源码](scripts/install-macos.sh)。`--yes` 表示授权安装用户目录内的依赖。给 Codex / Claude Code 等 Agent 使用时，建议先运行 `bash "$INSTALLER" --check --json` 和 `--plan`，再执行 `--install --yes --no-launch`；遇到退出码 `20` 就等待用户完成系统对话框并重试。详见 **[Agent 完整安装操作手册](docs/AGENT_INSTALL.md)**。

> Intel Mac 现在同样可以下载原生 x86_64 预览 DMG，而不必执行实验性本地编译；Windows 客户端仅提供独立 Actions 测试构建，**不能**使用此 macOS 安装脚本。经 Apple 签名与公证的正式稳定版仍需等待。

**不希望本地编译的用户：** Apple Silicon 和 Intel Mac 都可以从 [GitHub Releases（官方发布页）](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.3) 下载对应芯片的未签名 DMG，无需 Node.js、Rust 或本地编译；Windows 仍只开放 Actions 测试包。

| 系统 / 架构 | 当前状态 | 下载 / 验证 |
|---|---|---|
| **macOS Apple Silicon（arm64）** | **公开未签名 Pre-release** | [Preview 3 DMG](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.3/LaunchAnything_v0.1.0_preview3_macos_arm64_UNSIGNED.dmg)；[历史 Preview 1](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.1) |
| **macOS Intel（x86_64）** | **公开未签名 Pre-release** | [Preview 3 DMG](https://github.com/JohnsonGarden/launchanything/releases/download/v0.1.0-preview.3/LaunchAnything_v0.1.0_preview3_macos_x86_64_UNSIGNED.dmg)；[历史 Intel 构建](https://github.com/JohnsonGarden/launchanything/actions/runs/38745634965) |
| **Windows 10/11 x64** | **仅 CI 开发测试，不发布 Release** | [本次修复版 CI](https://github.com/JohnsonGarden/launchanything/actions/runs/39000990367)；[旧版 CI](https://github.com/JohnsonGarden/launchanything/actions/runs/38745714406)；[PR #4](https://github.com/JohnsonGarden/launchanything/pull/4) |
| Linux | 不支持 | 尚无 Linux 客户端 |

### 体验 Windows / Intel 测试构建
> **Intel Mac 测试进展：** Intel x86_64 已通过原生 CI 和基础真机启动/代理拉起测试，现与 arm64 一起发布 [Preview 3](https://github.com/JohnsonGarden/launchanything/releases/tag/v0.1.0-preview.3)。两者仍为未签名、未公证的开发者预览版，不应宣传为 Apple 认证稳定发行。


已经生成的**开发工件**在上述 Intel / Windows CI 页面底部的 **Artifacts** 中：

- Intel 历史构建：`LaunchAnything-macos-intel-unsigned`（建议改用上方最新 Release DMG）
- Windows：`LaunchAnything-windows-x64-unsigned`

需要登录 GitHub 才能从 Actions 下载；当前工件保留期为 **7 天**，过期后需重新运行对应分支的构建。**这些并不是正式发行版**：Intel 的应用尚未经过 Apple 公证；Windows 的未签名安装包可能触发 SmartScreen 提示。请仅在理解风险并信任构建来源时测试，不建议普通用户绕过系统安全检查。

## 功能

- **应用启动台**：集中管理应用与其代理配置。稳定 macOS 版本支持 `.app`；Windows 开发分支支持 `.exe`。
- **独立代理配置**：HTTP / SOCKS5、地址、端口、绕过主机（`NO_PROXY` 等）。
- **三种代理启动模式**：环境变量、Chromium / Electron 启动参数、组合模式。
- **原生启动**：Rust 后端校验参数，macOS 使用 Swift/AppKit LaunchServices；Windows 开发版使用系统原生进程创建。
- **安全边界**：端口 TCP 不可达时拒绝启动，隔离父进程遗留的代理环境，避免已运行 APP 悄悄复用旧进程。
- **本地优先**：配置以版本化 JSON 保存在本机；不要求登录账号，不收集遥测。
- **双语与效率**：简体中文 / 英文即时切换，记住语言偏好；macOS 支持 `⌘ K` 搜索与 `⌘ N` 新增应用。

## 日常使用

1. 先运行 Shadowrocket、Clash、v2rayN、Xray 等代理客户端，确认它在本机监听 HTTP 或 SOCKS5 端口。
2. 在 LaunchAnything 的「代理配置」中新增代理，填写**真实的协议、主机、端口**，测试 TCP 连接。
3. 添加目标应用，为其绑定代理并选择启动模式。**请先完全退出目标 APP 及其后台进程**，再从启动台打开。
4. 使用目标应用自身的连接日志、实际请求或出口 IP 验证代理效果。

| 启动模式 | 方式 | 更适合 |
|---|---|---|
| 环境变量 | `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 等 | 遵循代理环境变量的程序和子进程 |
| Chromium 参数 | `--proxy-server`、`--proxy-bypass-list` | 接受启动参数的 Chromium / Electron 程序 |
| 组合模式 | 同时提供两种配置 | 多网络栈程序的兼容性测试，**不是强制全流量代理** |

**SOCKS5 提示：** 部分客户端支持 `socks5h://`（代理侧 DNS），而 Chromium 接受 `socks5://`。个别 Electron 组件对 `socks5h://` 不兼容；可以为此类 APP 配置经过验证的本地 HTTP / mixed 代理监听。详见 [Antigravity 代理兼容性记录](docs/antigravity-proxy.md)。

**重要限制：** 端口 TCP 连通、进程成功启动，都**不能证明应用全部网络流量经过代理**。LaunchAnything 不是 VPN、网络过滤器或强制透明代理，也不会安装网络扩展或修改全局代理。

## 开发者：从源码运行

以下内容仅面向贡献者或需要自定义开发的用户；普通用户不需要安装开发工具。

### macOS Apple Silicon（当前 `main`）

要求 macOS 12+、Node.js 22+、Rust stable、Xcode Command Line Tools。仅在尚未安装时执行：

```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
npm install
npm run doctor
npm run dev
```

`npm run dev` 会弹出独立 **LaunchAnything 桌面窗口**。浏览器打开的 `http://127.0.0.1:1420` 只是 Vite 预览，**无法访问 Tauri 原生配置和启动 API**。

本地构建未签名 `.app` / `.dmg`：

```bash
npm run build
```

### macOS Intel（开发分支）

```bash
git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
git switch --track origin/feat/macos-intel-x64
npm install
rustup target add x86_64-apple-darwin
npm run build:macos-intel
npm run verify:macos-intel
```

需要 Intel Mac 的 macOS 开发工具、Node.js 22+ 和 Rust。更多说明：[Intel 构建指南](https://github.com/JohnsonGarden/launchanything/blob/feat/macos-intel-x64/docs/platforms/macos-intel.md)。

### Windows 10/11 x64（开发分支）

使用 PowerShell，提前安装 Node.js 22+、Rust MSVC、Visual Studio C++ Build Tools / Windows SDK、WebView2 Runtime：

```powershell
git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
git switch --track origin/feat/windows-x64-launcher
npm install
npm run doctor:windows
npm run dev:windows
# 或打包未签名的 NSIS setup.exe：
npm run build:windows
```

更多说明：[Windows 构建指南](https://github.com/JohnsonGarden/launchanything/blob/feat/windows-x64-launcher/docs/platforms/windows-x64.md)。

### 测试与架构

```bash
npm run doctor
npm run test:doctor
npm run test:release-contract
npm run typecheck
npm test
npm run test:rust
npm run prepare:macos
npm run test:macos-launch
npm run build
```

技术栈：**Tauri 2.12 / Rust + Swift/AppKit（macOS）或 Windows 原生进程接口 + React 19 / TypeScript / Tailwind / Radix（shadcn 风格）**。开发遵循 **SDD + TDD**：规格与验收标准 → 自动化测试 → 实现与重构 → CI → 真机验收。

相关文档：[架构与安全](docs/architecture.md) · [测试计划](docs/test-plan.md) · [工程约定](AGENTS.md) · [配色设计](docs/design/color-tokens.md) · [Release / 签名计划](docs/RELEASING.md)。

## 发布与分支策略

- `main`：包含已验证的 Apple Silicon 与 Intel 原生构建及共同 UI；Windows 仍保持独立分支，不对外发布正式包。
- `dev`：与稳定主线保持同步的集成起点。
- [Intel PR #13](https://github.com/JohnsonGarden/launchanything/pull/13) 已合并；[Windows PR #4](https://github.com/JohnsonGarden/launchanything/pull/4) 仍为 Draft 且仅构建测试安装包。
- **Release**：从 `main` 手动生成 macOS arm64 Draft Release，先审核安装包、校验和、签名与公证状态；发布前须完成相应平台验证。已创建公开但未签名的 Apple Silicon Pre-release，尚未发布 Stable Release。

**隐私与安全：** 不要把访问令牌、Cookie、邮箱、认证密钥或完整敏感日志上传到 Issues。macOS helper 需要非 App Sandbox 环境传入新进程启动变量。当前版本不支持凭据管理、云同步或强制代理劫持。

[MIT License](LICENSE) · [提交问题或建议](https://github.com/JohnsonGarden/launchanything/issues)
