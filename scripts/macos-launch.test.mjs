import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";

const keys = ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY", "http_proxy", "https_proxy", "all_proxy", "no_proxy"];
const empty = Object.fromEntries(keys.map(key => [key, ""]));
const root = mkdtempSync(join(tmpdir(), "launchanything-native-test-"));
after(() => rmSync(root, { recursive: true, force: true }));

if (process.platform === "darwin") {
  writeFileSync(join(root, "probe.swift"), `import AppKit
import Foundation
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
app.finishLaunching()
let keys = ${JSON.stringify(keys)}
let report = CommandLine.arguments[1]
let result: [String: Any] = ["environment": ProcessInfo.processInfo.environment.filter { keys.contains($0.key) }, "arguments": Array(CommandLine.arguments.dropFirst(2))]
try JSONSerialization.data(withJSONObject: result).write(to: URL(fileURLWithPath: report))
DispatchQueue.main.asyncAfter(deadline: .now() + 1) { app.terminate(nil) }
app.run()
`);
  for (const [source, output] of [[resolve("src-tauri/native/Launcher.swift"), "helper"], [join(root, "probe.swift"), "probe"]]) {
    const compile = spawnSync("xcrun", ["swiftc", "-module-cache-path", join(tmpdir(), "launchanything-swift-test-cache"), "-framework", "AppKit", source, "-o", join(root, output)], { encoding: "utf8" });
    assert.equal(compile.status, 0, compile.stderr);
  }
}

for (const [mode, environment, arguments_] of [
  ["chromium", {}, ["--proxy-server=socks5://[::1]:10808"]],
  ["http", Object.fromEntries(keys.filter(key => !key.toLowerCase().startsWith("no_")).map(key => [key, "http://127.0.0.1:10808"])), ["--proxy-server=http://127.0.0.1:10808"]],
  ["socks5", Object.fromEntries(keys.map(key => [key, key.toLowerCase().startsWith("no_") ? "localhost,127.0.0.1,::1" : "socks5h://127.0.0.1:10808"])), ["--proxy-server=socks5://127.0.0.1:10808", "--proxy-bypass-list=localhost;127.0.0.1;::1"]],
]) {
  test(`${mode}: LaunchServices overrides inherited proxy values and preserves arguments`, { skip: process.platform !== "darwin" }, async () => {
    const bundle = join(root, `${mode} 测试.app`);
    mkdirSync(join(bundle, "Contents/MacOS"), { recursive: true });
    copyFileSync(join(root, "probe"), join(bundle, "Contents/MacOS/probe"));
    writeFileSync(join(bundle, "Contents/Info.plist"), `<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>dev.launchanything.test.${mode}.${process.pid}</string><key>CFBundleExecutable</key><string>probe</string><key>CFBundlePackageType</key><string>APPL</string></dict></plist>`);
    const report = join(root, `${mode}.json`);
    const result = spawnSync(join(root, "helper"), [], {
      input: JSON.stringify({ path: bundle, environment, arguments: [report, ...arguments_] }),
      env: { ...process.env, ...Object.fromEntries(keys.map(key => [key, "socks5h://poison.invalid:9"])) },
      encoding: "utf8", timeout: 35000,
    });
    assert.equal(result.status, 0, result.stdout || result.stderr);
    for (let attempt = 0; attempt < 50 && !existsSync(report); attempt++) await new Promise(resolve => setTimeout(resolve, 100));
    assert.deepEqual(JSON.parse(readFileSync(report, "utf8")), { environment: { ...empty, ...environment }, arguments: arguments_ });
    await new Promise(resolve => setTimeout(resolve, 1100));
  });
}
