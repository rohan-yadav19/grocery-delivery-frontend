import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. */
  variant?: "primary" | "secondary" | "ghost";
  /** Stretch to full container width. */
  fullWidth?: boolean;
  /** Content rendered inside the button. */
  children: ReactNode;
}

/**
 * Primary CTA and utility button.
 *
 * Uses the CSS component classes from the design system so
 * button styling stays centralized in index.css.
 */
export function Button({
  variant = "primary",
  fullWidth = true,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : "btn-ghost";

  const widthClass = fullWidth ? "w-full" : "w-auto";

  return (
    <button className={`${base} ${widthClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
