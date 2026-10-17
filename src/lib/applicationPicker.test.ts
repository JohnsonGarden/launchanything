import { describe, expect, it } from "vitest";
import { applicationPickerOptions, MACOS_APPLICATIONS_DIRECTORY } from "./applicationPicker";

describe("macOS installed-app picker", () => {
  it("starts in the system Applications directory with a single-file dialog", () => {
    expect(MACOS_APPLICATIONS_DIRECTORY).toBe("/Applications");
    for (const title of ["浏览应用", "Browse applications"]) {
      expect(applicationPickerOptions(title)).toEqual({
        title,
        defaultPath: "/Applications",
        directory: false,
        multiple: false,
      });
    }
  });

  it("returns a fresh options object so consumers cannot reuse mutated dialog state", () => {
    const first = applicationPickerOptions("Browse");
    const second = applicationPickerOptions("Browse");
    expect(first).not.toBe(second);
  });
});
