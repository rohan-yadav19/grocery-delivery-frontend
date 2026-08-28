import { iconAttrs, type IconProps } from "./iconUtils";

export function ForwardIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
