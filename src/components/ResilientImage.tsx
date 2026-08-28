import { useState, useRef, useCallback } from "react";
import type { SyntheticEvent } from "react";

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Image component that gracefully handles missing asset files.
 *
 * When the src fails to load (404), renders a styled placeholder
 * with the first letter of the alt text. This prevents the app from
 * breaking when Figma-sourced assets are not yet exported.
 */
export function ResilientImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    setFailed(true);
  }, []);

  if (failed) {
    return (
      <div
        className={`resilient-image-placeholder ${className}`}
        role="img"
        aria-label={alt}
      >
        <span>{alt.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
}
