# Antigravity proxy diagnosis / Antigravity 代理诊断

## Verified findings — 2026-10-13

The observed target was **Antigravity IDE 2.5.5**, bundle ID
`com.google.antigravity-ide`, not the separately installed Antigravity 2.23.0.
Do not confuse these bundles or their log directories.

| Evidence | Meaning / 含义 |
|---|---|
| Electron updater: `ERR_NO_SUPPORTED_PROXIES` | A proxy URL is unsupported. A separate isolated Electron probe reproduced this with `socks5h://`; `socks5://` and HTTP on the same listener returned 204. / 更新器代理协议不兼容。 |
| Agent LS at 19:05:54 and 19:08:41: `FAILED_PRECONDITION (code 400): User location is not supported for the API use.` | The authenticated Agent workflow was rejected by the service for location. This is independent of updater failure; exact eligibility/routing cause is unresolved. / 真实 Agent 请求被服务端以地区原因拒绝，具体判断依据仍未确定。 |
| curl via SOCKS5: valid TLS, API root 404 | Basic reachability only, not Agent success. / 仅证明基础连通，不证明 Agent 可用。 |
| Anonymous HTTP and SOCKS5 trace via 10808: country US | The listener supports both protocols and this trace used a US exit. Different destinations can follow different routing rules. / 该端口支持两种协议；这个测试的美国出口不代表所有目的地同一出口。 |
| Six established loopback proxy connections, no non-loopback established connections in the inspected target process snapshot | Supports proxy use at that instant; not comprehensive traffic capture or proof of the failed request's route. / 支持当时存在代理连接，不等于完整流量证明。 |
| Native fixture with poisoned parent variables | Empty Swift environment previously inherited all proxy keys. The fix blanks omitted keys and preserves explicit requests. / 修复前空环境仍继承代理变量，现显式清空未指定键。 |

Only error codes and selected proxy fields were used for diagnosis. No tokens,
cookies, credential files, raw logs or user workspaces are included here.

## Smallest next comparison / 最小对照

1. Keep the existing SOCKS5 profile for other clients. Create a separate profile:
   **HTTP / 127.0.0.1 / 10808**, only while that listener still supports HTTP.
   保留其他客户端的 SOCKS5 配置；为 Antigravity 单独使用已验证的 HTTP 端口。
2. Select the exact Antigravity IDE bundle and **Combined** with this HTTP profile.
   Fully quit it, including its language servers, and relaunch. Do not reuse a
   running process. / 选择正确应用与 HTTP 组合模式，完全退出后重启。
3. Send `Hi`, note the timestamp, and inspect the new session's **main.log** and
   **ls-main.log** independently. Updater success does not close the Agent issue.
   发送 Hi 后分别检查新会话更新器与 Agent 日志。
4. If the same location rejection persists, investigate the actual API
   destination's proxy routing and service/account eligibility. Do not change
   tokens, disable TLS verification, or infer success from an IP-check website.
   若地区拒绝持续，核查 API 目的地路由与服务/账号适用条件。

For this IDE, logs live under
`~/Library/Application Support/Antigravity IDE/logs/`, not `Antigravity/logs/`.
An error-only command prints fixed known messages, without arbitrary log payloads:

```bash
rg -n --only-matching 'ERR_NO_SUPPORTED_PROXIES|FAILED_PRECONDITION \(code 400\): User location is not supported for the API use\.' \
  "$HOME/Library/Application Support/Antigravity IDE/logs"
```

Match the new session/time; old errors remain in old logs. / 请匹配新会话时间，旧错误不会自动消失。

**Not verified / 未验证:** authenticated Agent success after HTTP relaunch,
destination-specific egress, comprehensive traffic/DNS capture, Intel runtime,
release signing/notarization. Keep PR draft.

## Related implementations reviewed / 同类项目实现

- [peroperoyui-lab/antigravity-proxy-launcher](https://github.com/peroperoyui-lab/antigravity-proxy-launcher/blob/main/antigravity-proxy-macos.command):
  HTTP(S)_PROXY uses an HTTP listener; ALL_PROXY can use a separate SOCKS listener.
  It probes an HTTP 204 endpoint and starts the bundle executable directly.
  Its automatic bundle detection targets Antigravity, so adapt paths for IDE.
  This supports reusing LaunchAnything's existing HTTP profile, rather than
  replacing generic socks5h behavior.
- [OpsinTech/AntigravityProxyLauncher](https://github.com/OpsinTech/AntigravityProxyLauncher):
  uses a patched app copy, signing changes and DYLD socket/DNS interception;
  includes optional MITM/model translation. This is substantially beyond startup
  environment injection and was reviewed only, not installed or run.
- [TuningZhou/antigravity-proxy-forMac](https://github.com/TuningZhou/antigravity-proxy-forMac/blob/antigravity-proxy-forMacOS/README_MAC.md):
  documents macOS dylib/FakeIP interception and reports its own end-to-end tests.
  Those reports do not verify this user's Agent or account.

Upstream claims are references, not proof of local success. / 上游项目宣称不代替本机验证。
