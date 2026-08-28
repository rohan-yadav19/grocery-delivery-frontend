import { iconAttrs, type IconProps } from "./iconUtils";

export function InfoIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
