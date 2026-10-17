# LaunchAnything v0.1.0 — Intel Mac unsigned preview / Intel Mac 未签名测试版

**Intel x86_64 only · macOS 12+ · developer preview · not notarized · not yet accepted on a real Intel Mac.**
**仅适用于 Intel 芯片 Mac；未经 Apple 签名/公证，尚未完成 Intel 真机验收。**

## 下载与安装

1. 打开 [Intel GitHub Actions 预览构建](https://github.com/JohnsonGarden/launchanything/actions/workflows/macos-intel-preview.yml)。
2. 进入成功的 Intel 构建，下载底部 **Artifacts → LaunchAnything-v0.1.0-macos-x86_64-UNSIGNED**（可能需要登录 GitHub；30 天保留期）。
3. 解压 Actions Artifact ZIP。在目录内执行 `shasum -a 256 -c SHA256SUMS.txt`，确认 DMG 和 ZIP 校验均为 `OK`。查看 `BUILD_INFO.txt` 的源码提交信息。SHA-256 证明文件与校验清单一致，但不代表证书认证。
4. 打开 `LaunchAnything_v0.1.0_macos_x86_64_UNSIGNED.dmg`，将 App 拖到 Applications；**不要**在 Apple Silicon Mac 上安装这个仅 Intel 版本。
5. 若 macOS 因“无法验证开发者/未公证”拒绝打开，先尝试启动一次，再通过 **系统设置 → 隐私与安全性 → 仍要打开（Open Anyway）** 针对该应用放行。不要关闭 Gatekeeper/SIP，不要全局开放“任何来源”，不要清除整个 App 的隔离属性。若 macOS 报告软件损坏或含恶意软件，应立即停止安装并反馈。

请阅读 [Apple 官方说明](https://support.apple.com/zh-cn/102445)。

## 真机验收清单（待完成）

- [ ] 在**真实 Intel Mac（x86_64，macOS 12+）** 打开 GUI。
- [ ] 点击“添加应用 → 浏览”，默认打开 `/Applications`，可选择其他目录的 `.app`。
- [ ] 创建或修改 HTTP / SOCKS5 代理配置，重启应用确认设置持久化。
- [ ] 验证代理端口不可达会阻止启动。
- [ ] 在代理端口可达的条件下启动一个受控的应用，检查实际代理流量/出口 IP 与日志。
- [ ] 核实安装、首次启动、卸载流程并反馈 macOS 版本、处理器及非敏感复现步骤。

**安全边界：** LaunchAnything 是逐应用启动代理配置器，不是 VPN，也不会强制接管全部网络流量。

## English

This download is an **unsigned, unnotarized native Intel x86_64 DMG**. It was compiled and statically verified by GitHub Actions on an Intel macOS runner, but it has **not yet passed an end-user Intel Mac smoke test**.

Download from [Intel GitHub Actions](https://github.com/JohnsonGarden/launchanything/actions/workflows/macos-intel-preview.yml). Extract the artifact, run `shasum -a 256 -c SHA256SUMS.txt`, inspect `BUILD_INFO.txt`, mount the DMG and copy the app into Applications. If macOS blocks only an unidentified developer, try opening first, then use **System Settings → Privacy & Security → Open Anyway** for this app. Do not globally disable Gatekeeper, SIP or quarantine. Stop for a malware/tampering/damaged-app alert.

Please test the app picker, settings persistence, local proxy listener checks, and controlled actual proxy egress on a real Intel Mac before recommending it to ordinary users.
