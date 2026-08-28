import { useId } from "react";
import { CheckIcon } from "./icons";

interface CheckboxProps {
  /** Whether the checkbox is checked. */
  checked: boolean;
  /** Called when the checked state changes. */
  onChange: (checked: boolean) => void;
  /** Label text displayed next to the checkbox. */
  label: string;
  /** Whether the checkbox is disabled. */
  disabled?: boolean;
}

/**
 * Custom styled checkbox with a green checkmark.
 *
 * Wraps a native `<input type="checkbox">` for full
 * keyboard and screen reader support.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
}: CheckboxProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors ${
          checked
            ? "bg-[var(--color-brand)] border-[var(--color-brand)]"
            : "bg-transparent border-[var(--color-border)]"
        }`}
        aria-hidden
      >
        {checked && <CheckIcon size={14} className="text-white" />}
      </span>
      <span className="text-sm text-[var(--color-text-primary)]">
        {label}
      </span>
    </label>
  );
}
