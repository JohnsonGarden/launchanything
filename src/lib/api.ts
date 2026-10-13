import { invoke } from "@tauri-apps/api/core";
import type { AppEntry, AppState, LaunchResult, ProxyCheck, ProxyProfile } from "./models";

export const api = {
  loadState: () => invoke<AppState>("load_state"),
  saveProfile: (profile: ProxyProfile) => invoke<AppState>("save_profile", { profile }),
  deleteProfile: (id: string) => invoke<AppState>("delete_profile", { id }),
  saveApp: (entry: AppEntry) => invoke<AppState>("save_app", { entry }),
  deleteApp: (id: string) => invoke<AppState>("delete_app", { id }),
  testProxy: (profile: ProxyProfile) => invoke<ProxyCheck>("test_proxy", { profile }),
  launchApp: (id: string) => invoke<LaunchResult>("launch_app", { id }),
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
