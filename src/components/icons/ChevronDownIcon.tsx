import { iconAttrs, type IconProps } from "./iconUtils";

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
