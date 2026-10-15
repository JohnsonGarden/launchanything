import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { resolveLocale, translate, type Locale, type MessageKey } from "./translations";

const STORAGE_KEY = "launchanything.locale";

export function initialLocale(language: string, stored: string | null): Locale {
  return stored === "zh-CN" || stored === "en" ? stored : resolveLocale(language);
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* Disabled or unavailable storage */ }
    return initialLocale(navigator.language, stored);
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* Use in-memory preference */ }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key, values) => translate(locale, key, values),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be called inside I18nProvider");
  return context;
}
