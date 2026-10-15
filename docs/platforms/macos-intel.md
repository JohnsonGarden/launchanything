# macOS Intel x86_64 · development branch

[中文](#中文) · [English](#english)

## 中文

此分支从稳定 `main` 提交 `4665f2fefa0db3322572a111a794f9450caca703` 创建，目标是让现有的 LaunchAnything 原生 macOS 启动器在 **Intel x86_64** 上完整构建和运行。所有原有配置、UI（玫瑰粉色 / 中英切换）、Rust 代理策略和 Swift LaunchServices 安全边界保持一致。

### 构建

在 Intel Mac（推荐 macOS 12+）、或已配好 cross target 的其他 Mac 上：

```bash
npm install
rustup target add x86_64-apple-darwin
npm run test:intel-contract
npm run build:macos-intel
npm run verify:macos-intel
```

生成目录：`src-tauri/target/x86_64-apple-darwin/release/bundle/macos/LaunchAnything.app`。CI 的 x86_64 原生 runner 会检查主程序及 Swift helper 的 Mach-O 架构，并提供**未签名、未公证**的短期构建工件；不要直接将其当成已发行的安装包。

发布前仍需真实 Intel 设备做启动、代理配置与持久化、目标进程启动验证。该分支 PR 在验收前保持 Draft。

## English

This branch forks from the accepted main SHA `4665f2fefa0db3322572a111a794f9450caca703` to build LaunchAnything for **Intel macOS x86_64**. The UX, saved schema, proxy strategy and unsandboxed Swift LaunchServices behavior remain unchanged.

On an Intel Mac (macOS 12+) or a configured Mac cross-build environment:

```bash
npm install
rustup target add x86_64-apple-darwin
npm run test:intel-contract
npm run build:macos-intel
npm run verify:macos-intel
```

CI tests on a native Intel runner, verifies both bundled Mach-O architectures, and uploads a **short-lived unsigned / unnotarized** app artifact. Do not claim final support until a real Intel machine has been used to smoke-test the UI, saved settings, port checks and process launches.
