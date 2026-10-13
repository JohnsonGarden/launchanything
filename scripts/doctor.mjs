/** Development-only readiness check; never installs or changes system tools. */
import { spawnSync } from "node:child_process";

export function probe(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: 12000 });
  const state = result.error?.code === "ENOENT" ? "missing"
    : result.error || result.status !== 0 ? "broken" : "ok";
  return {
    state,
    version: result.status === 0 ? (result.stdout || "").trim().split("\n")[0] : null,
    detail: state === "broken" ? (result.stderr || result.error?.message || "unknown error").trim().slice(0, 240) : null,
  };
}

/** Pure and deterministic, suitable for SDD acceptance tests. */
export function diagnose({ platform, nodeMajor, cargo, rustc, swiftc }) {
  const issues = [];
  if (platform !== "darwin") issues.push({
    code: "platform",
    message: "当前项目仅支持 macOS 开发 / This project currently builds on macOS only.",
  });
  if (!Number.isInteger(nodeMajor) || nodeMajor < 22) issues.push({
    code: "node",
    message: "需要 Node.js 22 或更高版本 / Node.js 22+ is required. 请升级 Node.js。",
  });
  if (cargo.state !== "ok" || rustc.state !== "ok") {
    const reason = cargo.state === "broken" || rustc.state === "broken"
      ? "Rust 工具已存在但无法正常运行 / Rust tools exist but fail to run."
      : "未找到 Cargo/Rust，或未加入 PATH / Cargo or Rust missing from PATH.";
    issues.push({
      code: "rust",
      message: `${reason}
  官方安装 / Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  当前终端生效 / Activate: source "$HOME/.cargo/env"
  确认 / Verify: cargo --version && rustc --version
  如果已安装却找不到 cargo，可先重新打开终端 / If installed, restart your terminal.`,
    });
  }
  if (swiftc.state !== "ok") issues.push({
    code: "swift",
    message: `未发现可用的 macOS Swift 编译器 / Swift compiler unavailable.
  安装开发工具 / Install Xcode Command Line Tools: xcode-select --install
  确认 / Verify: xcrun --find swiftc`,
  });
  return issues;
}

const isDirect = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].startsWith("/") ? "" : process.cwd() + "/"}${process.argv[1]}`).href;
if (isDirect) {
  const env = {
    platform: process.platform,
    nodeMajor: Number(process.versions.node.split(".")[0]),
    cargo: probe("cargo", ["--version"]),
    rustc: probe("rustc", ["--version"]),
    swiftc: probe("xcrun", ["--find", "swiftc"]),
  };
  console.log("\nLaunchAnything · macOS developer environment / 开发环境检查");
  console.log(`  macOS: ${env.platform === "darwin" ? "✓" : "✗"}`);
  console.log(`  Node.js: ${process.version}`);
  console.log(`  cargo: ${env.cargo.version ?? env.cargo.state}`);
  console.log(`  rustc: ${env.rustc.version ?? env.rustc.state}`);
  console.log(`  Swift: ${env.swiftc.state}`);
  const issues = diagnose(env);
  if (issues.length) {
    for (const { message } of issues) console.error(`\n✗ ${message}`);
    console.error("\n请完成安装后重新运行 npm run dev / Resolve issues and retry npm run dev.");
    process.exitCode = 1;
  } else {
    console.log("\n✓ 环境检查通过 / All required developer tools available.\n");
  }
}
