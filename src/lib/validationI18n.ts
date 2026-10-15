import type { MessageKey } from "./translations";
import { en } from "./translations";

/** Keep existing validator API stable and translate known client-side errors. */
const VALIDATION_KEYS = [
  "validation.profileName", "validation.profileHost", "validation.profilePort", "validation.bypass",
  "validation.appName", "validation.appPath", "validation.appProfile",
] as const satisfies readonly MessageKey[];

const errors = new Map<string, MessageKey>(VALIDATION_KEYS.map((key) => [en[key], key]));

export function translatedValidationError(error: string, t: (key: MessageKey) => string): string {
  const key = errors.get(error);
  return key ? t(key) : error;
}
