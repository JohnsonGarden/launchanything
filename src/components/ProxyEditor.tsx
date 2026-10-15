import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle, Radio } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import type { ProxyProfile, ProxyScheme } from "@/lib/models";
import { validateProfile } from "@/lib/validation";
import { useI18n } from "@/lib/i18n";
import { translatedValidationError } from "@/lib/validationI18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Props { open: boolean; initial?: ProxyProfile | null; onOpenChange: (next: boolean) => void; onSave: (profile: ProxyProfile) => Promise<void> }
const blank = (): ProxyProfile => ({ id: crypto.randomUUID(), name: "", scheme: "http", host: "127.0.0.1", port: 7890, bypass: ["localhost", "127.0.0.1", "::1"] });

export function ProxyEditor({ open, initial, onOpenChange, onSave }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState<ProxyProfile>(blank);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  useEffect(() => { if (open) setForm(initial ? structuredClone(initial) : blank()); }, [open, initial]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const error = validateProfile(form);
    if (error) return toast.error(translatedValidationError(error, t));
    setBusy(true);
    try { await onSave({ ...form, name: form.name.trim(), host: form.host.trim() }); onOpenChange(false); toast.success(t("proxyForm.saved")); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function test() {
    const error = validateProfile(form);
    if (error) return toast.error(translatedValidationError(error, t));
    setTesting(true);
    try {
      const result = await api.testProxy(form);
      if (result.reachable) toast.success(t("proxyForm.portOk", { latency: result.latencyMs ?? "—" }), { description: result.message });
      else toast.error(t("proxyForm.portFail"), { description: result.message });
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setTesting(false); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <div className="mb-6 flex size-11 items-center justify-center rounded-[14px] bg-[var(--primary-subtle)] text-[var(--primary)]"><Radio size={21}/></div>
    <DialogTitle className="text-[21px] font-semibold tracking-[-.035em] text-[var(--foreground)]">{initial ? t("proxyForm.edit") : t("proxyForm.create")}</DialogTitle>
    <DialogDescription className="mb-7 mt-1.5 text-[13px] leading-relaxed text-[var(--soft-foreground)]">{t("proxyForm.description")}</DialogDescription>
    <form onSubmit={submit} className="space-y-5">
      <Field label={t("proxyForm.name")}><Input autoFocus placeholder={t("proxyForm.namePlaceholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid grid-cols-[1fr_1.2fr_.8fr] gap-3">
        <Field label={t("proxyForm.protocol")}><select className="field-select" value={form.scheme} onChange={(e) => setForm({ ...form, scheme: e.target.value as ProxyScheme })}><option value="http">HTTP</option><option value="socks5">SOCKS5</option></select></Field>
        <Field label={t("proxyForm.host")}><Input spellCheck={false} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })}/></Field>
        <Field label={t("proxyForm.port")}><Input inputMode="numeric" type="number" min={1} max={65535} value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}/></Field>
      </div>
      <Field label={t("proxyForm.bypass")} hint={t("proxyForm.bypassHint")}><Input spellCheck={false} value={form.bypass.join(", ")} onChange={(e) => setForm({ ...form, bypass: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-tinted)] p-3 text-[12px] leading-relaxed text-[var(--muted-foreground)]">{t("proxyForm.testDisclaimer")}</div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5">
        <Button type="button" variant="secondary" onClick={test} disabled={testing}>{testing ? <LoaderCircle className="animate-spin" size={15}/> : <Check size={15}/>} {t("proxyForm.test")}</Button>
        <Button disabled={busy} type="submit">{busy ? <LoaderCircle className="animate-spin" size={15}/> : <ArrowRight size={15}/>} {t("proxyForm.save")}</Button>
      </div>
    </form>
  </DialogContent></Dialog>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-bold tracking-[.105em] text-[var(--muted-foreground)]">{label}</span>{children}{hint && <span className="mt-2 block text-[11px] text-[var(--soft-foreground)]">{hint}</span>}</label>;
}
