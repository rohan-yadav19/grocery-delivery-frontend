import type { SVGProps } from "react";

/**
 * Shared props for all SVG icon components.
 * Keeps the icon API simple and consistent.
 */
export type IconProps = SVGProps<SVGSVGElement> & {
  /** Icon size in pixels (applied to both width and height). Defaults to 24. */
  size?: number;
};

/** Merge IconProps into standard SVG attributes with sensible defaults. */
export function iconAttrs({
  size = 24,
  className,
  "aria-hidden": ariaHidden,
  ...rest
}: IconProps): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": ariaHidden ?? !rest["aria-label"],
    role: rest["aria-label"] ? "img" : undefined,
    ...rest,
  };
}
