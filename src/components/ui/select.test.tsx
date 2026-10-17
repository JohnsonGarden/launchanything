import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { FormSelect } from "./select";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("dialog selects use shared shadcn/Radix UI", () => {
  it("renders a semantic combobox aligned with the input's size, border and theme tokens", () => {
    const html = renderToStaticMarkup(
      <FormSelect
        ariaLabel="协议"
        value="http"
        onValueChange={() => {}}
        options={[{ value: "http", label: "HTTP" }, { value: "socks5", label: "SOCKS5" }]}
      />,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-label="协议"');
    expect(html).toContain("h-10");
    expect(html).toContain("rounded-[10px]");
    expect(html).toContain("var(--border)");
    expect(html).toContain("var(--card)");
    expect(html).not.toContain("<select");
    expect(html).not.toContain("appearance: auto");
  });
  it("supports empty disabled profile picker without a native select fallback", () => {
    const html = renderToStaticMarkup(
      <FormSelect ariaLabel="代理配置" value="" disabled onValueChange={() => {}} options={[]} />,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain("disabled");
  });
  it("both dialogs use the common control and retain controlled form updates", () => {
    for (const path of ["../ProxyEditor.tsx", "../AppEditor.tsx"]) {
      const src = read(path);
      expect(src).toContain("FormSelect");
      expect(src).toContain("onValueChange=");
      expect(src).not.toContain("<select ");
      expect(src).not.toContain('className="field-select"');
    }
    const component = read("./select.tsx");
    expect(component).toContain("SelectPrimitive.Item");
    expect(component).toContain("SelectPrimitive.ItemIndicator");
    expect(component).toContain("data-[highlighted]");
    expect(component).toContain("z-[100]");
  });
});
