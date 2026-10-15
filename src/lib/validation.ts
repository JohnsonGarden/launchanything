import type { AppEntry, ProxyProfile } from "./models";

export function validateProfile(profile: ProxyProfile): string | null {
  if (!profile.name.trim() || profile.name.trim().length > 70) return "Enter a profile name (up to 70 characters).";
  if (!profile.host.trim() || /\s|[/?#@\\]|:\/\//.test(profile.host)) return "Enter a hostname or IP without a protocol or port.";
  if (!Number.isInteger(profile.port) || profile.port < 1 || profile.port > 65535) return "Port must be between 1 and 65535.";
  if (profile.bypass.some((item) => !item.trim() || /[,;\s]/.test(item))) return "Bypass hosts cannot contain whitespace, commas or semicolons.";
  return null;
}

export function validateApp(entry: AppEntry): string | null {
  if (!entry.name.trim() || entry.name.trim().length > 70) return "Enter an application name (up to 70 characters).";
  if (!entry.appPath.startsWith("/") || !entry.appPath.endsWith(".app")) return "Choose a macOS .app bundle.";
  if (!entry.profileId) return "Choose a proxy profile.";
  return null;
}

export function appDisplayName(path: string): string {
  return path.split("/").pop()?.replace(/\.app$/, "") ?? "Untitled app";
}

export function displayEndpoint(profile: ProxyProfile): string {
  const host = profile.host.includes(":") && !profile.host.startsWith("[") ? `[${profile.host}]` : profile.host;
  return `${host}:${profile.port}`;
}
