import { iconAttrs, type IconProps } from "./iconUtils";

export function MinusIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
