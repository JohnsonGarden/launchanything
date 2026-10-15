import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

if (process.platform !== "win32") {
  console.error("Windows icons can only be prepared for a native Windows build.");
  process.exit(1);
}
const dir = "src-tauri/icons";
if (!existsSync(`${dir}/icon.ico`) || !existsSync(`${dir}/128x128.png`)) {
  // Inputs are fixed project paths; no user-supplied shell fragments.
  const result = spawnSync("npm.cmd", [
    "exec", "--", "tauri", "icon", `${dir}/icon.svg`, "--output", dir,
  ], { stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log("Windows .ico and PNG bundle icons are available.");
