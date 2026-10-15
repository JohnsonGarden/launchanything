# Windows x64 desktop client / Windows x64 桌面客户端

[中文](#中文) · [English](#english)

## 中文

这是独立的 Windows 开发分支，基于已验收的 `main` 提交 `4665f2fefa0db3322572a111a794f9450caca703`。目标是 Windows 10/11 x64 原生 `.exe` 桌面程序与 NSIS `-setup.exe` 安装包，**不影响 macOS Apple Silicon 稳定版**。

需要 Node 22+、Rust MSVC、Visual Studio C++ Build Tools / Windows SDK、WebView2 Runtime，以及已运行的本地 HTTP/SOCKS5 代理（Shadowrocket 之外，也可用 Clash、v2rayN、Xray 等）。

在 Windows PowerShell：

```powershell
git switch feat/windows-x64-launcher
npm install
npm run doctor:windows
npm run test:windows-contract
npm run dev:windows
# 正式编译（未签名）：
npm run build:windows
```

应用管理支持绝对路径的 `.exe` 文件；启动时验证本地代理端口，并用 Windows `CreateProcess` 注入环境变量 / Chromium 参数。不通过 Shell，不修改系统代理、注册表或管理员设置。对已经运行或无法确认进程状态的同名目标程序会拒绝二次启动。

Windows CI 提供测试和**未签名安装包**，需要在真实 Windows 10/11 上人工验证安装、启动、持久化及流量后才能合并进 main。SmartScreen 警告和数字签名另行处理。

## English

This isolated Windows 10/11 x64 feature branch forks from the stable `main` SHA `4665f2fefa0db3322572a111a794f9450caca703`. It builds a native Windows `.exe` desktop app and an unsigned NSIS `-setup.exe` installer.

Prerequisites: Node 22+, Rust MSVC, Visual Studio C++ Build Tools / Windows SDK, WebView2 Runtime and a separately running local HTTP/SOCKS5 listener (Clash, v2rayN, Xray, etc.).

```powershell
git switch feat/windows-x64-launcher
npm install
npm run doctor:windows
npm run test:windows-contract
npm run dev:windows
npm run build:windows
```

The launcher accepts absolute `.exe` paths, checks TCP port availability, then starts a new Windows process with explicit environment/Chromium flags through Rust's native process API (no shell). It does not change system proxy settings or guarantee transparent traffic interception. The feature PR remains a **Draft** pending real Windows smoke tests, unsigned installer review and any signing/notarization equivalents.
