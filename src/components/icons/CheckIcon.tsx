import { iconAttrs, type IconProps } from "./iconUtils";

export function CheckIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
