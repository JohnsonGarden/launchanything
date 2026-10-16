import { describe, expect, it } from "vitest";
import { readTheme } from "@/lib/theme";

describe("theme persistence and safe fallback",()=>{
  it("defaults new installs and unknown values to the existing rose skin",()=>{
    expect(readTheme(null)).toBe("rose");
    expect(readTheme("unknown")).toBe("rose");
    expect(readTheme("rose")).toBe("rose");
  });
  it("restores shadcn monochrome dark explicitly",()=>{
    expect(readTheme("monochrome")).toBe("monochrome");
  });
});
