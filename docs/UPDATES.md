# LaunchAnything — 应用内签名更新设计与发布手册

## 功能与限制

「关于与安全 → 软件更新」会检查官方 GitHub Releases 的正式版与 Pre-release，按 SemVer 选出最高版本，而非按发布时间排序。可手动刷新；不自动降级。下载并原位安装更新必须用户确认，由 Tauri 原生更新器强制验证签名，再重新启动应用。现有配置数据不主动删除。

检查更新与安装可选择「系统网络」或应用内已保存的本地 HTTP / SOCKS5 代理端口；SOCKS5 采用远程 DNS 解析（socks5h）。不会修改全局系统代理，也不要求打开 TUN。

历史 v0.1.0-preview.1 / .2 / .3 **没有** Tauri 签名更新包，而且内部 App 版本是 0.1.0。因此旧用户需要**首次手动安装**一个包含可信更新公钥的新安装包。从此版本起才能通过界面一键更新后续版本；不允许伪造「热更新成功」。

没有签名更新包、未嵌入公钥、代理离线、网络异常、签名不符或系统禁止写入时，应保留现有版本、展示错误或官方手动下载地址，不得跳过校验或关闭 Gatekeeper。

## 仓库维护者的一次性签名密钥配置

1. 在本机项目运行：`npx tauri signer generate -w `/.tauri/launchanything-update.key`，安全保管生成的私钥和密码。公钥通常位于 `.key.pub` 文件。不要在聊天、git commit 或日志中发布私钥。
2. 在 GitHub 仓库 Settings → Secrets and variables → Actions 配置：
   - Repository variable：`LAUNCHANYTHING_UPDATE_PUBKEY` = 公钥完整文本（非秘密，会编译进客户端）。
   - Repository secret：`LAUNCHANYTHING_UPDATER_PRIVATE_KEY` = 私钥完整文本。
   - Repository secret：`LAUNCHANYTHING_UPDATER_PASSWORD` = 私钥密码；无密码时可留空。
3. 合并变更并通过 CI 后，从 Actions 手动运行 `Publish signed-updater macOS developer preview`，选择 main 分支。此工作流**只发布 Pre-release**，不可用于 Apple Stable。
4. 检查生成的 Release 包含：Apple Silicon 与 Intel DMG、相应两份 `.app.tar.gz`、两份 `.sig`、`updater.json`、SHA256 文件。
5. 用 macOS 真机手动安装首次支持签名更新的基线版本。新代码预留 `0.1.1-preview.1`，有意高于历史构建中使用的 `0.1.0`，避免 SemVer 错误降级。

Tauri 更新档案签名不等于 Apple Developer ID 签名或 notarization。当前新预览发布流程仍是**未 Apple 签名、未公证**的开发者测试版。正式 Stable Release 未来需要另外建立 Apple 签名/公证审核流程。

## 完整链路验收

- 先发布并手动安装 `v0.1.1-preview.1` 基线，再发布更高版本（例如 `v0.1.1-preview.2`）。只有第二版才能用来验证已安装客户端的真正原位更新能力。
- 分别在 arm64 和 Intel Mac 上测试发现更新、进度展示、验签、安装、重启、版本号刷新。
- 验证应用列表、代理配置、语言和主题完整保留。
- 测试系统网络、已保存本地 HTTP 代理、SOCKS5 代理（DNS 由代理侧处理），不应因网络失败悄悄回退直连。
- 测试网络断开、损坏包/错误签名、应用所在目录无写权限、同版本/更低版本、取消安装，确认全部安全失败。
- 分别验证 `/Applications 与 /Applications 下独立安装时正确更新正在运行的那一份 App。
- Windows 仍不在当前公开 Release 范围，不能据此宣传 Windows 更新已经可用。

正式发布前必须通过 CI、真实双架构安装测试以及至少两轮签名版本的端到端更新验收。
