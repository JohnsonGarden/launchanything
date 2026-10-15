import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider } from "@/lib/i18n";
import { ProxyCompatibilityNotice } from "./AppEditor";
import type { LaunchMode, ProxyScheme } from "@/lib/models";

afterEach(() => vi.unstubAllGlobals());

function render(scheme: ProxyScheme, mode: LaunchMode, language = "en") {
  vi.stubGlobal("navigator", { language });
  vi.stubGlobal("localStorage", { getItem: () => null });
  return renderToStaticMarkup(<I18nProvider><ProxyCompatibilityNotice scheme={scheme} mode={mode}/></I18nProvider>);
}

describe("proxy compatibility guidance", () => {
  it("warns for SOCKS5 environment and combined modes in both languages", () => {
    for (const mode of ["environment", "combined"] as const) {
      for (const language of ["en", "zh-CN"]) {
        const html = render("socks5", mode, language);
        expect(html).toContain('role="note"');
        expect(html).toContain("socks5h://");
        expect(html).toContain("ERR_NO_SUPPORTED_PROXIES");
        expect(html).toContain(language === "en" ? "HTTP/mixed" : "HTTP/混合");
        expect(html).toContain(language === "en" ? "child processes" : "子进程");
      }
    }
  });
  it("does not warn for HTTP or isolated Chromium flags", () => {
    for (const mode of ["environment", "combined", "chromium"] as const) expect(render("http", mode)).toBe("");
    expect(render("socks5", "chromium")).toBe("");
  });
});
