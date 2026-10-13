import { describe, expect, it } from "vitest";
import { initialLocale } from "./i18n";
import { en, resolveLocale, translate, zhCN } from "./translations";
import { translatedValidationError } from "./validationI18n";

describe("locale selection", () => {
  it("uses simplified Chinese for Chinese macOS locales", () => {
    expect(resolveLocale("zh-CN")).toBe("zh-CN");
    expect(resolveLocale("zh-Hans-CN")).toBe("zh-CN");
    expect(resolveLocale("en-US")).toBe("en");
  });
  it("preserves an explicitly selected language after restart", () => {
    expect(initialLocale("zh-CN", "en")).toBe("en");
    expect(initialLocale("en-US", "zh-CN")).toBe("zh-CN");
    expect(initialLocale("zh-CN", "unexpected")).toBe("zh-CN");
  });
});

describe("translations", () => {
  it("provides every UI key in both languages", () => {
    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(en).sort());
  });
  it("substitutes dynamic names and process IDs without changing values", () => {
    expect(translate("zh-CN", "apps.launchedDetail", { pid: 142, message: "ok" })).toContain("142");
    expect(translate("en", "apps.editNamed", { name: "Chrome" })).toBe("Edit Chrome");
  });
  it("switches the same UI key between locales", () => {
    expect(translate("zh-CN", "apps.add")).toBe("添加应用");
    expect(translate("en", "apps.add")).toBe("Add application");
  });
  it("translates validation failures without changing the validator contract", () => {
    expect(translatedValidationError("Choose a proxy profile.", (key) => translate("zh-CN", key))).toBe("请选择代理配置。");
    expect(translatedValidationError("Unexpected system error", (key) => translate("zh-CN", key))).toBe("Unexpected system error");
  });
});
