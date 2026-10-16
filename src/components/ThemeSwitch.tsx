import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, Moon, Palette } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const previews: Record<Theme, string> = {
  rose: "theme-preview-rose",
  parasol: "theme-preview-parasol",
  monochrome: "theme-preview-monochrome",
};
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const label = theme === "rose" ? t("theme.rose") : theme === "parasol" ? t("theme.parasol") : t("theme.dark");
  return <Select.Root value={theme} onValueChange={(next) => setTheme(next as Theme)}>
    <Select.Trigger aria-label={t("theme.title")} title={label} className="theme-switch-trigger">
      {theme === "monochrome" ? <Moon size={15} aria-hidden="true"/> : <Palette size={15} aria-hidden="true"/>}
      <span className="hidden min-[950px]:inline">{label}</span>
      <ChevronDown size={13} aria-hidden="true"/>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper" sideOffset={7} align="end" className="theme-switch-menu">
        <Select.Viewport className="p-1.5">
          <Select.Group>
            <Select.Label className="px-3 py-1.5 text-[11px] font-semibold text-[var(--soft-foreground)]">{t("theme.title")}</Select.Label>
            <ThemeOption value="rose" label={t("theme.rose")}/>
            <ThemeOption value="parasol" label={t("theme.parasol")}/>
            <ThemeOption value="monochrome" label={t("theme.dark")}/>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}
function ThemeOption({ value, label }: { value: Theme; label: string }) {
  return <Select.Item value={value} className="theme-option">
    <span className={`theme-preview ${previews[value]}`} aria-hidden="true"/>
    <Select.ItemText>{label}</Select.ItemText>
    <Select.ItemIndicator className="ml-auto text-[var(--primary)]"><Check size={15}/></Select.ItemIndicator>
  </Select.Item>;
}
