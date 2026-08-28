/**
 * Cart service — derives validated CartLineItems from raw cart state
 * and current product data.
 *
 * This is where the "persisted cart consistency" logic lives:
 *
 * 1. Products that no longer exist → removed from the active view
 * 2. Prices always come from CURRENT product data (never persisted)
 * 3. Quantities are clamped to current stock levels
 */

import type { CartItem, CartLineItem, CartSummary } from "../types";
import { getProductById } from "./productService";

// ---------------------------------------------------------------------------
// Delivery fee
// ---------------------------------------------------------------------------

/** Flat delivery fee shown in the cart summary. */
const DELIVERY_FEE = 0; // free delivery — matches reference which shows no delivery line

// ---------------------------------------------------------------------------
// Core: derive a validated line item from a raw cart entry
// ---------------------------------------------------------------------------

/**
 * Resolves a raw `CartItem` against the current product catalogue.
 *
 * Returns `null` when the product no longer exists.
 * Clamps quantity to [1, stock].
 * Always uses the current product price (never a persisted one).
 */
export function resolveCartItem(item: CartItem): CartLineItem | null {
  const product = getProductById(item.productId);
  if (!product) return null; // product deleted — remove

  // Clamp quantity to valid range [1, stock]
  const clampedQuantity = Math.max(1, Math.min(item.quantity, product.stock));

  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    image: product.image,
    stock: product.stock,
    quantity: clampedQuantity,
    lineTotal: product.price * clampedQuantity,
  };
}

// ---------------------------------------------------------------------------
// Derive the full validated cart summary
// ---------------------------------------------------------------------------

/**
 * Build a validated `CartSummary` from raw cart items.
 *
 * - Drops products that no longer exist.
 * - Uses current product prices.
 * - Clamps quantities to current stock.
 *
 * This is a pure function — it does NOT mutate the Zustand store.
 * The caller can decide whether to sync corrections back.
 */
export function deriveCartSummary(rawItems: readonly CartItem[]): CartSummary {
  const lineItems: CartLineItem[] = [];

  for (const raw of rawItems) {
    const resolved = resolveCartItem(raw);
    if (resolved) lineItems.push(resolved);
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const itemCount = lineItems.reduce((sum, li) => sum + li.quantity, 0);

  return { items: lineItems, subtotal, itemCount };
}

/**
 * Get the delivery fee for the current cart.
 * Can be extended later to depend on subtotal, location, etc.
 */
export function getDeliveryFee(_subtotal: number): number {
  return DELIVERY_FEE;
}
