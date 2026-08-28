import { iconAttrs, type IconProps } from "./iconUtils";

export function LocationIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
