import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const script = read("install-macos.sh");

describe("macOS source installer contract", () => {
  it("has valid Bash syntax", () => {
    const proc = spawnSync("bash", ["-n", new URL("install-macos.sh", import.meta.url).pathname], { encoding:"utf8" });
    assert.equal(proc.status, 0, proc.stderr);
  });
  it("exposes safe modes and rejects unknown arguments", () => {
    for (const x of ["--check", "--dry-run", "--yes", "--launch", "--help"])
      assert.ok(script.includes(x), x);
    const proc = spawnSync("bash", [new URL("install-macos.sh", import.meta.url).pathname, "--unexpected"], { encoding:"utf8" });
    assert.notEqual(proc.status, 0);
  });
  it("does not bypass Gatekeeper or silently elevate privileges", () => {
    assert.doesNotMatch(script, /\bsudo\b|spctl\s+--master-disable|xattr\s+-[crd]|curl[^\n]*\|\s*(?:bash|sh)/);
    assert.match(script, /xcode-select --install/);
    assert.match(script, /rustup\.rs/);
    assert.match(script, /node@22/);
  });
  it("validates build outputs and preserves existing installation on errors", () => {
    assert.match(script, /--dry-run/);
    assert.match(script, /--check/);
    assert.match(script, /npm run build/);
    assert.match(script, /LaunchAnything\.app/);
    assert.match(script, /launchanything-macos-helper/);
    assert.match(script, /ditto/);
    assert.match(script, /backup/);
    assert.match(script, /trap/);
  });
  it("ships bilingual instructions and the agent runbook", () => {
    assert.ok(existsSync(new URL("../docs/INSTALL_AGENT.md", import.meta.url)));
    for (const name of ["../README.md", "../README.en.md"]) {
      const text = read(name);
      assert.match(text, /install-macos\.sh/);
    }
  });
});
