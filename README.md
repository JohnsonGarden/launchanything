# LaunchAnything

**一个入口，让 macOS 应用按你的代理配置启动。**

[简体中文](README.md) · [English](README.en.md) · [问题反馈](https://github.com/JohnsonGarden/launchanything/issues) · [License](LICENSE)

LaunchAnything 是轻量、隐私优先的桌面代理启动器。为每个应用保存 HTTP / SOCKS5 代理端点及启动模式，通过 macOS 原生 LaunchServices 打开应用，而**不修改系统全局代理**。界面采用 React + TypeScript、Tailwind / shadcn 风格组件及柔和玫瑰粉主题，支持中文和英文即时切换。

> **当前稳定基线：v0.1.0（macOS Apple Silicon）**。已在 Apple Silicon Mac 上完成实际启动、代理配置及 TCP 端口测试，并通过 macOS CI。软件不是 VPN，不保证每个应用的所有流量都经过代理。Intel Mac 与 Windows 客户端将在独立开发分支完成构建和验证后提供；目前**没有签名、公证或正式安装包发布承诺**。

## 能做什么

- **应用启动台**：集中管理 `.app`，一键按照已保存的代理配置启动。
- **代理配置**：支持 HTTP 与 SOCKS5、本地或自定义地址、端口、绕过主机列表。
- **三种启动模式**：环境变量 / Chromium 参数 / 组合模式。
- **真实的系统启动结果**：由 Rust 校验参数、Swift 调用 `NSWorkspace.OpenConfiguration`，报告 macOS 确认的进程 PID。
- **安全默认行为**：代理 TCP 端口不可达时阻止启动；目标应用已运行时避免悄悄复用原进程；隔离父进程遗留代理变量。
- **本地优先**：配置以版本化 JSON 保存在本机；无需账号，不收集遥测。
- **交互效率**：搜索 `⌘ K`，新增应用 `⌘ N`；中文 / EN 切换记住个人选择。

## 当前平台支持

| 平台 | 状态 | 说明 |
|---|---|---|
| macOS Apple Silicon | **可用 / 已有真机反馈** | 主线稳定基线；未签名分发 |
| macOS Intel（x86_64） | **开发中** | 单独分支做交叉编译、原生 helper 及打包验证 |
| Windows x64 | **开发中** | 单独分支实现 Windows 原生进程启动、.exe 构建、CI 与功能测试 |
| Linux | 未规划 | 当前不支持 |

## 本地运行（macOS）

前提：macOS 12+、Node.js **22+**、Rust stable（`cargo` / `rustc`）、Xcode Command Line Tools，以及**已经运行、提供 HTTP 或 SOCKS5 本地监听端口**的代理客户端（如 Shadowrocket / Clash / Xray）。

```bash
# 安装 Apple 开发工具（已安装可跳过）
xcode-select --install

# 如果还没有 Rust，使用官方 rustup 安装：
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

git clone https://github.com/JohnsonGarden/launchanything.git
cd launchanything
npm install
npm run doctor
npm run dev
```

运行 `npm run dev` 后**使用自动弹出的 LaunchAnything 桌面窗口**。浏览器里的 `http://127.0.0.1:1420` 只是 Vite 页面，不具备原生 Tauri IPC，无法读取真实配置。首次 Rust 构建需要编译依赖，可能稍慢。

构建本地 `.app` / `.dmg`（签名、公证尚未配置）：

```bash
npm run build
```

日常操作：先保证代理客户端正在监听；在「代理配置」中填写实际协议、IP/域名和端口并测试 TCP 连接；添加需要启动的 `.app`，分配代理和启动模式；**先完全退出目标应用**再从启动台运行。不要把“TCP 可达”或“应用启动成功”等同于“应用全部网络已代理”。

### 启动模式如何选？

| 模式 | 注入内容 | 适用范围 |
|---|---|---|
| 环境变量 | `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 等 | 明确支持代理环境变量的客户端 |
| Chromium 参数 | `--proxy-server`、`--proxy-bypass-list` | 接受 Chromium / Electron 代理启动参数的应用 |
| 组合模式 | 同时传入以上两类配置 | 混合网络栈的尝试方式，**不是强制全流量代理** |

**SOCKS5 兼容提醒：** 通用环境变量采用 `socks5h://`（对支持它的客户端启用代理侧 DNS），Chromium 参数采用 `socks5://`。部分 Electron 组件不接受 `socks5h://`；此时可以使用另一个已验证的 **HTTP/mixed 本地监听**，为该应用单独创建 HTTP 代理配置。见 [Antigravity 诊断案例](docs/antigravity-proxy.md)。应用子进程、认证、地域限制和目标域名策略仍需单独排查。

## 开发与验收

```bash
npm run doctor
npm run test:doctor
npm run typecheck
npm test
npm run test:rust
npm run prepare:macos
npm run test:macos-launch
```

架构：**Tauri 2 + Rust**（配置校验、原生命令、TCP 检测）、**Swift/AppKit**（macOS LaunchServices helper）、**React 19 + TypeScript + Tailwind / Radix**（shadcn 组件设计规范）。开发遵循 **SDD + TDD**：先写可验收规格和失败测试，再实现、重构、走 CI、真机验证。

- [产品规格与验收](docs/specs/001-mvp.md) · [架构及安全边界](docs/architecture.md)
- [工程决策 ADR](docs/adr/0001-tauri-swift.md) · [自动化与真机测试计划](docs/test-plan.md)
- [配色规范](docs/design/color-tokens.md) · [双语产品规范](docs/specs/002-rose-theme-bilingual.md)
- [开发者与 AI Agent 约定](AGENTS.md)

### 分支约定

- `main`：已验收的稳定基线；不直接提交未验证的平台功能。
- `dev`：与稳定基线同步的集成起点（需要时使用）。
- `feat/windows-x64-launcher`、`feat/macos-intel-x64`：各自独立于 `main` 开发，并通过 PR 验证后合并。

## 安全、限制与隐私

这是**按应用传入代理启动设置的工具，不是透明代理、防火墙或 VPN**。应用可能绕过环境变量 / Chromium 参数、使用独立 socket / helper、继承已有会话，或发生 DNS/QUIC 分流。TCP 测试只验证本地端口能够连接，不验证 SOCKS/HTTP 握手、出口 IP、TLS、认证或目标进程流量。请用目标应用日志和网络诊断进行实际验证。

macOS helper 需要在非 App Sandbox 下运行以传入启动环境；不会自动修改系统代理或安装网络扩展。不要把密钥、令牌、Cookie、完整敏感日志提交至仓库。目前不提供账号同步、凭据管理、强制流量接管或分发签名。

**许可证：** [MIT](LICENSE)。欢迎通过 Issues 提交兼容性反馈与可复现步骤。
