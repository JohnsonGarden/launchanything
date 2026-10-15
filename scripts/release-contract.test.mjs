import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const zh = read("../README.md");
const en = read("../README.en.md");
const workflow = read("../.github/workflows/release-draft.yml");
const pkg = JSON.parse(read("../package.json"));
const conf = JSON.parse(read("../src-tauri/tauri.conf.json"));

describe("bilingual public download documentation", () => {
  it("links official Releases, and does not claim unsigned previews are stable", () => {
    for (const doc of [zh, en]) {
      assert.match(doc, /github.com\/JohnsonGarden\/launchanything\/releases/);
      assert.match(doc, /actions\/runs\/38745634965/);
      assert.match(doc, /actions\/runs\/38745714406/);
      assert.match(doc, /unsigned|未签名/i);
      assert.match(doc, /Intel/);
      assert.match(doc, /Windows/);
    }
  });
  it("links both languages and keeps version in sync", () => {
    assert.equal(pkg.version, conf.version);
    assert.match(zh, /README\.en\.md/);
    assert.match(en, /README\.md/);
  });
});

describe("release workflow safety contract", () => {
  it("requires an explicit manual run from main and creates a draft", () => {
    assert.match(workflow, /workflow_dispatch:/);
    assert.match(workflow, /refs\/heads\/main/);
    assert.match(workflow, /--draft/);
    assert.match(workflow, /--prerelease/);
    assert.doesNotMatch(workflow, /--draft=false|--prerelease=false/);
  });
  it("checks arm64 main and helper, packages dmg/zip and produces sha256", () => {
    assert.match(workflow, /arm64/);
    assert.match(workflow, /lipo/);
    assert.match(workflow, /launchanything-macos-helper/);
    assert.match(workflow, /\.dmg/);
    assert.match(workflow, /\.zip/);
    assert.match(workflow, /shasum -a 256/);
    assert.match(workflow, /actions\/upload-artifact@/);
  });
  it("checks the release version before any GitHub release changes", () => {
    assert.match(workflow, /npm pkg get version/);
    assert.match(workflow, /tauri\.conf\.json/);
    assert.match(workflow, /gh release create/);
  });
});
