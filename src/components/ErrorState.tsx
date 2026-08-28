import { Button } from "./Button";
import { CloseIcon } from "./icons";

interface ErrorStateProps {
  /** Error heading. */
  title?: string;
  /** Error description. */
  description?: string;
  /** Retry button label. */
  retryLabel?: string;
  /** Called when the retry button is clicked. */
  onRetry?: () => void;
  /** Secondary action label (e.g. "Back to home"). */
  secondaryLabel?: string;
  /** Called when the secondary action is clicked. */
  onSecondary?: () => void;
}

/**
 * Error state matching the Figma "Order Failed" pattern.
 *
 * Centered layout with icon, message, retry button, and
 * optional secondary action.
 */
export function ErrorState({
  title = "Oops! Something went wrong",
  description = "Please try again.",
  retryLabel = "Try Again",
  onRetry,
  secondaryLabel,
  onSecondary,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-50 mb-6">
        <CloseIcon size={32} className="text-[var(--color-error)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] m-0">
        {title}
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xs">
        {description}
      </p>
      {onRetry && (
        <div className="mt-6 w-full max-w-[280px]">
          <Button onClick={onRetry}>{retryLabel}</Button>
        </div>
      )}
      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          className="mt-4 bg-transparent border-none cursor-pointer text-base font-semibold text-[var(--color-text-primary)] hover:underline"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
