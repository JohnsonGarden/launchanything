import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { diagnose } from "./doctor.mjs";

const good = {
  platform: "darwin",
  nodeMajor: 22,
  cargo: { state: "ok" },
  rustc: { state: "ok" },
  swiftc: { state: "ok" },
};
describe("macOS preflight", () => {
  it("accepts a complete Apple Silicon or Intel Mac toolchain", () => {
    assert.deepEqual(diagnose(good), []);
  });
  it("identifies missing Cargo and recommends official Rustup", () => {
    const messages = diagnose({ ...good, cargo: { state: "missing" }, rustc: { state: "missing" } });
    assert.deepEqual(messages.map(x => x.code), ["rust"]);
    assert.match(messages[0].message, /rustup\.rs/);
    assert.match(messages[0].message, /\.cargo\/env/);
  });
  it("identifies Cargo that is installed but broken", () => {
    const messages = diagnose({ ...good, cargo: { state: "broken" } });
    assert.match(messages[0].message, /无法正常运行/);
  });
  it("identifies missing Xcode CLT", () => {
    const messages = diagnose({ ...good, swiftc: { state: "missing" } });
    assert.deepEqual(messages.map(x => x.code), ["swift"]);
    assert.match(messages[0].message, /xcode-select --install/);
  });
  it("rejects old Node releases and non-macOS development", () => {
    const messages = diagnose({ ...good, platform: "linux", nodeMajor: 20 });
    assert.deepEqual(messages.map(x => x.code), ["platform", "node"]);
  });
});
