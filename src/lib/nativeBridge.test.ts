import { describe, expect, it, vi } from "vitest";
import { NativeBridgeUnavailableError, invokeNative, isNativeBridgeUnavailableError } from "./nativeBridge";

describe("native IPC guard", () => {
  it("rejects a browser preview without ever calling invoke", async () => {
    const dispatch = vi.fn(async () => ({ schemaVersion: 1, profiles: [], apps: [] }));
    await expect(invokeNative("load_state", undefined, () => false, dispatch))
      .rejects.toMatchObject({ code: "NATIVE_BRIDGE_UNAVAILABLE" });
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("forwards commands and arguments through an available native bridge", async () => {
    const args = { profile: { id: "p1", port: 7890 } };
    const dispatch = vi.fn(async () => ({ result: "ok" }));
    await expect(invokeNative("save_profile", args, () => true, dispatch)).resolves.toEqual({ result: "ok" });
    expect(dispatch).toHaveBeenCalledOnce();
    expect(dispatch).toHaveBeenCalledWith("save_profile", args);
  });
  it("turns a missing injected invoke function into an actionable runtime error", async () => {
    const dispatch = vi.fn(async (): Promise<never> => {
      throw new TypeError("Cannot read properties of undefined (reading 'invoke')");
    });
    await expect(invokeNative("load_state", undefined, () => true, dispatch))
      .rejects.toBeInstanceOf(NativeBridgeUnavailableError);
  });
  it("does not mislabel unrelated backend or permissions errors", async () => {
    const backendError = new Error("permission denied while reading configuration");
    const dispatch = vi.fn(async (): Promise<never> => { throw backendError; });
    await expect(invokeNative("load_state", undefined, () => true, dispatch)).rejects.toBe(backendError);
    expect(isNativeBridgeUnavailableError(backendError)).toBe(false);
    expect(isNativeBridgeUnavailableError(new NativeBridgeUnavailableError())).toBe(true);
  });
});
