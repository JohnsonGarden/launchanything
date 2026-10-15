import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3.5 text-[13px] text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--faint-foreground)] focus:border-[var(--ring)] focus:ring-[3px] focus:ring-[var(--primary-subtle)]", className)} {...props} />;
}
