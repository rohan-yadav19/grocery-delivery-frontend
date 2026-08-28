import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon } from "./icons";

interface HeaderProps {
  /** Page title (centered). */
  title?: string;
  /** Show back button. If true, navigates back on click. */
  showBack?: boolean;
  /** Custom back handler (overrides default history.back). */
  onBack?: () => void;
  /** Optional element rendered on the right side (e.g. filter or share button). */
  rightAction?: ReactNode;
  /** Optional content rendered below the title row (e.g. location bar). */
  children?: ReactNode;
}

/**
 * Dynamic header bar supporting back navigation, centered title,
 * and an optional right-side action.
 */
export function Header({
  title,
  showBack = false,
  onBack,
  rightAction,
  children,
}: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[var(--color-surface)]">
      <div className="app-container flex items-center justify-between h-14">
        {/* Left slot */}
        <div className="w-10">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer rounded-full hover:bg-[var(--color-input-bg)]"
              aria-label="Go back"
            >
              <BackIcon size={24} />
            </button>
          )}
        </div>

        {/* Center title */}
        {title && (
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] m-0 truncate">
            {title}
          </h1>
        )}

        {/* Right slot */}
        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>

      {children}
    </header>
  );
}
