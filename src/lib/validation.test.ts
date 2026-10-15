import { describe, expect, it } from "vitest";
import { appDisplayName, displayEndpoint, validateApp, validateProfile } from "./validation";
import type { AppEntry, ProxyProfile } from "./models";

const profile: ProxyProfile = {
  id: "p1", name: "Local", host: "127.0.0.1", port: 7890, scheme: "http", bypass: ["localhost"],
};
const app: AppEntry = { id: "a1", name: "Chrome", appPath: "/Applications/Google Chrome.app", profileId: "p1", mode: "chromium" };

describe("configuration validation", () => {
  it("accepts a valid local profile", () => expect(validateProfile(profile)).toBeNull());
  it("rejects URLs in the hostname", () => expect(validateProfile({ ...profile, host: "http://localhost" })).toBeTruthy());
  it("rejects illegal ports", () => {
    expect(validateProfile({ ...profile, port: 0 })).toBeTruthy();
    expect(validateProfile({ ...profile, port: 65536 })).toBeTruthy();
    expect(validateProfile({ ...profile, port: 7890 })).toBeNull();
  });
  it("rejects broken bypass syntax", () => expect(validateProfile({ ...profile, bypass: ["example.com;evil"] })).toBeTruthy());
  it("requires an absolute app bundle", () => {
    expect(validateApp(app)).toBeNull();
    expect(validateApp({ ...app, appPath: "./Test.app" })).toBeTruthy();
  });
  it("formats app names and IPv6 endpoints", () => {
    expect(appDisplayName(app.appPath)).toBe("Google Chrome");
    expect(displayEndpoint({ ...profile, host: "::1" })).toBe("[::1]:7890");
  });
});
