import type { SVGProps } from "react";

interface CarrotIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  monochrome?: boolean;
}

export function CarrotIcon({
  size = 32,
  monochrome = false,
  className,
  ...rest
}: CarrotIconProps) {
  if (monochrome) {
    return (
      <svg
        width={size}
        height={(size * 30) / 26}
        viewBox="0 0 26 30"
        fill="currentColor"
        className={className}
        {...rest}
      >
        <path d="M13 5C13 5 16 0 19 0C22 0 22 3 19 5C16 7 13 5 13 5Z" />
        <path d="M13 5C13 5 10 0 7 0C4 0 4 3 7 5C10 7 13 5 13 5Z" />
        <path d="M7 8C4 8 1 12 1 18C1 24 6 30 13 30C20 30 25 24 25 18C25 12 22 8 19 8C16 8 13 11 13 11C13 11 10 8 7 8Z" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={(size * 30) / 26}
      viewBox="0 0 26 30"
      fill="none"
      className={className}
      {...rest}
    >
      <path
        d="M13 5C13 5 16 0 19 0C22 0 22 3 19 5C16 7 13 5 13 5Z"
        fill="#53B175"
      />
      <path
        d="M13 5C13 5 10 0 7 0C4 0 4 3 7 5C10 7 13 5 13 5Z"
        fill="#53B175"
      />
      <path
        d="M7 8C4 8 1 12 1 18C1 24 6 30 13 30C20 30 25 24 25 18C25 12 22 8 19 8C16 8 13 11 13 11C13 11 10 8 7 8Z"
        fill="#F3603F"
      />
      <path
        d="M13 11C13 11 12 16 13 22"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
