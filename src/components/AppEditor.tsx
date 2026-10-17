import { useEffect, useState, type FormEvent } from "react";
import { open as selectFile } from "@tauri-apps/plugin-dialog";
import { ArrowRight, AppWindow, FolderOpen, LoaderCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api";
import type { AppEntry, LaunchMode, ProxyProfile } from "@/lib/models";
import { appDisplayName, validateApp } from "@/lib/validation";
import { applicationPickerOptions } from "@/lib/applicationPicker";
import { useI18n } from "@/lib/i18n";
import { translatedValidationError } from "@/lib/validationI18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "./ProxyEditor";
import { LaunchModeRadioGroup } from "./LaunchModeRadioGroup";

interface Props { open: boolean; initial?: AppEntry | null; profiles: ProxyProfile[]; onOpenChange: (next: boolean) => void; onSave: (entry: AppEntry) => Promise<void> }
const blank = (profiles: ProxyProfile[]): AppEntry => ({ id: crypto.randomUUID(), name: "", appPath: "", profileId: profiles[0]?.id ?? "", mode: "environment" });

export function ProxyCompatibilityNotice({ scheme, mode }: { scheme?: ProxyProfile["scheme"]; mode: LaunchMode }) {
  const { t } = useI18n();
  if (scheme !== "socks5" || mode === "chromium") return null;
  return <p role="note" className="rounded-xl border border-[var(--border)] bg-[var(--surface-tinted)] p-3 text-[12px] leading-relaxed text-[var(--muted-foreground)]">{t("appForm.socksCompatibility")}</p>;
}

export function AppEditor({ open, initial, profiles, onOpenChange, onSave }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState<AppEntry>(() => blank(profiles));
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setForm(initial ? structuredClone(initial) : blank(profiles)); }, [open, initial, profiles]);
  async function browse() {
    try {
      const selected = await selectFile(applicationPickerOptions(t("appForm.browse")));
      if (typeof selected === "string") setForm((prev) => ({ ...prev, appPath: selected, name: prev.name || appDisplayName(selected) }));
    } catch (error) { toast.error(errorMessage(error)); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const error = validateApp(form);
    if (error) return toast.error(translatedValidationError(error, t));
    setBusy(true);
    try { await onSave({ ...form, name: form.name.trim() }); onOpenChange(false); toast.success(t("appForm.saved")); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="app-editor-dialog !p-0" aria-describedby="app-editor-description">
      <div className="app-editor-header">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]"><AppWindow size={18}/></div>
        <div className="min-w-0">
          <DialogTitle className="text-[19px] font-semibold tracking-[-.035em] text-[var(--foreground)]">{initial ? t("appForm.edit") : t("appForm.create")}</DialogTitle>
          <DialogDescription id="app-editor-description" className="mt-1 text-[12px] leading-relaxed text-[var(--soft-foreground)]">{t("appForm.description")}</DialogDescription>
        </div>
      </div>
      <form onSubmit={submit} className="app-editor-form">
        <div className="app-editor-scroll">
          <div className="space-y-4">
            <Field label={t("appForm.bundle")}>
              <div className="flex gap-2"><Input className="min-w-0 flex-1" placeholder="/Applications/Example.app" value={form.appPath} onChange={(e) => setForm({ ...form, appPath: e.target.value })}/><Button type="button" variant="secondary" onClick={browse} aria-label={t("appForm.browse")}><FolderOpen size={16}/></Button></div>
            </Field>
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
              <Field label={t("appForm.displayName")}><Input autoComplete="off" placeholder={t("appForm.namePlaceholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field>
              <Field label={t("appForm.profile")}><select className="field-select" value={form.profileId} onChange={(e) => setForm({ ...form, profileId: e.target.value })}>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.scheme.toUpperCase()}</option>)}</select></Field>
            </div>
            <div className="space-y-2">
              <LaunchModeRadioGroup value={form.mode} onChange={(mode) => setForm((prev) => ({ ...prev, mode }))} label={t("appForm.method")} labels={{environment:t("mode.environment"),chromium:t("mode.chromium"),combined:t("mode.combined")}}/>
              <p className="min-h-[16px] text-[11px] leading-relaxed text-[var(--soft-foreground)]">{t(`mode.${form.mode}Detail`)}</p>
            </div>
            <ProxyCompatibilityNotice scheme={profiles.find(profile => profile.id === form.profileId)?.scheme} mode={form.mode}/>
            <div className="flex items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-tinted)] p-3 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
              <Info className="mt-0.5 shrink-0 text-[var(--soft-foreground)]" size={14} aria-hidden="true"/>
              <p>{t("appForm.quitting")}</p>
            </div>
          </div>
        </div>
        <div className="app-editor-footer">
          <Button variant="secondary" type="button" disabled={busy} onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button disabled={busy || profiles.length === 0} type="submit">{busy ? <LoaderCircle size={15} className="animate-spin"/> : <ArrowRight size={15}/>} {t("appForm.save")}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
