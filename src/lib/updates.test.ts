import { describe, expect, it } from "vitest";
import { compareVersions, parseVersion, pickLatestRelease } from "./updates";

const release = (tag_name: string, prerelease = true, signed = true) => ({
  tag_name, prerelease, draft: false, published_at: "2026-10-20T00:00:00Z",
  assets: signed ? [{ name: "updater.json" }] : [{ name: "LaunchAnything.dmg" }],
});

describe("GitHub release update selection", () => {
  it("compares stable and prerelease versions using SemVer", () => {
    expect(compareVersions("0.1.1", "0.1.1-preview.9")).toBeGreaterThan(0);
    expect(compareVersions("0.1.2-preview.1", "0.1.1")).toBeGreaterThan(0);
    expect(compareVersions("0.1.1-preview.10", "0.1.1-preview.9")).toBeGreaterThan(0);
    expect(compareVersions("0.1.1-preview.3", "0.1.1-preview.3")).toBe(0);
    expect(compareVersions("0.1.1-preview.1", "0.1.1-preview.2")).toBeLessThan(0);
  });

  it("rejects invalid and noncanonical prerelease versions", () => {
    expect(parseVersion("0.1")).toBeNull();
    expect(parseVersion("0.1.1-preview.01")).toBeNull();
    expect(parseVersion("latest")).toBeNull();
  });

  it("prefers the highest non-draft SemVer across channels", () => {
    const result = pickLatestRelease([
      release("v0.1.1-preview.2"),
      { ...release("v2.0.0"), draft: true },
      release("v0.1.1", false),
      release("v0.1.1-preview.10"),
      release("nightly"),
    ], "0.1.1-preview.1");
    expect(result.newer).toBe(true);
    expect(result.latest?.tag).toBe("v0.1.1");
    expect(result.latest?.prerelease).toBe(false);
  });

  it("never offers downgrades to unsigned historical previews", () => {
    const result = pickLatestRelease([release("v0.1.0-preview.3", true, false)], "0.1.0");
    expect(result.newer).toBe(false);
    expect(result.latest?.hasSignedUpdater).toBe(false);
  });

  it("does not advertise unsigned DMGs as signed in-app updates", () => {
    const result = pickLatestRelease([release("v0.1.2-preview.1", true, false)], "0.1.1");
    expect(result.newer).toBe(true);
    expect(result.latest?.hasSignedUpdater).toBe(false);
  });
});
