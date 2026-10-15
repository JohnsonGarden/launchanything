import { Languages } from "lucide-react";
import type { Locale } from "@/lib/translations";

interface LanguageSwitchProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
  label: string;
  chineseLabel: string;
  englishLabel: string;
}

/** Compact shadcn-style segmented control; both options are real accessible buttons. */
export function LanguageSwitch({ locale, onChange, label, chineseLabel, englishLabel }: LanguageSwitchProps) {
  return <div className="language-switch" role="group" aria-label={label}>
    <Languages className="language-switch-icon" size={15} strokeWidth={1.8} aria-hidden="true" />
    <button type="button" className="language-option" lang="zh-CN" aria-label={chineseLabel}
      aria-pressed={locale === "zh-CN"} onClick={() => onChange("zh-CN")}>中文</button>
    <button type="button" className="language-option" lang="en" aria-label={englishLabel}
      aria-pressed={locale === "en"} onClick={() => onChange("en")}>EN</button>
  </div>;
}
