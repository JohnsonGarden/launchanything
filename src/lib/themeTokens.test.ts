import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const buttons = readFileSync(new URL("../components/ui/button.tsx", import.meta.url), "utf8");

function luminance(hex: string) {
  const channels = hex.match(/[a-f0-9]{2}/gi)?.map(part => {
    const n = parseInt(part, 16) / 255;
    return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
  });
  if (!channels || channels.length !== 3) throw new Error("invalid hex color");
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x,y) => y-x);
  return (hi+.05)/(lo+.05);
}

describe("semantic three-theme design contract", () => {
  it("covers all three root palettes", () => {
    for(const theme of ["rose","parasol","monochrome"]) {
      expect(css).toContain(`:root[data-theme="${theme}"]`);
    }
  });
  it("uses the source Parasol sky, cloud, sage, moss and ink colors", () => {
    for(const hex of ["#F8FCFF","#FEFDF9","#E4EFDC","#4F5E39","#263039","#5698B8"]) {
      expect(css).toContain(hex);
    }
  });
  it("keeps white-text primary action accessible at WCAG AA", () => {
    expect(contrast("#FFFFFF","#35728E")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF","#D1244F")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FAFAFA","#09090B")).toBeGreaterThanOrEqual(4.5);
  });
  it("does not ship rose-specific button shadows across other skins", () => {
    expect(buttons).toContain("theme-primary-button");
    expect(buttons).not.toContain("rgba(209,36,79");
    expect(css).toContain(".app-editor-footer");
    expect(css).toContain(".app-editor-scroll { overflow-y:auto;");
    expect(css).toContain(".launch-mode-choice[data-state");
  });
});
