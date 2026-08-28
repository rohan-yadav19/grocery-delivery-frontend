import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible label (required — icon-only buttons need a text label for screen readers). */
  "aria-label": string;
  /** The icon element to render. */
  icon: ReactNode;
  /** Size of the pressable area in pixels. */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-[45px] h-[45px]",
} as const;

/**
 * Pressable icon-only button with accessible labelling.
 */
export function IconButton({
  icon,
  size = "md",
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-[var(--radius-action)] border-none bg-transparent cursor-pointer transition-colors hover:bg-[var(--color-input-bg)] ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
