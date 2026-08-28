import { iconAttrs, type IconProps } from "./iconUtils";

export function EyeIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
