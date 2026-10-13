import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[13px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:pointer-events-none disabled:opacity-50 active:scale-[.985]",
  {
    variants: {
      variant: {
        default: "bg-[#494ce5] text-white shadow-[0_2px_7px_rgba(67,71,205,.16)] hover:bg-[#3e40cf]",
        secondary: "border border-[#e8eaf0] bg-white text-[#25283b] hover:bg-[#f6f7fa]",
        ghost: "text-[#555e73] hover:bg-[#f0f2f7] hover:text-[#1d2433]",
        destructive: "text-[#d34354] hover:bg-[#fff0f1]",
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
