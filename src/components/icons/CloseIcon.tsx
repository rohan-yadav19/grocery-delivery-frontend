import { iconAttrs, type IconProps } from "./iconUtils";

export function CloseIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
