export type ProxyScheme = "http" | "socks5";
export type LaunchMode = "environment" | "chromium" | "combined";

export interface ProxyProfile {
  id: string;
  name: string;
  scheme: ProxyScheme;
  host: string;
  port: number;
  bypass: string[];
}

export interface AppEntry {
  id: string;
  name: string;
  appPath: string;
  profileId: string;
  mode: LaunchMode;
}

export interface AppState {
  schemaVersion: number;
  profiles: ProxyProfile[];
  apps: AppEntry[];
}

export interface ProxyCheck {
  reachable: boolean;
  latencyMs: number | null;
  message: string;
}

export interface LaunchResult { pid: number; message: string }

export const MODE_LABELS: Record<LaunchMode, string> = {
  environment: "Environment",
  chromium: "Chromium flags",
  combined: "Combined",
};

export const MODE_DESCRIPTIONS: Record<LaunchMode, string> = {
  environment: "For apps that honor HTTP(S)_PROXY or ALL_PROXY.",
  chromium: "For Chromium / Electron apps that accept --proxy-server.",
  combined: "Pass both. Useful for mixed network stacks, not a routing guarantee.",
};
