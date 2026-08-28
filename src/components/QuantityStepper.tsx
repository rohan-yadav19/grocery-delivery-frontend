import { PlusIcon, MinusIcon } from "./icons";

interface QuantityStepperProps {
  /** Current quantity value. */
  value: number;
  /** Called when the user clicks "+". */
  onIncrement: () => void;
  /** Called when the user clicks "−". */
  onDecrement: () => void;
  /** Minimum allowed value (minus button disabled at this value). Defaults to 1. */
  min?: number;
  /** Maximum allowed value (plus button disabled at this value). */
  max?: number;
}

/**
 * Controlled "− [quantity] +" stepper.
 *
 * Matches the Figma quantity controls used in Product Detail and Cart.
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label="Quantity">
      <button
        type="button"
        onClick={onDecrement}
        disabled={atMin}
        className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--radius-action)] border border-[var(--color-border)] bg-transparent cursor-pointer transition-colors hover:bg-[var(--color-input-bg)] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <MinusIcon size={18} className="text-[var(--color-brand)]" />
      </button>

      <span
        className="min-w-[32px] text-center text-lg font-semibold text-[var(--color-text-primary)] select-none"
        aria-live="polite"
        aria-atomic
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={atMax}
        className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--radius-action)] border border-[var(--color-border)] bg-transparent cursor-pointer transition-colors hover:bg-[var(--color-input-bg)] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        <PlusIcon size={18} className="text-[var(--color-brand)]" />
      </button>
    </div>
  );
}
