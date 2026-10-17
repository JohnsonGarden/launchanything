import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { THEMES, readTheme } from "@/lib/theme";

const component = readFileSync(new URL("./ThemeSwitch.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

describe("compact header theme selector, design C", () => {
  it("keeps the original stored IDs and current selection after label changes", () => {
    expect(THEMES).toEqual(["rose", "parasol", "monochrome"]);
    for (const theme of THEMES) expect(readTheme(theme)).toBe(theme);
    expect(component).toContain('value={theme}');
    expect(component).toContain('setTheme(next as Theme)');
  });
  it("uses the same rounded-square color mark in trigger and all three menu items", () => {
    expect(component).toContain('theme-swatch-${theme}');
    expect(component).toContain('theme-swatch-${value}');
    expect(component).not.toContain("<Moon");
    expect(component).not.toContain("<Palette");
    expect(css).toContain(".theme-swatch {");
    expect(css).toContain("border-radius:5px");
    for (const theme of THEMES) expect(css).toContain(`.theme-swatch-${theme} {`);
    expect(css).not.toContain(".theme-preview-rose");
  });
  it("keeps the theme control in the header and menu bilingual without adding a page", () => {
    expect(component).toContain('Select.Trigger');
    expect(component).toContain('Select.Content');
    expect(component).toContain('Select.ItemIndicator');
    expect(component).toContain('locale === "zh-CN" ? "en" : "zh-CN"');
    expect(component).toContain("theme-option-subtitle");
    expect(component).toContain('aria-hidden="true"');
    expect(css).toContain(".theme-option-copy");
    expect(css).toContain(".theme-option[data-state=\"checked\"]");
  });
});
