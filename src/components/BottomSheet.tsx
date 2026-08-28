import { useEffect, useCallback, type ReactNode } from "react";
import { CloseIcon } from "./icons";

interface BottomSheetProps {
  /** Whether the sheet is visible. */
  open: boolean;
  /** Called when the user requests closing (backdrop click, X button, Escape). */
  onClose: () => void;
  /** Optional title displayed in the sheet header. */
  title?: string;
  /** Sheet body content. */
  children: ReactNode;
}

/**
 * Slide-up bottom sheet (mobile) / centered modal dialog (desktop).
 *
 * Renders a backdrop overlay and a content panel with close affordances.
 */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when sheet is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="overlay-backdrop"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
        className="fixed inset-x-0 bottom-0 z-50 bg-[var(--color-surface)] rounded-t-[var(--radius-sheet)] shadow-2xl max-h-[85vh] flex flex-col animate-[slideUp_200ms_ease-out] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-card)] md:max-w-lg md:w-full md:animate-[fadeIn_150ms_ease-out]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          {title ? (
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] m-0">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-full hover:bg-[var(--color-input-bg)]"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </>
  );
}
