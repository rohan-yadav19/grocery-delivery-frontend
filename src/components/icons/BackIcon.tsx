import { iconAttrs, type IconProps } from "./iconUtils";

export function BackIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
