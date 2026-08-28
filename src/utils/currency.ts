/**
 * Centralized currency formatter.
 *
 * All price display throughout the app should use this function
 * to ensure consistent formatting (symbol, decimals, locale).
 */

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as a USD currency string (e.g. `$4.99`). */
export function formatCurrency(amount: number): string {
  return formatter.format(amount);
}
