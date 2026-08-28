import { StarIcon } from "./icons";

interface RatingStarsProps {
  /** Rating value from 0 to 5. */
  rating: number;
  /** Number of star icons to render. Defaults to 5. */
  maxStars?: number;
  /** Size of each star icon. */
  size?: number;
}

/**
 * Renders a row of filled / empty star icons for product ratings.
 */
export function RatingStars({
  rating,
  maxStars = 5,
  size = 16,
}: RatingStarsProps) {
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <StarIcon
            key={i}
            size={size}
            className={filled ? "text-[var(--color-star-gold)]" : "text-[var(--color-border)]"}
            style={filled ? { fill: "var(--color-star-gold)" } : undefined}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
