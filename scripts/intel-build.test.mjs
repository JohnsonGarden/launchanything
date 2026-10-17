import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const prepare = readFileSync(new URL("prepare-macos.sh", import.meta.url), "utf8");
const script = readFileSync(new URL("verify-macos-architecture.sh", import.meta.url), "utf8");

describe("macOS Intel build contract", () => {
  it("provides an isolated Intel build command with architecture targeting", () => {
    assert.match(pkg.scripts["build:macos-intel"], /LAUNCHANYTHING_MACOS_ARCH=x86_64/);
    assert.match(pkg.scripts["build:macos-intel"], /x86_64-apple-darwin/);
    assert.ok(pkg.scripts["prebuild:macos-intel"]?.includes("doctor"));
  });
  it("compiles the Swift launcher for the requested architecture", () => {
    assert.match(prepare, /LAUNCHANYTHING_MACOS_ARCH/);
    assert.match(prepare, /x86_64-apple-macos/);
    assert.match(prepare, /-target/);
    assert.match(prepare, /lipo/);
  });
  it("rejects missing or incorrect Intel Mach-O bundles", () => {
    assert.match(script, /x86_64-apple-darwin/);
    assert.match(script, /lipo/);
    assert.match(script, /Contents\/MacOS/);
    assert.match(script, /Contents\/Resources\/bin/);
  });
});


const workflow = readFileSync(new URL("../.github/workflows/macos-intel-preview.yml", import.meta.url), "utf8");
const guide = readFileSync(new URL("../docs/INTEL_PREVIEW.md", import.meta.url), "utf8");

describe("Intel GitHub Actions preview distribution", () => {
  it("uses a native Intel runner, verifying x86_64 before packaging", () => {
    assert.match(workflow, /macos-15-intel/);
    assert.match(workflow, /uname -m/);
    assert.match(workflow, /x86_64/);
    assert.match(workflow, /verify:macos-intel/);
  });
  it("emits DMG, app ZIP, checksum, provenance, and never releases as stable", () => {
    assert.match(workflow, /\.dmg/);
    assert.match(workflow, /\.zip/);
    assert.match(workflow, /shasum -a 256/);
    assert.match(workflow, /BUILD_INFO/);
    assert.match(workflow, /upload-artifact@/);
    assert.doesNotMatch(workflow, /gh release create|spctl --master-disable|xattr -cr/);
  });
  it("discloses untested native Intel status and per-app exception", () => {
    assert.match(guide, /未签名/);
    assert.match(guide, /Intel/);
    assert.match(guide, /Open Anyway/);
    assert.match(guide, /SHA256SUMS/);
    assert.match(guide, /真机验收/);
  });
});
