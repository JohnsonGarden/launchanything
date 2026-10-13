import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("h-10 w-full rounded-[10px] border border-[#e1e5ed] bg-white px-3.5 text-[13px] text-[#20263a] outline-none transition-colors placeholder:text-[#a0a6b4] focus:border-[#9799ed] focus:ring-[3px] focus:ring-[#edeeff]", className)} {...props} />;
}
