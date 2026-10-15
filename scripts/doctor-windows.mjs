import { probe } from "./doctor.mjs";

const state = {
  nodeMajor: Number(process.versions.node.split(".")[0]),
  cargo: probe("cargo", ["--version"]),
  rustc: probe("rustc", ["--version"]),
};
console.log("LaunchAnything Windows developer check / Windows 开发环境检查");
console.log("Platform:", process.platform, "Node:", process.version);
console.log("Cargo:", state.cargo.version ?? state.cargo.state);
console.log("Rustc:", state.rustc.version ?? state.rustc.state);
const issues = [];
if (process.platform !== "win32") issues.push("Windows-only build: run on Windows 10/11 x64.");
if (process.arch !== "x64") issues.push("Windows x64 build requires a 64-bit Node runtime.");
if (state.nodeMajor < 22) issues.push("Node 22+ required.");
if (state.cargo.state !== "ok" || state.rustc.state !== "ok") issues.push("Install stable Rust MSVC toolchain and reopen the terminal: https://rustup.rs");
if (issues.length) {
  issues.forEach(message => console.error("✗", message));
  process.exitCode = 1;
} else {
  console.log("✓ Rust/Node prerequisites detected.");
  console.log("Ensure Visual Studio C++ Build Tools, Windows SDK and WebView2 Runtime are installed.");
}
