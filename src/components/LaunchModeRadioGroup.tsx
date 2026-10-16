import * as RadioGroup from "@radix-ui/react-radio-group";
import type { LaunchMode } from "@/lib/models";

export const LAUNCH_MODES: readonly LaunchMode[] = ["environment", "chromium", "combined"];

interface Props {
  value: LaunchMode;
  onChange: (value: LaunchMode) => void;
  label: string;
  labels: Record<LaunchMode, string>;
}

/** True keyboard-operable, mutually exclusive radios — never three adjacent action buttons. */
export function LaunchModeRadioGroup({ value, onChange, label, labels }: Props) {
  return <fieldset className="min-w-0">
    <legend className="mb-2 text-[10px] font-bold tracking-[.105em] text-[var(--muted-foreground)]">{label}</legend>
    <RadioGroup.Root aria-label={label} value={value} onValueChange={(next) => onChange(next as LaunchMode)} className="grid grid-cols-3 gap-3 max-[410px]:grid-cols-1">
      {LAUNCH_MODES.map((mode) => <RadioGroup.Item
        key={mode}
        value={mode}
        id={`launch-mode-${mode}`}
        className="launch-mode-choice"
      >
        <span className="launch-mode-indicator" aria-hidden="true"><RadioGroup.Indicator className="launch-mode-dot"/></span>
        <span className="min-w-0 leading-snug">{labels[mode]}</span>
      </RadioGroup.Item>)}
    </RadioGroup.Root>
  </fieldset>;
}
