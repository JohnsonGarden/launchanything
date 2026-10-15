import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const at = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const pkg = JSON.parse(at("../package.json"));
const win = JSON.parse(at("../src-tauri/tauri.windows.conf.json"));
const mac = JSON.parse(at("../src-tauri/tauri.macos.conf.json"));

describe("platform-isolated Windows build", () => {
  it("creates a user-scoped NSIS setup.exe, not a macOS bundle", () => {
    assert.deepEqual(win.bundle.targets, ["nsis"]);
    assert.equal(win.bundle.windows.nsis.installMode, "currentUser");
    assert.ok(win.bundle.icon.includes("icons/icon.ico"));
  });
  it("keeps macOS Swift resources out of Windows packages", () => {
    assert.ok(mac.bundle.resources["bin/launchanything-macos-helper"]);
    assert.equal(win.bundle.resources, null);
    assert.match(win.build.beforeBuildCommand, /web:build:windows/);
  });
  it("provides dedicated Windows commands with no macOS prebuild dependency", () => {
    assert.match(pkg.scripts["dev:windows"], /tauri dev/);
    assert.match(pkg.scripts["build:windows"], /tauri build/);
    assert.match(pkg.scripts["prepare:windows"], /node scripts\/prepare-windows.mjs/);
  });
});
