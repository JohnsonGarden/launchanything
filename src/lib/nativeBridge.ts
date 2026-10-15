import { invoke, isTauri } from "@tauri-apps/api/core";

/** This code must only run inside the Tauri-owned macOS WebView. */
export const NATIVE_BRIDGE_UNAVAILABLE = "NATIVE_BRIDGE_UNAVAILABLE" as const;

export class NativeBridgeUnavailableError extends Error {
  readonly code = NATIVE_BRIDGE_UNAVAILABLE;
  constructor() {
    super("Tauri native IPC is unavailable in this window.");
    this.name = "NativeBridgeUnavailableError";
  }
}

export function isNativeBridgeUnavailableError(error: unknown): error is NativeBridgeUnavailableError {
  return error instanceof NativeBridgeUnavailableError;
}

type NativeDispatch = (command: string, args?: Record<string, unknown>) => Promise<unknown>;

/** Only normalize the precise missing-IPC failure; preserve all Rust errors. */
function isMissingBridgeTypeError(error: unknown): boolean {
  return error instanceof TypeError
    && /invoke/i.test(error.message)
    && /undefined|not an object|__TAURI_INTERNALS__/i.test(error.message);
}

/**
 * Central adapter for all Rust commands.
 * `isTauri` is provided by the official Tauri v2 API; a Vite browser
 * preview must never attempt native IPC or pretend to load real settings.
 */
export async function invokeNative<T>(
  command: string,
  args?: Record<string, unknown>,
  available: () => boolean = isTauri,
  dispatch: NativeDispatch = invoke,
): Promise<T> {
  if (!available()) throw new NativeBridgeUnavailableError();
  try {
    return await dispatch(command, args) as T;
  } catch (error) {
    if (isMissingBridgeTypeError(error)) throw new NativeBridgeUnavailableError();
    throw error;
  }
}
