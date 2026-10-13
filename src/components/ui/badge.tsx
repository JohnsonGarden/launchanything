import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-[#e9ebf1] bg-[#f7f8fb] px-2.5 py-1 text-[11px] font-medium tracking-[.01em] text-[#6e7689]", className)} {...props} />;
}
