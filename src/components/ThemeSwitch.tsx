import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { translate, type MessageKey } from "@/lib/translations";

// Keep stored theme IDs unchanged: old preferences must still load after upgrade.
const themeLabels: Record<Theme, MessageKey> = {
  rose: "theme.rose",
  parasol: "theme.parasol",
  monochrome: "theme.dark",
};
const themeOrder: readonly Theme[] = ["rose", "parasol", "monochrome"];

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const { t, locale } = useI18n();
  const label = t(themeLabels[theme]);
  const secondaryLocale = locale === "zh-CN" ? "en" : "zh-CN";

  return <Select.Root value={theme} onValueChange={(next) => setTheme(next as Theme)}>
    <Select.Trigger aria-label={t("theme.title")} title={label} className="theme-switch-trigger">
      <span className={`theme-swatch theme-swatch-${theme}`} aria-hidden="true"/>
      <span className="hidden min-[950px]:inline">{label}</span>
      <ChevronDown size={13} aria-hidden="true"/>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper" sideOffset={7} align="end" collisionPadding={8} className="theme-switch-menu">
        <Select.Viewport className="p-1.5">
          <Select.Group>
            {themeOrder.map((value) => <ThemeOption
              key={value}
              value={value}
              label={t(themeLabels[value])}
              subtitle={translate(secondaryLocale, themeLabels[value])}
            />)}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}

function ThemeOption({ value, label, subtitle }: { value: Theme; label: string; subtitle: string }) {
  return <Select.Item value={value} className="theme-option">
    <span className={`theme-swatch theme-swatch-${value}`} aria-hidden="true"/>
    <span className="theme-option-copy">
      <Select.ItemText>{label}</Select.ItemText>
      <span className="theme-option-subtitle" aria-hidden="true">{subtitle}</span>
    </span>
    <Select.ItemIndicator className="ml-auto shrink-0 text-[var(--primary)]"><Check size={15} aria-hidden="true"/></Select.ItemIndicator>
  </Select.Item>;
}
