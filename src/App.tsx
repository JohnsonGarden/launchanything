import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity, ArrowDownRight, ArrowRight, Blocks, Check, ChevronRight, CircleHelp,
  Command, ExternalLink, Globe2, LayoutGrid, LoaderCircle, LockKeyhole,
  Pencil, Play, Plus, Radio, Search, Settings2, ShieldCheck, Sparkles, Trash2, Waypoints,
} from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { isNativeBridgeUnavailableError } from "@/lib/nativeBridge";
import type { AppEntry, AppState, ProxyProfile } from "@/lib/models";
import { displayEndpoint } from "@/lib/validation";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AppEditor } from "@/components/AppEditor";
import { ProxyEditor } from "@/components/ProxyEditor";

const DEFAULT_DATA: AppState = { schemaVersion: 1, profiles: [], apps: [] };
type View = "apps" | "proxies" | "about";

export default function App() {
  const { locale, setLocale, t } = useI18n();
  const [state, setState] = useState<AppState>(DEFAULT_DATA);
  const [view, setView] = useState<View>("apps");
  const [query, setQuery] = useState("");
  const [appEditor, setAppEditor] = useState<{ open: boolean; initial: AppEntry | null }>({ open: false, initial: null });
  const [proxyEditor, setProxyEditor] = useState<{ open: boolean; initial: ProxyProfile | null }>({ open: false, initial: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ kind: "runtime" | "backend"; detail: string } | null>(null);
  const [launching, setLaunching] = useState<string | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const reload = useCallback(async () => {
    try { setState(await api.loadState()); setLoadError(null); }
    catch (error) { setLoadError({ kind: isNativeBridgeUnavailableError(error) ? "runtime" : "backend", detail: errorMessage(error) }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    function onKeys(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setView("apps"); document.getElementById("app-search")?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault(); setAppEditor({ open: true, initial: null });
      }
    }
    window.addEventListener("keydown", onKeys);
    return () => window.removeEventListener("keydown", onKeys);
  }, []);

  const profileById = useMemo(() => new Map(state.profiles.map((p) => [p.id, p])), [state.profiles]);
  const filteredApps = state.apps.filter((app) => `${app.name} ${app.appPath} ${profileById.get(app.profileId)?.name ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const filteredProfiles = state.profiles.filter((profile) => `${profile.name} ${profile.host} ${profile.port}`.toLowerCase().includes(query.toLowerCase()));

  async function mutate(work: () => Promise<AppState>) { setState(await work()); }
  async function removeApp(entry: AppEntry) {
    if (!window.confirm(t("apps.removeConfirm", { name: entry.name }))) return;
    try { await mutate(() => api.deleteApp(entry.id)); toast.success(t("apps.removed")); } catch (error) { toast.error(errorMessage(error)); }
  }
  async function removeProfile(profile: ProxyProfile) {
    if (!window.confirm(t("proxy.removeConfirm", { name: profile.name }))) return;
    try { await mutate(() => api.deleteProfile(profile.id)); toast.success(t("proxy.removed")); } catch (error) { toast.error(errorMessage(error)); }
  }
  async function launch(entry: AppEntry) {
    setLaunching(entry.id);
    try {
      const result = await api.launchApp(entry.id);
      toast.success(t("apps.launched", { name: entry.name }), { description: t("apps.launchedDetail", { pid: result.pid, message: result.message }), duration: 6500 });
    } catch (error) { toast.error(t("apps.launchFailed", { name: entry.name }), { description: errorMessage(error), duration: 6500 }); }
    finally { setLaunching(null); }
  }
  async function testProfile(profile: ProxyProfile) {
    setChecking(profile.id);
    try {
      const result = await api.testProxy(profile);
      setChecks((old) => ({ ...old, [profile.id]: result.reachable }));
      if (result.reachable) toast.success(t("proxy.portReachable", { name: profile.name }), { description: result.message });
      else toast.error(t("proxy.offline", { name: profile.name }), { description: result.message });
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setChecking(null); }
  }

  const showAppEditor = (initial: AppEntry | null = null) => setAppEditor({ open: true, initial });
  const showProxyEditor = (initial: ProxyProfile | null = null) => setProxyEditor({ open: true, initial });

  return <div className="app-frame">
    <aside className="sidebar">
      <div className="brand"><div className="brand-symbol"><Waypoints size={21} strokeWidth={2.35}/></div><span className="brand-text">launch<span className="text-[var(--primary)]">anything</span></span></div>
      <div className="sidebar-section-title">{t("nav.workspace")}</div>
      <nav aria-label={t("nav.workspace")} className="space-y-1">
        <NavItem icon={LayoutGrid} label={t("nav.apps")} active={view === "apps"} onClick={() => { setView("apps"); setQuery(""); }} count={state.apps.length}/>
        <NavItem icon={Waypoints} label={t("nav.proxies")} active={view === "proxies"} onClick={() => { setView("proxies"); setQuery(""); }} count={state.profiles.length}/>
      </nav>
      <div className="mt-9 sidebar-section-title">{t("nav.preferences")}</div>
      <nav><NavItem icon={CircleHelp} label={t("nav.about")} active={view === "about"} onClick={() => { setView("about"); setQuery(""); }}/></nav>
      <div className="sidebar-bottom">
        <div className="sidebar-callout"><div className="flex items-center gap-2 font-semibold text-[var(--foreground)]"><ShieldCheck size={15} className="text-[var(--primary)]"/> {t("privacy.title")}</div><p className="mt-2 text-[11px] leading-[1.65] text-[var(--soft-foreground)]">{t("privacy.detail")}</p></div>
        <div className="sidebar-footer"><span className="flex size-7 items-center justify-center rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)]"><Command size={13}/></span><span>LaunchAnything <span className="text-[var(--faint-foreground)]">v0.1</span></span></div>
      </div>
    </aside>

    <main className="main-panel">
      <header className="topbar"><div className="flex items-center gap-2 text-[12px] font-medium text-[var(--soft-foreground)]">{t("nav.breadcrumb")} <ChevronRight size={13}/> <span className="text-[var(--foreground)]">{view === "apps" ? t("nav.apps") : view === "proxies" ? t("nav.proxies") : t("nav.about")}</span></div><div className="topbar-actions">
        <ThemeSwitch/>
        <LanguageSwitch locale={locale} onChange={setLocale} label={t("nav.language")} chineseLabel={t("nav.chinese")} englishLabel={t("nav.english")}/>
        <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--muted-foreground)]"><span className="size-1.5 rounded-full bg-[var(--success)]"/> {t("nav.local")}</div>
      </div></header>
      <div className="main-content">
        {loadError && <div role="alert" className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-[var(--destructive)] bg-[var(--destructive-subtle)] p-4 text-sm text-[var(--destructive)]">
          <div className="min-w-0">
            <strong>{t(loadError.kind === "runtime" ? "status.runtimeTitle" : "status.loadError")}</strong>
            {loadError.kind === "runtime"
              ? <p className="mt-2 max-w-[680px] leading-relaxed">{t("status.runtimeHint")}</p>
              : <span className="ml-2 break-words">{loadError.detail}</span>}
          </div>
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => void reload()}>{t("common.retry")}</Button>
        </div>}
        {!loadError && view === "apps" && <>
          <div className="page-intro"><div><div className="eyebrow"><Sparkles size={13}/> {t("apps.eyebrow")}</div><h1>{t("nav.apps")}<span className="period">.</span></h1><p>{t("apps.tagline")}</p></div><Button onClick={() => showAppEditor()} disabled={!!loadError}><Plus size={16}/> {t("apps.add")}</Button></div>
          <div className="stats-grid"><Summary icon={Blocks} label={t("apps.configured")} value={state.apps.length.toString()} detail={t("apps.configuredDetail")}/><Summary icon={Globe2} label={t("apps.profilesStat")} value={state.profiles.length.toString()} detail={t("apps.profilesStatDetail")}/><Summary icon={LockKeyhole} label={t("apps.routingStat")} value={t("apps.routingStatValue")} detail={t("apps.routingStatDetail")}/></div>
          <div className="section-heading"><div><h2>{t("apps.yours")} <span className="section-count">{state.apps.length}</span></h2><p>{t("apps.remember")}</p></div><SearchBox value={query} onChange={setQuery}/></div>
          {loading ? <Loading/> : filteredApps.length ? <div className="app-list">{filteredApps.map((entry) => {
            const profile = profileById.get(entry.profileId);
            return <div className="app-row" key={entry.id}>
              <div className="app-icon"><Blocks size={22} strokeWidth={1.75}/></div>
              <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold text-[var(--foreground)]">{entry.name}</div><div className="mt-1 truncate text-[11px] text-[var(--soft-foreground)]" title={entry.appPath}>{entry.appPath}</div></div>
              <div className="hidden min-w-[155px] max-w-[200px] shrink-0 md:block"><div className="truncate text-[12px] font-medium text-[var(--muted-foreground)]">{profile?.name ?? t("apps.missingProfile")}</div><div className="mt-1 truncate font-mono text-[10px] text-[var(--faint-foreground)]">{profile ? displayEndpoint(profile) : "—"}</div></div>
              <Badge className="hidden min-w-[110px] justify-center xl:inline-flex">{t(`mode.${entry.mode}`)}</Badge>
              <div className="ml-2 flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" title={t("apps.edit")} aria-label={t("apps.editNamed", { name: entry.name })} onClick={() => showAppEditor(entry)}><Pencil size={15}/></Button><Button variant="ghost" size="icon" title={t("apps.remove")} aria-label={t("apps.removeNamed", { name: entry.name })} onClick={() => void removeApp(entry)}><Trash2 size={15}/></Button><Button size="sm" className="ml-2" disabled={launching === entry.id} onClick={() => void launch(entry)}>{launching === entry.id ? <LoaderCircle size={13} className="animate-spin"/> : <Play size={13} fill="currentColor"/>} {t("apps.launch")}</Button></div>
            </div>;
          })}</div> : <Empty title={state.apps.length && query ? t("apps.emptySearch") : t("apps.emptyTitle")} description={state.apps.length && query ? t("apps.emptySearchDetail") : t("apps.emptyDetail")} action={state.apps.length && query ? t("apps.clearSearch") : t("apps.addFirst")} onClick={() => state.apps.length && query ? setQuery("") : showAppEditor()}/>} 
          <div className="help-strip"><div className="help-strip-icon"><Activity size={18}/></div><div><strong>{t("apps.routingTitle")}</strong><p>{t("apps.routingDetail")}</p></div><button onClick={() => setView("about")} className="ml-auto flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--primary)] hover:underline">{t("common.learnMore")} <ArrowRight size={13}/></button></div>
        </>}
        {!loadError && view === "proxies" && <>
          <div className="page-intro"><div><div className="eyebrow"><Radio size={13}/> {t("proxy.eyebrow")}</div><h1>{t("nav.proxies")}<span className="period">.</span></h1><p>{t("proxy.tagline")}</p></div><Button onClick={() => showProxyEditor()} disabled={!!loadError}><Plus size={16}/> {t("proxy.new")}</Button></div>
          <div className="section-heading mt-8"><div><h2>{t("proxy.saved")} <span className="section-count">{state.profiles.length}</span></h2><p>{t("proxy.savedDetail")}</p></div><SearchBox value={query} onChange={setQuery}/></div>
          {loading ? <Loading/> : filteredProfiles.length ? <div className="proxy-grid">{filteredProfiles.map((profile) => <div className="proxy-card" key={profile.id}>
            <div className="flex items-start justify-between"><div className="proxy-avatar"><Waypoints size={20}/></div><Badge className="uppercase">{profile.scheme}</Badge></div>
            <h3 className="mt-5 truncate text-[15px] font-semibold text-[var(--foreground)]">{profile.name}</h3>
            <div className="mt-1 font-mono text-[12px] text-[var(--soft-foreground)]">{displayEndpoint(profile)}</div>
            <div className="mt-5 flex items-center gap-2 border-t border-[var(--border-subtle)] pt-4"><span className={`size-2 rounded-full ${checks[profile.id] === undefined ? "bg-[var(--border-strong)]" : checks[profile.id] ? "bg-[var(--success)]" : "bg-[var(--destructive)]"}`}/><span className="text-[11px] text-[var(--muted-foreground)]">{checks[profile.id] === undefined ? t("proxy.notTested") : checks[profile.id] ? t("proxy.reachable") : t("proxy.unreachable")}</span><div className="ml-auto flex gap-0.5"><Button variant="ghost" size="icon" aria-label={t("proxy.testNamed", { name: profile.name })} title={t("proxy.testPort")} onClick={() => void testProfile(profile)} disabled={checking === profile.id}>{checking === profile.id ? <LoaderCircle size={15} className="animate-spin"/> : <Activity size={15}/>}</Button><Button variant="ghost" size="icon" aria-label={t("proxy.editNamed", { name: profile.name })} onClick={() => showProxyEditor(profile)}><Pencil size={15}/></Button><Button variant="ghost" size="icon" aria-label={t("proxy.deleteNamed", { name: profile.name })} onClick={() => void removeProfile(profile)}><Trash2 size={15}/></Button></div></div>
          </div>)}</div> : <Empty title={t("proxy.empty")} description={t("proxy.emptyDetail")} action={t("proxy.new")} onClick={() => showProxyEditor()}/>}
          <div className="help-strip"><div className="help-strip-icon"><ArrowDownRight size={18}/></div><div><strong>{t("proxy.existingTitle")}</strong><p>{t("proxy.existingDetail")}</p></div></div>
        </>}
        {view === "about" && <>
          <div className="page-intro"><div><div className="eyebrow"><ShieldCheck size={13}/> {t("about.eyebrow")}</div><h1>{t("about.title")}<span className="period">.</span></h1><p>{t("about.tagline")}</p></div></div>
          <div className="about-grid"><Info icon={Check} title={t("about.serviceTitle")} description={t("about.serviceDetail")}/><Info icon={LockKeyhole} title={t("about.localTitle")} description={t("about.localDetail")}/><Info icon={Settings2} title={t("about.bestTitle")} description={t("about.bestDetail")}/><Info icon={Activity} title={t("about.guardTitle")} description={t("about.guardDetail")}/></div>
          <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"><h3 className="text-[14px] font-semibold">{t("about.compatTitle")}</h3><p className="mt-2 max-w-[700px] text-[12px] leading-[1.8] text-[var(--muted-foreground)]">{t("about.compatDetail")}</p><a className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--primary)] hover:underline" href="https://github.com/JohnsonGarden/launchanything" target="_blank" rel="noreferrer">{t("about.github")} <ExternalLink size={12}/></a></div>
        </>}
      </div>
    </main>
    <AppEditor open={appEditor.open} initial={appEditor.initial} profiles={state.profiles} onOpenChange={(open) => setAppEditor((prev) => ({ ...prev, open }))} onSave={(entry) => mutate(() => api.saveApp(entry))}/>
    <ProxyEditor open={proxyEditor.open} initial={proxyEditor.initial} onOpenChange={(open) => setProxyEditor((prev) => ({ ...prev, open }))} onSave={(profile) => mutate(() => api.saveProfile(profile))}/>
  </div>;
}

function NavItem({ icon: Icon, label, active, onClick, count }: { icon: typeof LayoutGrid; label: string; active: boolean; onClick: () => void; count?: number }) {
  return <button className={`nav-item ${active ? "nav-item-active" : ""}`} onClick={onClick}><Icon size={16} strokeWidth={active ? 2.3 : 2}/><span className="flex-1 text-left">{label}</span>{count !== undefined && <span className="text-[11px] opacity-65">{count}</span>}</button>;
}
function Summary({ icon: Icon, label, value, detail }: { icon: typeof LayoutGrid; label: string; value: string; detail: string }) {
  return <div className="summary-card"><div className="summary-icon"><Icon size={18}/></div><span className="mt-5 text-[10px] font-bold tracking-[.08em] text-[var(--soft-foreground)]">{label}</span><div className="mt-2 text-[29px] font-semibold leading-none tracking-[-.055em] text-[var(--foreground)]">{value}</div><div className="mt-2 text-[11px] text-[var(--soft-foreground)]">{detail}</div></div>;
}
function SearchBox({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const { t } = useI18n();
  return <div className="relative w-[224px] shrink-0"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--soft-foreground)]"/><Input id="app-search" aria-label={t("common.search")} placeholder={t("common.search")} className="h-9 bg-[var(--card)] pl-9 pr-12" value={value} onChange={(e) => onChange(e.target.value)}/><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--border-subtle)] px-1.5 py-[1px] text-[10px] text-[var(--faint-foreground)]">⌘ K</span></div>;
}
function Empty({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) {
  return <div className="empty-state"><div className="empty-orbit"><div className="empty-mark"><Waypoints size={25}/></div></div><h3 className="mt-6 text-[17px] font-semibold tracking-[-.025em] text-[var(--foreground)]">{title}</h3><p className="mt-2 max-w-[310px] text-center text-[12px] leading-relaxed text-[var(--soft-foreground)]">{description}</p><Button variant="secondary" className="mt-6" onClick={onClick}><Plus size={15}/>{action}</Button></div>;
}
function Loading() { return <div className="flex h-40 items-center justify-center text-[var(--faint-foreground)]"><LoaderCircle size={23} className="animate-spin"/></div>; }
function Info({ icon: Icon, title, description }: { icon: typeof LayoutGrid; title: string; description: string }) {
  return <div className="about-card"><span className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]"><Icon size={17}/></span><h3 className="mt-4 text-[14px] font-semibold">{title}</h3><p className="mt-2 text-[12px] leading-[1.85] text-[var(--muted-foreground)]">{description}</p></div>;
}
