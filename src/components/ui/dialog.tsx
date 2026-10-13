import * as React from "react";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = Primitive.Root;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogClose = Primitive.Close;

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal>
    <Primitive.Overlay className="fixed inset-0 z-40 bg-[#121b35]/35 backdrop-blur-[5px] data-[state=open]:animate-in" />
    <Primitive.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-[#e8eaf0] bg-white p-7 shadow-[0_28px_90px_rgba(17,24,49,.20)] outline-none", className)} {...props}>
      {children}
      <Primitive.Close aria-label="Close dialog" className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-[#8d95a6] transition-colors hover:bg-[#f3f4f7]"><X size={17} /></Primitive.Close>
    </Primitive.Content>
  </Primitive.Portal>;
}
