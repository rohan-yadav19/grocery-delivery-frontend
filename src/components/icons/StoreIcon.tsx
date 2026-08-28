import { iconAttrs, type IconProps } from "./iconUtils";

export function StoreIcon(props: IconProps) {
  return (
    <svg {...iconAttrs(props)}>
      <path d="M3 9l1-4h16l1 4" />
      <path d="M3 9v1a3 3 0 0 0 6 0V9" />
      <path d="M9 9v1a3 3 0 0 0 6 0V9" />
      <path d="M15 9v1a3 3 0 0 0 6 0V9" />
      <path d="M4 10v10h16V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
