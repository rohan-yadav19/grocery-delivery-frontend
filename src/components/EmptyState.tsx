import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  /** Icon or illustration element. */
  icon?: ReactNode;
  /** Heading text. */
  title: string;
  /** Descriptive text. */
  description?: string;
  /** Optional action button label. */
  actionLabel?: string;
  /** Called when the action button is clicked. */
  onAction?: () => void;
}

/**
 * Centered empty-state placeholder for screens with no data.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-6 text-[var(--color-text-secondary)]">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] m-0">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xs">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6 w-full max-w-[200px]">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
