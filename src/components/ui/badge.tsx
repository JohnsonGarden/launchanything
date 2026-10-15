import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-tinted)] px-2.5 py-1 text-[11px] font-medium tracking-[.01em] text-[var(--muted-foreground)]", className)} {...props} />;
}
