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
