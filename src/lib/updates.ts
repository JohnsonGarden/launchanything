import { getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";

export const RELEASES_URL = "https://github.com/JohnsonGarden/launchanything/releases";

type Version = { core: [number, number, number]; prerelease: string[] };

export interface AvailableRelease {
  tag: string;
  version: string;
  prerelease: boolean;
  publishedAt: string | null;
  notes: string;
  url: string;
  hasSignedUpdater: boolean;
}

export interface ReleaseCheck {
  latest: AvailableRelease | null;
  newer: boolean;
}

interface GitHubRelease {
  tag_name?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  published_at?: unknown;
  body?: unknown;
  assets?: { name?: unknown }[];
}

/** Versions are SemVer ordered: 0.2.0-preview.1 > 0.1.0; 0.2.0 > 0.2.0-preview.9. */
export function parseVersion(value: string): Version | null {
  const m = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value);
  if (!m) return null;
  const prerelease = m[4] ? m[4].split(".") : [];
  if (prerelease.some((item) => !item || (/^\d+$/.test(item) && item.length > 1 && item[0] === "0"))) return null;
  return { core: [Number(m[1]), Number(m[2]), Number(m[3])], prerelease };
}

export function compareVersions(left: string, right: string): number {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) throw new Error("Invalid semantic version.");
  for (let i = 0; i < 3; i++) {
    if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i] ? 1 : -1;
  }
  if (!a.prerelease.length && b.prerelease.length) return 1;
  if (a.prerelease.length && !b.prerelease.length) return -1;
  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const l = a.prerelease[i], r = b.prerelease[i];
    if (l === undefined) return -1;
    if (r === undefined) return 1;
    const numericL = /^\d+$/.test(l), numericR = /^\d+$/.test(r);
    if (numericL && numericR) {
      if (l.length !== r.length) return l.length > r.length ? 1 : -1;
      if (l !== r) return l > r ? 1 : -1;
    } else if (numericL !== numericR) {
      return numericL ? -1 : 1;
    } else if (l !== r) {
      return l > r ? 1 : -1;
    }
  }
  return 0;
}

export function pickLatestRelease(payload: unknown, current: string): ReleaseCheck {
  if (!parseVersion(current)) throw new Error("Unable to read the installed application version.");
  if (!Array.isArray(payload)) throw new Error("Invalid GitHub Releases response.");
  const releases: AvailableRelease[] = (payload as GitHubRelease[])
    .filter((item) => item && !item.draft && typeof item.tag_name === "string" && parseVersion(item.tag_name) && item.tag_name.startsWith("v"))
    .map((item) => {
      const tag = item.tag_name as string;
      const assets = Array.isArray(item.assets) ? item.assets : [];
      return {
        tag,
        version: tag.slice(1),
        prerelease: item.prerelease === true,
        publishedAt: typeof item.published_at === "string" ? item.published_at : null,
        notes: typeof item.body === "string" ? item.body : "",
        url: RELEASES_URL + "/tag/" + encodeURIComponent(tag),
        hasSignedUpdater: assets.some((asset) => asset.name === "updater.json"),
      };
    })
    .sort((a, b) => compareVersions(b.version, a.version));
  const latest = releases[0] ?? null;
  return { latest, newer: latest !== null && compareVersions(latest.version, current) > 0 };
}

export async function currentAppVersion(): Promise<string | null> {
  return isTauri() ? getVersion() : null;
}

