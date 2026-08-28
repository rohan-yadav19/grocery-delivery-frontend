interface LoadingSkeletonProps {
  /** Width (CSS value). Defaults to "100%". */
  width?: string;
  /** Height (CSS value). Defaults to "16px". */
  height?: string;
  /** Border radius (CSS value). */
  borderRadius?: string;
  /** Predefined shape variants. */
  variant?: "text" | "card" | "image";
  /** Additional class names. */
  className?: string;
}

const variantDefaults: Record<string, { width: string; height: string; borderRadius: string }> = {
  text:  { width: "100%", height: "16px",  borderRadius: "4px" },
  card:  { width: "100%", height: "200px", borderRadius: "var(--radius-card)" },
  image: { width: "100%", height: "150px", borderRadius: "8px" },
};

/**
 * Animated loading skeleton with a shimmer pulse effect.
 */
export function LoadingSkeleton({
  width,
  height,
  borderRadius,
  variant = "text",
  className = "",
}: LoadingSkeletonProps) {
  const defaults = variantDefaults[variant] ?? variantDefaults.text!;

  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width: width ?? defaults.width,
        height: height ?? defaults.height,
        borderRadius: borderRadius ?? defaults.borderRadius,
      }}
      role="status"
      aria-label="Loading"
    />
  );
}
