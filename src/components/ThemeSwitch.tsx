import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

export function ThemeSwitch() {
  const {theme,setTheme}=useTheme();
  const {t}=useI18n();
  return <Select.Root value={theme} onValueChange={(v)=>setTheme(v as typeof theme)}>
    <Select.Trigger aria-label={t("theme.title")} className="theme-switch-trigger">
      {theme==="monochrome" ? <Moon size={15} aria-hidden="true"/> : <Palette size={15} aria-hidden="true"/>}
      <span className="hidden min-[1100px]:inline">{theme==="monochrome"?t("theme.dark"):t("theme.rose")}</span>
      <ChevronDown size={13} aria-hidden="true"/>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper" sideOffset={7} align="end" className="theme-switch-menu">
        <Select.Viewport className="p-1.5">
          <Select.Group>
            <Select.Label className="px-3 py-1.5 text-[11px] font-semibold text-[var(--soft-foreground)]">{t("theme.title")}</Select.Label>
            <ThemeOption value="rose" label={t("theme.rose")} icon={<Sun size={15}/>} />
            <div className="theme-option theme-option-disabled" aria-disabled="true" title={t("theme.pendingDescription")}>
              <span className="w-4 shrink-0"><Palette size={15}/></span>
              <span className="flex-1">{t("theme.alternate")}</span>
              <span className="text-[10px]">{t("theme.pending")}</span>
            </div>
            <ThemeOption value="monochrome" label={t("theme.dark")} icon={<Moon size={15}/>} />
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}
function ThemeOption({value,label,icon}:{value:string;label:string;icon:React.ReactNode}) {
  return <Select.Item className="theme-option" value={value}>
    <span className="w-4 shrink-0" aria-hidden="true">{icon}</span>
    <Select.ItemText>{label}</Select.ItemText>
    <Select.ItemIndicator className="ml-auto text-[var(--primary)]"><Check size={15}/></Select.ItemIndicator>
  </Select.Item>;
}
