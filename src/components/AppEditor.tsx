import { useEffect, useState, type FormEvent } from "react";
import { open as selectFile } from "@tauri-apps/plugin-dialog";
import { ArrowRight, AppWindow, FolderOpen, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api";
import type { AppEntry, LaunchMode, ProxyProfile } from "@/lib/models";
import { MODE_DESCRIPTIONS, MODE_LABELS } from "@/lib/models";
import { appDisplayName, validateApp } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "./ProxyEditor";

interface Props { open: boolean; initial?: AppEntry | null; profiles: ProxyProfile[]; onOpenChange: (next: boolean) => void; onSave: (entry: AppEntry) => Promise<void> }
const blank = (profiles: ProxyProfile[]): AppEntry => ({ id: crypto.randomUUID(), name: "", appPath: "", profileId: profiles[0]?.id ?? "", mode: "environment" });

export function AppEditor({ open, initial, profiles, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<AppEntry>(() => blank(profiles));
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setForm(initial ? structuredClone(initial) : blank(profiles)); }, [open, initial, profiles]);
  async function browse() {
    try {
      const selected = await selectFile({ title: "Choose a macOS application", directory: false, multiple: false });
      if (typeof selected === "string") setForm((prev) => ({ ...prev, appPath: selected, name: prev.name || appDisplayName(selected) }));
    } catch (error) { toast.error(errorMessage(error)); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const error = validateApp(form);
    if (error) return toast.error(error);
    setBusy(true);
    try { await onSave({ ...form, name: form.name.trim() }); onOpenChange(false); toast.success("Application saved"); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <div className="mb-6 flex size-11 items-center justify-center rounded-[14px] bg-indigo-50 text-[#494ce5]"><AppWindow size={21}/></div>
    <DialogTitle className="text-[21px] font-semibold tracking-[-.035em] text-[#1f2535]">{initial ? "Edit application" : "Add application"}</DialogTitle>
    <DialogDescription className="mb-7 mt-1.5 text-[13px] leading-relaxed text-[#8891a2]">Give this app its own proxy profile and launch method.</DialogDescription>
    <form onSubmit={submit} className="space-y-5">
      <Field label="APPLICATION BUNDLE">
        <div className="flex gap-2"><Input className="min-w-0 flex-1" placeholder="/Applications/Example.app" value={form.appPath} onChange={(e) => setForm({ ...form, appPath: e.target.value })}/><Button type="button" variant="secondary" onClick={browse} aria-label="Browse applications"><FolderOpen size={16}/></Button></div>
      </Field>
      <Field label="DISPLAY NAME"><Input autoComplete="off" placeholder="e.g. Google Chrome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field>
      <Field label="PROXY PROFILE"><select className="field-select" value={form.profileId} onChange={(e) => setForm({ ...form, profileId: e.target.value })}>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.scheme.toUpperCase()}</option>)}</select></Field>
      <Field label="LAUNCH METHOD"><div className="grid grid-cols-3 gap-2">{(["environment", "chromium", "combined"] as LaunchMode[]).map((mode) => <button key={mode} type="button" onClick={() => setForm({ ...form, mode })} className={`rounded-[10px] border px-2.5 py-3 text-center text-[11px] font-semibold transition-colors ${form.mode === mode ? "border-[#9ca0f0] bg-[#f2f2ff] text-[#4346d6]" : "border-[#e7e9ee] text-[#7b8291] hover:bg-[#fafaff]"}`}>{MODE_LABELS[mode]}</button>)}</div><p className="mt-2 text-[11px] leading-relaxed text-[#939bad]">{MODE_DESCRIPTIONS[form.mode]}</p></Field>
      <div className="rounded-xl border border-[#e9ecf3] bg-[#f8f9fc] p-3 text-[12px] leading-relaxed text-[#7d8699]">Quit the target app before launching it here. An already-running instance could silently reuse its previous network settings, so LaunchAnything blocks that case.</div>
      <div className="flex justify-end border-t border-[#edf0f5] pt-5"><Button disabled={busy || profiles.length === 0} type="submit">{busy ? <LoaderCircle size={15} className="animate-spin"/> : <ArrowRight size={15}/>} Save application</Button></div>
    </form>
  </DialogContent></Dialog>;
}
