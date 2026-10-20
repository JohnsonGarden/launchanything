import { invokeNative } from "./nativeBridge";
import type { AppEntry, AppState, LaunchResult, ProxyCheck, ProxyProfile } from "./models";

export const api = {
  loadState: () => invokeNative<AppState>("load_state"),
  saveProfile: (profile: ProxyProfile) => invokeNative<AppState>("save_profile", { profile }),
  deleteProfile: (id: string) => invokeNative<AppState>("delete_profile", { id }),
  saveApp: (entry: AppEntry) => invokeNative<AppState>("save_app", { entry }),
  deleteApp: (id: string) => invokeNative<AppState>("delete_app", { id }),
  testProxy: (profile: ProxyProfile) => invokeNative<ProxyCheck>("test_proxy", { profile }),
  launchApp: (id: string) => invokeNative<LaunchResult>("launch_app", { id }),
  signedUpdatesEnabled: () => invokeNative<boolean>("signed_updates_enabled"),
  installSignedUpdate: (tag: string) => invokeNative<void>("install_signed_update", { tag }),
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
