# GitHub Release and signing policy / Release 与签名规范

[中文](#中文) · [English](#english)

## 中文

LaunchAnything 面向普通用户的分发方式应是 GitHub **Releases 下载页**，而不是要求安装 Node.js、Rust、Git 等开发工具。

**当前状态：** `main` 的 macOS Apple Silicon v0.1.0 代码及完整打包 CI 通过，Intel 和 Windows 的测试版也分别在自己的功能分支通过原生 CI。但截至 2026-10-15，仓库尚无公开 GitHub Release，Apple Silicon 版尚未配置 Developer ID 签名与苹果公证，Windows 未完成代码签名和真机验收。

### 用户本地快捷安装（无需签名公证的替代方案）

macOS Apple Silicon 用户可选择[官方源码安装脚本](../scripts/install-macos.sh)在本机编译，无需预先安装 Node/Rust/Git。该脚本只安装用户目录内的工具链和应用，不关闭 Gatekeeper、不更改系统代理；首次 Xcode CLT 仍需用户通过系统安装窗口确认。详见 [Agent 安装手册](AGENT_INSTALL.md)。

**重要区别：** 这种做法可以避免分发未签名二进制文件，但需要联网、数 GB 空间与数十分钟编译，并非签名和公证的等价替代。面向普通用户的**稳定版 DMG** 仍须依照下面检查项完成签名、公证和真机安装验收。维护者可另行明确授权公开未签名 **Pre-release**，但必须在标签、安装包文件名、下载说明中突出测试属性和安全限制。

### 先生成 Apple Silicon Draft Release

1. 先将 README、发布规格和 `.github/workflows/release-draft.yml` 合并到 `main`，等待仓库的常规 CI 通过。
2. GitHub → **Actions** → **Prepare macOS release draft** → **Run workflow**。
3. 选择 `main`、保留版本标签 `v0.1.0`，执行。工作流检查标签、package/Tauri 版本、运行架构，再编译应用。
4. 自动生成 `LaunchAnything_v0.1.0_macos_arm64_UNSIGNED.dmg`、`..._app.zip` 和 `SHA256SUMS.txt`，上传临时 Artifact，并创建一个 **Draft + prerelease**（仅维护者可审核的草稿）。
5. 打开 **Releases** 草稿，核对文件名称、SHA256、发布说明和安全状态。未经签名、公证及安装验收，**不得直接将草稿发布为公开 Stable Release**。

执行期间的 GitHub Actions Artifact 是临时构建产物，不代替稳定下载链接。草稿 Release 不会对普通用户显示为可下载版本。

### 无开发者证书时：公开未签名 Pre-release（开发者测试）

维护者选择先将已在 Apple Silicon Mac 真机安装验收的源码构建，通过 **GitHub Releases → Pre-release** 提供给愿意测试的开发者。它**不等于正式稳定发行**：标签使用 `v0.1.0-preview.1`，文件名含 `UNSIGNED`，发布说明要求 SHA-256 校验并明确未经过 Apple Developer ID 签名及公证。macOS 初次启动可以按 Apple 官方指引，在“隐私与安全性”中仅对这个应用选择“仍要打开”；**不建议全局关闭 Gatekeeper、SIP 或清除隔离属性**。

公开 Pre-release 采用 `publish-public-preview.yml` 的严格单文件发布标记分支触发，从当前主线提交构建，测试/校验通过后才发布，并设置 `prerelease=true`、不设 Latest。原 `release-draft.yml` 继续严格保持未签名工件只能作为草稿的约束，用于未来签名公证的正式发布工作。

### 真正面向普通用户公开前必须完成

- [ ] 配置 Apple Developer ID Application 签名证书与对应 Tauri 打包签名流程；证书和密码只通过 GitHub Secrets/环境密钥保管。
- [ ] 将 DMG 与应用包按 Apple 流程公证并完成 stapling；通过 `spctl`、`codesign`、`xcrun stapler validate` 验证分发工件。
- [ ] 在**全新普通用户 macOS 环境**，从 Release 下载 DMG、拖入 Applications、打开、持久化代理配置、启动受控测试 APP，检查 Gatekeeper 是否无额外绕过操作。
- [ ] 生成与已签名最终工件匹配的 SHA256SUMS；验证 release assets 与构建提交一致。
- [ ] 如需 Windows/Intel 一同上线：先分别完成真实系统验收、代码签名（Windows）、macOS Intel 公证，再合并到稳定分支，统一 Release 版本号与平台下载文件命名。
- [ ] 经过人工检查后再将 Draft Release 发布为正式公开版。

不推荐用户执行 `xattr -cr` 或关闭 Gatekeeper 来绕过安全检查。Windows 未签名安装包可能出现 SmartScreen 阻止，需要后续 Authenticode 签名策略。

## English

GitHub **Releases** should be the primary distribution channel for non-technical users. They should not need to install Git, Rust, Node or build from source.

As of October 15, 2026, the stable source is macOS Apple Silicon v0.1.0 with passing full app-bundle CI. Intel and Windows preview builds also pass native CI in their respective draft PRs, but real-device acceptance is pending. **No public Release, Apple Developer ID signing/notarization or Windows code signing exists yet.**

### Alternative: user-local source bootstrap

Apple Silicon users may build and install from source through the [official macOS installer script](../scripts/install-macos.sh) without preinstalling Git, Rust or Node. The Apple Xcode Command Line Tools dialog remains user-mediated. The bootstrap does not disable Gatekeeper or alter system proxy settings. See the [bilingual Agent installation runbook](AGENT_INSTALL.md).

This is not an equivalent substitute for a signed and notarized DMG. Native compilation may take 10–30+ minutes and multiple GB of disk, and distributing a prebuilt installer still requires signing and notarization.

### Prepare the Apple Silicon draft

1. Merge README/release workflow/specification to `main`; wait for CI.
2. GitHub → **Actions** → **Prepare macOS release draft** → **Run workflow** on `main`, version `v0.1.0`.
3. The workflow verifies versions and architecture, builds unsigned arm64 DMG and ZIP, checks bundled helper, generates SHA256SUMS, uploads the artifacts and creates a **draft prerelease**.
4. Review the draft and checksums. **Do not publish** as a public stable release while the artifacts are unsigned, unnotarized or untested on a fresh Mac.

### Public unsigned Pre-release for developer testing

The maintainer explicitly opted to publish a separate **unsigned, unnotarized GitHub Pre-release**, with an obvious `v0.1.0-preview.1` tag, `UNSIGNED` file names, SHA256 checksums, and per-app macOS **Privacy & Security → Open Anyway** guidance. It is **not a stable release**, does not bypass Gatekeeper globally and is not a substitute for signing or notarization.

The opt-in `publish-public-preview.yml` workflow accepts only a single docs-only marker commit derived from current main, performs tests and build verification, then publishes a public `prerelease=true` without setting Latest. The existing draft release workflow remains unchanged; signed/notarized stable distribution still requires the checks below.

### Public release checklist

- [ ] Configure Apple Developer ID Application signing using securely managed certificates/secrets.
- [ ] Notarize and staple the final application/DMG; verify via codesign, spctl and stapler.
- [ ] Complete end-user clean-machine installation and functional smoke test (including proxy profile persistence, port checks, and controlled app launch).
- [ ] Regenerate SHA256SUMS from final signed artifacts and confirm release tag ↔ source commit provenance.
- [ ] For Windows/Intel: separately pass genuine target-device acceptance; Windows Authenticode signing and Apple Intel notarization are required for non-expert-friendly installs.
- [ ] Perform a final manual review before publishing the draft.

Do not tell users to disable Gatekeeper or Windows SmartScreen to install preview artifacts.
