import { describe, expect, it } from "node:test";
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
    expect(diagnose(good)).toEqual([]);
  });
  it("identifies missing Cargo and recommends official Rustup", () => {
    const messages = diagnose({ ...good, cargo: { state: "missing" }, rustc: { state: "missing" } });
    expect(messages.map(x => x.code)).toEqual(["rust"]);
    expect(messages[0].message).toMatch(/rustup\.rs/);
    expect(messages[0].message).toMatch(/\.cargo\/env/);
  });
  it("identifies Cargo that is installed but broken", () => {
    const messages = diagnose({ ...good, cargo: { state: "broken" } });
    expect(messages[0].message).toMatch(/无法正常运行/);
  });
  it("identifies missing Xcode CLT", () => {
    const messages = diagnose({ ...good, swiftc: { state: "missing" } });
    expect(messages.map(x => x.code)).toEqual(["swift"]);
    expect(messages[0].message).toMatch(/xcode-select --install/);
  });
  it("rejects old Node releases and non-macOS development", () => {
    const messages = diagnose({ ...good, platform: "linux", nodeMajor: 20 });
    expect(messages.map(x => x.code)).toEqual(["platform", "node"]);
  });
});
