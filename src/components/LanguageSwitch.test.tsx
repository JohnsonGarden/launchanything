import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageSwitch } from "./LanguageSwitch";

const labels = { label: "语言", chineseLabel: "切换为中文", englishLabel: "Switch to English" };

describe("language switch", () => {
  it("renders a pill group with two semantic buttons and exactly one selection", () => {
    const html = renderToStaticMarkup(<LanguageSwitch locale="zh-CN" onChange={() => {}} {...labels} />);
    expect(html).toContain('class="language-switch"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="语言"');
    expect((html.match(/<button /g) ?? []).length).toBe(2);
    expect((html.match(/aria-pressed="true"/g) ?? []).length).toBe(1);
    expect(html).toContain('lang="zh-CN"');
    expect(html).toContain('lang="en"');
    expect(html).toContain('>中文</button>');
    expect(html).toContain('>EN</button>');
  });
  it("marks English as selected when the locale is English", () => {
    const html = renderToStaticMarkup(<LanguageSwitch locale="en" onChange={() => {}} {...labels} />);
    expect(html).toMatch(/lang="zh-CN"[^>]*aria-pressed="false"/);
    expect(html).toMatch(/lang="en"[^>]*aria-pressed="true"/);
  });
});
