import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[13px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-soft)] disabled:pointer-events-none disabled:opacity-50 active:scale-[.985]",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] theme-primary-button hover:bg-[var(--primary-hover)]",
        secondary: "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--surface-tinted)]",
        ghost: "text-[var(--muted-foreground)] hover:bg-[var(--surface-tinted)] hover:text-[var(--foreground)]",
        destructive: "text-[var(--destructive)] hover:bg-[var(--destructive-subtle)]",
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3", icon: "size-9" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type Props = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };
export function Button({ asChild = false, className, variant, size, ...props }: Props) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
