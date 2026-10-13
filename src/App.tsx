import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity, ArrowDownRight, ArrowRight, Blocks, Check, ChevronRight, CircleHelp,
  Command, ExternalLink, Globe2, LayoutGrid, LoaderCircle, LockKeyhole,
  Pencil, Play, Plus, Radio, Search, Settings2, ShieldCheck, Sparkles, Trash2, Waypoints,
} from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import type { AppEntry, AppState, ProxyProfile } from "@/lib/models";
import { MODE_LABELS } from "@/lib/models";
import { displayEndpoint } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AppEditor } from "@/components/AppEditor";
import { ProxyEditor } from "@/components/ProxyEditor";

const DEFAULT_DATA: AppState = { schemaVersion: 1, profiles: [], apps: [] };
type View = "apps" | "proxies" | "about";

export default function App() {
  const [state, setState] = useState<AppState>(DEFAULT_DATA);
  const [view, setView] = useState<View>("apps");
  const [query, setQuery] = useState("");
  const [appEditor, setAppEditor] = useState<{ open: boolean; initial: AppEntry | null }>({ open: false, initial: null });
  const [proxyEditor, setProxyEditor] = useState<{ open: boolean; initial: ProxyProfile | null }>({ open: false, initial: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [launching, setLaunching] = useState<string | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const reload = useCallback(async () => {
    try { setState(await api.loadState()); setLoadError(null); }
    catch (error) { setLoadError(errorMessage(error)); }
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
    if (!window.confirm(`Remove “${entry.name}” from LaunchAnything? The original app will not be deleted.`)) return;
    try { await mutate(() => api.deleteApp(entry.id)); toast.success("Application removed"); } catch (error) { toast.error(errorMessage(error)); }
  }
  async function removeProfile(profile: ProxyProfile) {
    if (!window.confirm(`Delete proxy profile “${profile.name}”?`)) return;
    try { await mutate(() => api.deleteProfile(profile.id)); toast.success("Proxy removed"); } catch (error) { toast.error(errorMessage(error)); }
  }
  async function launch(entry: AppEntry) {
    setLaunching(entry.id);
    try {
      const result = await api.launchApp(entry.id);
      toast.success(`${entry.name} launched`, { description: `PID ${result.pid}. ${result.message}`, duration: 6500 });
    } catch (error) { toast.error(`Couldn't launch ${entry.name}`, { description: errorMessage(error), duration: 6500 }); }
    finally { setLaunching(null); }
  }
  async function testProfile(profile: ProxyProfile) {
    setChecking(profile.id);
    try {
      const result = await api.testProxy(profile);
      setChecks((old) => ({ ...old, [profile.id]: result.reachable }));
      if (result.reachable) toast.success(`${profile.name} · port reachable`, { description: result.message });
      else toast.error(`${profile.name} · offline`, { description: result.message });
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setChecking(null); }
  }

  const showAppEditor = (initial: AppEntry | null = null) => setAppEditor({ open: true, initial });
  const showProxyEditor = (initial: ProxyProfile | null = null) => setProxyEditor({ open: true, initial });

  return <div className="app-frame">
    <aside className="sidebar">
      <div className="brand"><div className="brand-symbol"><Waypoints size={21} strokeWidth={2.35}/></div><span className="brand-text">launch<span className="text-[#5558e9]">anything</span></span></div>
      <div className="sidebar-section-title">WORKSPACE</div>
      <nav aria-label="Primary navigation" className="space-y-1">
        <NavItem icon={LayoutGrid} label="Applications" active={view === "apps"} onClick={() => { setView("apps"); setQuery(""); }} count={state.apps.length}/>
        <NavItem icon={Waypoints} label="Proxy profiles" active={view === "proxies"} onClick={() => { setView("proxies"); setQuery(""); }} count={state.profiles.length}/>
      </nav>
      <div className="mt-9 sidebar-section-title">PREFERENCES</div>
      <nav><NavItem icon={CircleHelp} label="About & safety" active={view === "about"} onClick={() => { setView("about"); setQuery(""); }}/></nav>
      <div className="sidebar-bottom">
        <div className="sidebar-callout"><div className="flex items-center gap-2 font-semibold text-[#49526b]"><ShieldCheck size={15} className="text-[#585bdf]"/> Private by design</div><p className="mt-2 text-[11px] leading-[1.65] text-[#8992a5]">Your configurations stay on your Mac. No account, cloud sync, or telemetry.</p></div>
        <div className="sidebar-footer"><span className="flex size-7 items-center justify-center rounded-lg bg-[#e9eafa] text-[#5558de]"><Command size={13}/></span><span>LaunchAnything <span className="text-[#a8afbd]">v0.1</span></span></div>
      </div>
    </aside>

    <main className="main-panel">
      <header className="topbar"><div className="flex items-center gap-2 text-[12px] font-medium text-[#9ca4b3]">Workspace <ChevronRight size={13}/> <span className="text-[#3d4557]">{view === "apps" ? "Applications" : view === "proxies" ? "Proxy profiles" : "About & safety"}</span></div><div className="flex items-center gap-2 text-[11px] font-medium text-[#7e879b]"><span className="size-1.5 rounded-full bg-[#42bb9d]"/> Local-first utility</div></header>
      <div className="main-content">
        {loadError && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><strong>Could not load settings.</strong> {loadError} <button className="ml-2 underline" onClick={() => void reload()}>Retry</button></div>}
        {view === "apps" && <>
          <div className="page-intro"><div><div className="eyebrow"><Sparkles size={13}/> YOUR WORKSPACE</div><h1>Applications<span className="period">.</span></h1><p>One place to launch your apps, on your terms.</p></div><Button onClick={() => showAppEditor()} disabled={!!loadError}><Plus size={16}/> Add application</Button></div>
          <div className="stats-grid"><Summary icon={Blocks} label="CONFIGURED APPS" value={state.apps.length.toString()} detail="Ready for one-click launch"/><Summary icon={Globe2} label="PROXY PROFILES" value={state.profiles.length.toString()} detail="Local & custom endpoints"/><Summary icon={LockKeyhole} label="ROUTING MODE" value="Per app" detail="No global proxy changes"/></div>
          <div className="section-heading"><div><h2>Your applications <span className="section-count">{state.apps.length}</span></h2><p>Each application remembers its proxy and launch method.</p></div><SearchBox value={query} onChange={setQuery}/></div>
          {loading ? <Loading/> : filteredApps.length ? <div className="app-list">{filteredApps.map((entry) => {
            const profile = profileById.get(entry.profileId);
            return <div className="app-row" key={entry.id}>
              <div className="app-icon"><Blocks size={22} strokeWidth={1.75}/></div>
              <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold text-[#242a3b]">{entry.name}</div><div className="mt-1 truncate text-[11px] text-[#9ba3b2]" title={entry.appPath}>{entry.appPath}</div></div>
              <div className="hidden min-w-[155px] max-w-[200px] shrink-0 md:block"><div className="truncate text-[12px] font-medium text-[#5d6679]">{profile?.name ?? "Missing profile"}</div><div className="mt-1 truncate font-mono text-[10px] text-[#a1a8b6]">{profile ? displayEndpoint(profile) : "—"}</div></div>
              <Badge className="hidden min-w-[110px] justify-center xl:inline-flex">{MODE_LABELS[entry.mode]}</Badge>
              <div className="ml-2 flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" title="Edit application" aria-label={`Edit ${entry.name}`} onClick={() => showAppEditor(entry)}><Pencil size={15}/></Button><Button variant="ghost" size="icon" title="Remove application" aria-label={`Remove ${entry.name}`} onClick={() => void removeApp(entry)}><Trash2 size={15}/></Button><Button size="sm" className="ml-2" disabled={launching === entry.id} onClick={() => void launch(entry)}>{launching === entry.id ? <LoaderCircle size={13} className="animate-spin"/> : <Play size={13} fill="currentColor"/>} Launch</Button></div>
            </div>;
          })}</div> : <Empty title={state.apps.length && query ? "No matching apps" : "Your launchpad starts here"} description={state.apps.length && query ? "Try a different search term." : "Add an application, assign a proxy, and launch it in one click."} action={state.apps.length && query ? "Clear search" : "Add your first app"} onClick={() => state.apps.length && query ? setQuery("") : showAppEditor()}/>} 
          <div className="help-strip"><div className="help-strip-icon"><Activity size={18}/></div><div><strong>Know what’s being routed.</strong><p>Proxy configuration is best-effort. Some apps bypass environment variables and Chromium flags.</p></div><button onClick={() => setView("about")} className="ml-auto flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#5558da] hover:underline">Learn more <ArrowRight size={13}/></button></div>
        </>}
        {view === "proxies" && <>
          <div className="page-intro"><div><div className="eyebrow"><Radio size={13}/> CONNECTIONS</div><h1>Proxy profiles<span className="period">.</span></h1><p>Manage your local proxy ports in one place.</p></div><Button onClick={() => showProxyEditor()} disabled={!!loadError}><Plus size={16}/> New proxy</Button></div>
          <div className="section-heading mt-8"><div><h2>Saved endpoints <span className="section-count">{state.profiles.length}</span></h2><p>Test port connectivity before launching your apps.</p></div><SearchBox value={query} onChange={setQuery}/></div>
          {loading ? <Loading/> : filteredProfiles.length ? <div className="proxy-grid">{filteredProfiles.map((profile) => <div className="proxy-card" key={profile.id}>
            <div className="flex items-start justify-between"><div className="proxy-avatar"><Waypoints size={20}/></div><Badge className="uppercase">{profile.scheme}</Badge></div>
            <h3 className="mt-5 truncate text-[15px] font-semibold text-[#252b3b]">{profile.name}</h3>
            <div className="mt-1 font-mono text-[12px] text-[#939cad]">{displayEndpoint(profile)}</div>
            <div className="mt-5 flex items-center gap-2 border-t border-[#eef0f4] pt-4"><span className={`size-2 rounded-full ${checks[profile.id] === undefined ? "bg-[#cdd3df]" : checks[profile.id] ? "bg-[#38b997]" : "bg-[#e56a76]"}`}/><span className="text-[11px] text-[#7e8798]">{checks[profile.id] === undefined ? "Not tested this session" : checks[profile.id] ? "TCP port reachable" : "TCP port unreachable"}</span><div className="ml-auto flex gap-0.5"><Button variant="ghost" size="icon" aria-label={`Test ${profile.name}`} title="Test port" onClick={() => void testProfile(profile)} disabled={checking === profile.id}>{checking === profile.id ? <LoaderCircle size={15} className="animate-spin"/> : <Activity size={15}/>}</Button><Button variant="ghost" size="icon" aria-label={`Edit ${profile.name}`} onClick={() => showProxyEditor(profile)}><Pencil size={15}/></Button><Button variant="ghost" size="icon" aria-label={`Delete ${profile.name}`} onClick={() => void removeProfile(profile)}><Trash2 size={15}/></Button></div></div>
          </div>)}</div> : <Empty title="No profiles found" description="Create a local HTTP or SOCKS5 endpoint." action="New proxy" onClick={() => showProxyEditor()}/>}
          <div className="help-strip"><div className="help-strip-icon"><ArrowDownRight size={18}/></div><div><strong>Connect to what you already use.</strong><p>Shadowrocket or Clash handles upstream connections; LaunchAnything only controls how apps start.</p></div></div>
        </>}
        {view === "about" && <>
          <div className="page-intro"><div><div className="eyebrow"><ShieldCheck size={13}/> TRANSPARENCY</div><h1>Simple by design<span className="period">.</span></h1><p>Honest boundaries, thoughtful defaults, zero surprises.</p></div></div>
          <div className="about-grid"><Info icon={Check} title="No background proxy service" description="LaunchAnything never replaces or reconfigures your existing proxy client. It starts applications with selected settings."/><Info icon={LockKeyhole} title="Local configuration" description="Profiles and application paths are saved in your macOS app configuration folder. No analytics or remote sync."/><Info icon={Settings2} title="Best-effort routing" description="Environment variables and Chromium flags are not enforced by macOS. Some apps use independent network stacks and may connect directly."/><Info icon={Activity} title="Fail-closed launch guard" description="We verify the TCP port and reject launching when unreachable. This is not proof that app traffic uses that endpoint."/></div>
          <div className="mt-7 rounded-2xl border border-[#e9ebf0] bg-white p-6"><h3 className="text-[14px] font-semibold">Compatibility guidance</h3><p className="mt-2 max-w-[700px] text-[12px] leading-[1.8] text-[#7b8496]">Choose Environment for software respecting HTTP_PROXY / HTTPS_PROXY / ALL_PROXY, Chromium flags for Chromium or Electron software, and Combined only when needed. Fully enforceable per-app network interception would require a separate macOS Network Extension / transparent-proxy architecture and is not part of this version.</p><a className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#5257d9] hover:underline" href="https://github.com/JohnsonGarden/launchanything" target="_blank" rel="noreferrer">View on GitHub <ExternalLink size={12}/></a></div>
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
  return <div className="summary-card"><div className="summary-icon"><Icon size={18}/></div><span className="mt-5 text-[10px] font-bold tracking-[.08em] text-[#96a0af]">{label}</span><div className="mt-2 text-[29px] font-semibold leading-none tracking-[-.055em] text-[#242a3a]">{value}</div><div className="mt-2 text-[11px] text-[#9199a9]">{detail}</div></div>;
}
function SearchBox({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return <div className="relative w-[224px] shrink-0"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca5b5]"/><Input id="app-search" aria-label="Search" placeholder="Search..." className="h-9 bg-white pl-9 pr-12" value={value} onChange={(e) => onChange(e.target.value)}/><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[#e6e9ee] px-1.5 py-[1px] text-[10px] text-[#acb3bf]">⌘ K</span></div>;
}
function Empty({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) {
  return <div className="empty-state"><div className="empty-orbit"><div className="empty-mark"><Waypoints size={25}/></div></div><h3 className="mt-6 text-[17px] font-semibold tracking-[-.025em] text-[#292e40]">{title}</h3><p className="mt-2 max-w-[310px] text-center text-[12px] leading-relaxed text-[#959eae]">{description}</p><Button variant="secondary" className="mt-6" onClick={onClick}><Plus size={15}/>{action}</Button></div>;
}
function Loading() { return <div className="flex h-40 items-center justify-center text-[#a0a8b6]"><LoaderCircle size={23} className="animate-spin"/></div>; }
function Info({ icon: Icon, title, description }: { icon: typeof LayoutGrid; title: string; description: string }) {
  return <div className="about-card"><span className="inline-flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-[#585bdf]"><Icon size={17}/></span><h3 className="mt-4 text-[14px] font-semibold">{title}</h3><p className="mt-2 text-[12px] leading-[1.85] text-[#858e9f]">{description}</p></div>;
}
