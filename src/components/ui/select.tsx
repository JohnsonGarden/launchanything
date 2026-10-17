import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Theme-aware shadcn-style Select, backed by Radix rather than the platform's
 * native <select> menu. Shared by both application and proxy editor dialogs.
 */
export function FormSelect({
  value, onValueChange, options, ariaLabel, disabled, placeholder, className,
}: FormSelectProps) {
  return (
    <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3.5 text-left text-[13px] text-[var(--foreground)] outline-none transition-colors",
          "focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--primary-subtle)]",
          "data-[state=open]:border-[var(--ring)] data-[state=open]:ring-[3px] data-[state=open]:ring-[var(--primary-subtle)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder || "—"} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown size={15} className="shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={5}
          align="start"
          collisionPadding={12}
          className="z-[100] max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[11px] border border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-[0_14px_38px_rgba(40,22,32,.16)] outline-none"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-[var(--muted-foreground)]">
            <ChevronUp size={14} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex min-h-9 cursor-default select-none items-center rounded-[8px] py-2 pl-3 pr-8 text-[13px] outline-none data-[highlighted]:bg-[var(--primary-subtle)] data-[highlighted]:text-[var(--foreground)] data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center text-[var(--primary)]">
                  <Check size={15} aria-hidden="true"/>
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-[var(--muted-foreground)]">
            <ChevronDown size={14}/>
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
