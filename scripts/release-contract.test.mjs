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


const previewWorkflow = read("../.github/workflows/developer-preview.yml");
const previewDoc = read("../docs/UNSIGNED_PREVIEW.md");

describe("unsigned developer-preview workflow safety", () => {
  it("limits preview builds to opted-in preview branches or manual dispatch", () => {
    assert.match(previewWorkflow, /workflow_dispatch:/);
    assert.match(previewWorkflow, /release-preview\/\*\*/);
    assert.match(previewWorkflow, /contents: read/);
    assert.doesNotMatch(previewWorkflow, /gh release create|--draft=false|spctl --master-disable|xattr -cr/);
  });
  it("builds unsigned arm64 DMG and ZIP, verifies the helper and uploads checksum files", () => {
    assert.match(previewWorkflow, /uname -m/);
    assert.match(previewWorkflow, /lipo/);
    assert.match(previewWorkflow, /launchanything-macos-helper/);
    assert.match(previewWorkflow, /\.dmg/);
    assert.match(previewWorkflow, /\.zip/);
    assert.match(previewWorkflow, /shasum -a 256/);
    assert.match(previewWorkflow, /actions\/upload-artifact@/);
    assert.match(previewWorkflow, /retention-days:/);
  });
  it("documents per-app exception, checksum validation and unsigned status", () => {
    assert.match(previewDoc, /SHA256SUMS\.txt/);
    assert.match(previewDoc, /仍要打开/);
    assert.match(previewDoc, /Open Anyway/);
    assert.match(previewDoc, /unsigned|未签名/i);
    assert.match(previewDoc, /Apple Silicon/);
  });
});


const publicWorkflow = read("../.github/workflows/publish-public-preview.yml");
const publicNotes = read("../docs/releases/public-preview-v0.1.0.md");

describe("opt-in public prerelease contract", () => {
  it("only responds to an explicit one-time release branch marker", () => {
    assert.match(publicWorkflow, /publish-preview\/v0\.1\.0-preview\.1/);
    assert.match(publicWorkflow, /PUBLISH-v0\.1\.0-preview\.1\.md/);
    assert.match(publicWorkflow, /git diff --name-only/);
    assert.match(publicWorkflow, /git rev-parse HEAD\^/);
    assert.match(publicWorkflow, /checkout --detach/);
  });
  it("creates only a public unsigned GitHub prerelease, not Latest or Stable", () => {
    assert.match(publicWorkflow, /gh release create/);
    assert.match(publicWorkflow, /--prerelease/);
    assert.match(publicWorkflow, /--latest=false/);
    assert.doesNotMatch(publicWorkflow, /--draft=false|--prerelease=false|spctl --master-disable|xattr -cr/);
    assert.match(publicWorkflow, /lipo/);
    assert.match(publicWorkflow, /shasum -a 256/);
  });
  it("clearly labels the download as unsigned and unnotarized", () => {
    assert.match(publicNotes, /UNSIGNED/);
    assert.match(publicNotes, /UNNOTARIZED/);
    assert.match(publicNotes, /SHA256SUMS/);
    assert.match(publicNotes, /仍要打开/);
    assert.match(publicNotes, /Intel/);
  });
});
