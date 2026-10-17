# LaunchAnything — unsigned macOS developer preview / 未签名开发预览

**Scope / 适用范围:** macOS 12+ **Apple Silicon (M1/M2/M3/M4/M5, arm64)**, v0.1.0 preview.
**This build is unsigned and not notarized by Apple. It is not a stable release.**
**本构建未经 Apple Developer ID 签名和公证，不是面向普通用户的正式稳定版。**

## 下载（无需安装 Rust、Node.js 或 Xcode）

1. 打开 [Developer preview workflow](https://github.com/JohnsonGarden/launchanything/actions/workflows/developer-preview.yml)。
2. 选择成功完成的 macOS arm64 workflow run，在运行详情下方 **Artifacts** 下载 `LaunchAnything-v0.1.0-macos-arm64-UNSIGNED`。GitHub 下载 Actions artifacts 时可能需要登录账号。产物只保留 **30 天**，过期后重新运行 workflow。
3. 解压下载的 Actions artifact ZIP，你会得到 `LaunchAnything_v0.1.0_macos_arm64_UNSIGNED.dmg`、`LaunchAnything_v0.1.0_macos_arm64_UNSIGNED_app.zip`、`SHA256SUMS.txt`、`BUILD_INFO.txt`。这两种安装包是**二选一**，正常安装建议使用 DMG。
4. 在四个文件所在目录打开终端，核对：

   ```bash
   shasum -a 256 -c SHA256SUMS.txt
   ```

   两个包都应显示 `OK`；如有不匹配，停止安装并反馈。请同时阅读 `BUILD_INFO.txt`，核实源代码提交及版本。哈希只能校验完整性，不能代替开发者签名身份认证。

## 安装 / 首次打开

1. 打开 DMG，将 `LaunchAnything.app` 拖入 `应用程序 / Applications`。
2. 尝试正常启动一次。macOS 可能提示无法验证开发者或无法检查是否存在恶意软件。
3. **仅当你明确确认下载来源与校验值可信、且警告属于无法验证开发者/未公证时**：打开 **系统设置 → 隐私与安全性 → 仍要打开（Open Anyway）**，按 macOS 提示再次确认。按钮可能只在尝试启动后的有限时间内出现。
4. 以后一般可正常启动。**不需要也不建议**开启“任何来源”、全局关闭 Gatekeeper、关闭 SIP、运行 `sudo spctl --master-disable` 或使用 `xattr -cr` 清除隔离属性。若系统提示应用已损坏、含恶意软件或存在其他异常，不要绕过，先停止测试并提交 Issue。

官方指引：[Apple — 在 Mac 上安全地打开 App](https://support.apple.com/zh-cn/102445)。

## 验收（需要真实 Mac）

- 在 **Apple Silicon macOS 12+** 验证启动、设置保存与重启持久化。
- 启动本机代理客户端，确认本地监听端口可用；在 LaunchAnything 新增代理。
- 用可控的目标应用验证启动方式与实际网络出口。**端口可达或 App 成功启动并不代表所有流量走代理。**
- 回报 macOS 版本、芯片类型、应用版本、构建 SHA、复现操作和脱敏日志；不要上传密钥、Cookie、私人代理链接或敏感配置。

## 卸载

退出 LaunchAnything，删除 `/Applications/LaunchAnything.app`（或实际拖入位置）。应用本地配置可能继续保留于用户目录；如需删除数据，请先手动备份再处理。

---

## English — Developer installation notes

1. Visit [macOS unsigned preview Actions](https://github.com/JohnsonGarden/launchanything/actions/workflows/developer-preview.yml), open a successful run, and download the `LaunchAnything-v0.1.0-macos-arm64-UNSIGNED` artifact (GitHub login may be required; 30-day retention).
2. Extract the artifact ZIP. Verify `shasum -a 256 -c SHA256SUMS.txt`, inspect `BUILD_INFO.txt` and open the DMG, then drag the app into Applications.
3. Attempt to open the app normally. If macOS blocks it **only because the developer is unidentified / the app is not notarized**, go to **System Settings → Privacy & Security → Open Anyway**, then confirm. This makes a one-app exception without disabling security globally. Stop if macOS instead reports malicious or damaged software.
4. Test local proxy settings, persistence, app launch, and real traffic against a controlled target. Never infer that all traffic is proxied merely from a successful launch.

**No paid Apple signing is used; this is an unsigned development artifact, not a public stable release.** Do not globally turn off Gatekeeper or bypass quarantine. The release-draft workflow for future signed builds remains separate.
