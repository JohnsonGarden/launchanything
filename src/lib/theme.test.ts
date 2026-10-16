import { describe, expect, it } from "vitest";
import { readTheme, THEMES } from "@/lib/theme";
describe("persistent global appearance", () => {
  it("supports three selectable skins", () => {
    expect(THEMES).toEqual(["rose", "parasol", "monochrome"]);
  });
  it("defaults missing or invalid storage to rose", () => {
    expect(readTheme(null)).toBe("rose");
    expect(readTheme("unknown")).toBe("rose");
    expect(readTheme("rose")).toBe("rose");
  });
  it("restores both new themes", () => {
    expect(readTheme("parasol")).toBe("parasol");
    expect(readTheme("monochrome")).toBe("monochrome");
  });
});
