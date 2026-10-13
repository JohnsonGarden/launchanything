import { useEffect, useState, type FormEvent } from "react";
import { open as selectFile } from "@tauri-apps/plugin-dialog";
import { ArrowRight, AppWindow, FolderOpen, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api";
import type { AppEntry, LaunchMode, ProxyProfile } from "@/lib/models";
import { appDisplayName, validateApp } from "@/lib/validation";
import { useI18n } from "@/lib/i18n";
import { translatedValidationError } from "@/lib/validationI18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "./ProxyEditor";

interface Props { open: boolean; initial?: AppEntry | null; profiles: ProxyProfile[]; onOpenChange: (next: boolean) => void; onSave: (entry: AppEntry) => Promise<void> }
const blank = (profiles: ProxyProfile[]): AppEntry => ({ id: crypto.randomUUID(), name: "", appPath: "", profileId: profiles[0]?.id ?? "", mode: "environment" });

export function AppEditor({ open, initial, profiles, onOpenChange, onSave }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState<AppEntry>(() => blank(profiles));
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setForm(initial ? structuredClone(initial) : blank(profiles)); }, [open, initial, profiles]);
  async function browse() {
    try {
      const selected = await selectFile({ title: t("appForm.browse"), directory: false, multiple: false });
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
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <div className="mb-6 flex size-11 items-center justify-center rounded-[14px] bg-[var(--primary-subtle)] text-[var(--primary)]"><AppWindow size={21}/></div>
    <DialogTitle className="text-[21px] font-semibold tracking-[-.035em] text-[var(--foreground)]">{initial ? t("appForm.edit") : t("appForm.create")}</DialogTitle>
    <DialogDescription className="mb-7 mt-1.5 text-[13px] leading-relaxed text-[var(--soft-foreground)]">{t("appForm.description")}</DialogDescription>
    <form onSubmit={submit} className="space-y-5">
      <Field label={t("appForm.bundle")}>
        <div className="flex gap-2"><Input className="min-w-0 flex-1" placeholder="/Applications/Example.app" value={form.appPath} onChange={(e) => setForm({ ...form, appPath: e.target.value })}/><Button type="button" variant="secondary" onClick={browse} aria-label={t("appForm.browse")}><FolderOpen size={16}/></Button></div>
      </Field>
      <Field label={t("appForm.displayName")}><Input autoComplete="off" placeholder={t("appForm.namePlaceholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field>
      <Field label={t("appForm.profile")}><select className="field-select" value={form.profileId} onChange={(e) => setForm({ ...form, profileId: e.target.value })}>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.scheme.toUpperCase()}</option>)}</select></Field>
      <Field label={t("appForm.method")}><div className="grid grid-cols-3 gap-2">{(["environment", "chromium", "combined"] as LaunchMode[]).map((mode) => <button key={mode} type="button" onClick={() => setForm({ ...form, mode })} className={`rounded-[10px] border px-2.5 py-3 text-center text-[11px] font-semibold transition-colors ${form.mode === mode ? "border-[var(--ring)] bg-[var(--primary-subtle)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--primary-subtle)]"}`}>{t(`mode.${mode}`)}</button>)}</div><p className="mt-2 text-[11px] leading-relaxed text-[var(--soft-foreground)]">{t(`mode.${form.mode}Detail`)}</p></Field>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-tinted)] p-3 text-[12px] leading-relaxed text-[var(--muted-foreground)]">{t("appForm.quitting")}</div>
      <div className="flex justify-end border-t border-[var(--border-subtle)] pt-5"><Button disabled={busy || profiles.length === 0} type="submit">{busy ? <LoaderCircle size={15} className="animate-spin"/> : <ArrowRight size={15}/>} {t("appForm.save")}</Button></div>
    </form>
  </DialogContent></Dialog>;
}
