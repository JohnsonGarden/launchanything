import { describe, expect, it } from "vitest";
import { appDisplayName, validateApp } from "./validation";
import type { AppEntry } from "./models";

const app: AppEntry = { id: "w1", name: "Chrome", appPath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", profileId: "local-default", mode: "chromium" };

describe("Windows executable path compatibility", () => {
  it("accepts an absolute drive-qualified .exe path on Windows", () => {
    expect(validateApp(app, "windows")).toBeNull();
  });
  it("rejects relative, wrong extension and mac-only paths on Windows", () => {
    expect(validateApp({ ...app, appPath: "chrome.exe" }, "windows")).toBeTruthy();
    expect(validateApp({ ...app, appPath: "C:\\Tools\\chrome.bat" }, "windows")).toBeTruthy();
    expect(validateApp({ ...app, appPath: "/Applications/Chrome.app" }, "windows")).toBeTruthy();
  });
  it("preserves Mac path validation and supports both filename conventions", () => {
    expect(validateApp({ ...app, appPath: "/Applications/Chrome.app" }, "macos")).toBeNull();
    expect(validateApp(app, "macos")).toBeTruthy();
    expect(appDisplayName(app.appPath)).toBe("chrome");
    expect(appDisplayName("/Applications/Google Chrome.app")).toBe("Google Chrome");
  });
});
