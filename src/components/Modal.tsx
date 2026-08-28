import { useEffect, useCallback, type ReactNode } from "react";
import { CloseIcon } from "./icons";

interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user requests closing. */
  onClose: () => void;
  /** Optional title. */
  title?: string;
  /** Modal body content. */
  children: ReactNode;
}

/**
 * Centered modal dialog for all viewports.
 *
 * Used for error states, confirmations, etc.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
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

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-2xl max-w-md w-[calc(100%-32px)] max-h-[85vh] flex flex-col"
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
