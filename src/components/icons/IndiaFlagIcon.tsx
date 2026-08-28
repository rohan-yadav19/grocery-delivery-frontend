interface IndiaFlagIconProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * High-definition Indian Flag SVG badge.
 * Guarantees cross-platform flag rendering on Windows, macOS, Linux, iOS & Android.
 */
export function IndiaFlagIcon({ className = "", width = 28, height = 20 }: IndiaFlagIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 28 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block rounded-xs shadow-xs overflow-hidden border border-black/10 ${className}`}
      aria-label="India Flag"
      role="img"
    >
      {/* Saffron Top */}
      <rect width="28" height="6.67" fill="#FF9933" />
      {/* White Center */}
      <rect y="6.67" width="28" height="6.67" fill="#FFFFFF" />
      {/* Green Bottom */}
      <rect y="13.34" width="28" height="6.67" fill="#138808" />
      {/* Ashoka Chakra */}
      <circle cx="14" cy="10" r="2.5" stroke="#000080" strokeWidth="0.6" fill="none" />
      <circle cx="14" cy="10" r="0.6" fill="#000080" />
      {/* Chakra Spokes */}
      <g stroke="#000080" strokeWidth="0.3">
        <line x1="14" y1="7.6" x2="14" y2="12.4" />
        <line x1="11.6" y1="10" x2="16.4" y2="10" />
        <line x1="12.3" y1="8.3" x2="15.7" y2="11.7" />
        <line x1="12.3" y1="11.7" x2="15.7" y2="8.3" />
      </g>
    </svg>
  );
}

export default IndiaFlagIcon;
