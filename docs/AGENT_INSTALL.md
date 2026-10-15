# Agent installation runbook / Agent 安装操作手册

## 简体中文

适用于 Codex、Claude Code、Cursor 等可执行本地终端命令的 Agent。**稳定默认平台只有 macOS Apple Silicon arm64。** Intel 是必须显式 `--intel-preview` 的测试版，Windows 有独立客户端。

**先下载、检查源码，再执行；避免直接 `curl | bash`。**

```bash
INSTALLER="$(mktemp "${TMPDIR:-/tmp}/launchanything-installer.XXXXXXXX")"
curl --proto '=https' --tlsv1.2 -fsSL https://raw.githubusercontent.com/JohnsonGarden/launchanything/main/scripts/install-macos.sh -o "$INSTALLER"
less "$INSTALLER"  # Agent / 用户审核后按 q 退出
bash "$INSTALLER" --check --json
bash "$INSTALLER" --plan
bash "$INSTALLER" --install --yes --no-launch
```

`--yes` 必须在用户授权安装 Node/Rust 及构建应用之后使用。脚本不需要 Git、Homebrew、管理员密码，不会修改系统全局代理或关闭 Gatekeeper。Node.js 22 从官方 HTTPS 下载并校验 SHA-256，Rust 通过官方 rustup 安装。源码先从 GitHub 官方 API 解析到**固定提交 SHA**，然后下载对应源码包；构建后验证 APP 和 Swift helper 架构，再保存到 `~/Applications/LaunchAnything.app`。已有 APP 会备份到 `~/Applications/LaunchAnything.backup.*.app`，原有代理设置不受影响。

**Agent 应使用 JSON 的各字段判断就绪情况，而不是只看 `--check` 退出码。** JSON 的 `supported`、`xcodeToolsReady`、`nodeReady`、`rustReady`、`needsUserAction` 是关键字段。

| 退出码 | 错误类型 | 必须执行的步骤 |
|---|---|---|
| 0 | 安装成功 / 状态检查成功 | 确认 `~/Applications/LaunchAnything.app` 存在，可按需要打开 |
| 20 | `USER_ACTION_REQUIRED`、`APP_IS_RUNNING` | Xcode 开发工具首次安装需要用户在苹果系统窗口批准，或需要先退出旧 APP；完成后重新执行原安装命令 |
| 21 | `UNSUPPORTED_PLATFORM` | 检查 CPU/OS；Intel 仅在用户明确接受测试版后使用 `--intel-preview` |
| 22 | `CONSENT_REQUIRED` | 先请用户同意，再使用 `--yes` |
| 23 | 下载/完整性失败 | 检查网络/代理/官方来源，**不得跳过 SHA-256 或关闭 TLS 校验** |
| 24 | 工具链/构建失败 | 查看 `~/Library/Application Support/LaunchAnything/installer/installer-last.log`，定位失败后重试 |
| 25 | APP 安装失败 | 查看用户应用目录、磁盘空间和旧版备份，禁止删除用户配置 |

**Xcode Command Line Tools 是 macOS 原生依赖，第一次安装不能完全静默。** 脚本会弹出系统安装对话框后退出码 20；Agent 应暂停，等待用户确认并安装完成，再原样重试。运行 `--install --yes --no-launch` 后，成功时打印 `SUCCESS[INSTALLED]` 与源码 SHA。

初次编译可能需要 10–30 分钟以上及数 GB 空间；这是一种方便的**源码构建安装**，并不等同于签名、公证的 Release 安装包。不得指引用户关闭 Gatekeeper、使用 `sudo` 或上传密钥、敏感日志。指定固定源码提交可增加 `--ref <40位 SHA>`。Intel 测试需明确追加 `--intel-preview`。

## English

This guide helps terminal-capable Agents (Codex, Claude Code, Cursor) install LaunchAnything from trusted source. **Stable support is macOS Apple Silicon only.** Intel must opt into the experimental `--intel-preview` branch; Windows has a separate client.

First download and review the script rather than piping remote code directly into a shell:

```bash
INSTALLER="$(mktemp "${TMPDIR:-/tmp}/launchanything-installer.XXXXXXXX")"
curl --proto '=https' --tlsv1.2 -fsSL https://raw.githubusercontent.com/JohnsonGarden/launchanything/main/scripts/install-macos.sh -o "$INSTALLER"
less "$INSTALLER"
bash "$INSTALLER" --check --json
bash "$INSTALLER" --plan
bash "$INSTALLER" --install --yes --no-launch
```

Only use `--yes` after explicit user consent. The script installs user-local Node 22 (official SHA-256 verification), stable Rust, resolves GitHub source to an immutable commit SHA, builds and architecture-checks the native app, then installs it in `~/Applications/LaunchAnything.app`. It backs up the previous app and preserves saved user configuration. No Git, Homebrew, sudo, global proxy modifications or Gatekeeper bypass are required.

`--check --json` is read-only; parse readiness fields rather than relying on its successful exit code. Exit `20` indicates required **human macOS dialog confirmation** (Xcode Command Line Tools) or an already-running app; wait for the user and rerun the identical command. Exit `21` is unsupported platform, `22` authorization needed, `23` download/integrity error, `24` toolchain/build error, `25` install error. Examine the build log under `~/Library/Application Support/LaunchAnything/installer/installer-last.log` when required. Never bypass checksum validation, disable TLS/security checks, or upload credentials.

A user-local source build is **not** a notarized/signed binary Release. The first build may consume multiple GB and take 10–30+ minutes. To pin a reproducible ref, supply `--ref <Git commit SHA>`; to test Intel explicitly, supply `--intel-preview` and accept its unverified status.
