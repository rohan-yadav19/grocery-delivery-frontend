/**
 * Mock order service — simulates placing an order with variable latency.
 *
 * Supports deterministic test overrides via `_setTestOutcome`.
 */

import type { OrderItem } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlaceOrderRequest {
  readonly items: readonly OrderItem[];
  readonly subtotal: number;
  readonly deliveryFee: number;
  readonly discount: number;
  readonly total: number;
  readonly deliveryMethod: string;
  readonly paymentMethod: string;
  readonly deliveryAddress: string;
  readonly promoCode: string | null;
}

export interface PlaceOrderResponse {
  readonly orderId: string;
  readonly status: "confirmed";
  readonly estimatedDelivery: string;
}

// ---------------------------------------------------------------------------
// Internal test helpers
// ---------------------------------------------------------------------------

let _testOutcome: "success" | "error" | null = null;

/**
 * Override the next call outcome for testing.
 * Set `null` to restore default random behavior.
 */
export function _setTestOutcome(outcome: "success" | "error" | null): void {
  _testOutcome = outcome;
}

// ---------------------------------------------------------------------------
// Mock promo codes
// ---------------------------------------------------------------------------

const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  FRESH10: { discount: 0.1, label: "10% off" },
  SAVE5: { discount: 0.05, label: "5% off" },
};

/**
 * Validate a promo code synchronously.
 * Returns the discount fraction (0–1) and label, or null if invalid.
 */
export function validatePromoCode(
  code: string,
): { discount: number; label: string } | null {
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES[normalized] ?? null;
}

// ---------------------------------------------------------------------------
// Place order
// ---------------------------------------------------------------------------

let _orderCounter = 0;

function generateOrderId(): string {
  _orderCounter += 1;
  return `ORD-${Date.now()}-${_orderCounter}`;
}

/**
 * Simulate placing an order.
 *
 * - Latency: 800–2000ms (random)
 * - Default success rate: ~85%
 * - Deterministic overrides via `_setTestOutcome`
 */
export async function placeOrder(
  _request: PlaceOrderRequest,
): Promise<PlaceOrderResponse> {
  // Simulate network latency (reduced when test override is active)
  const latency = _testOutcome !== null ? 50 : 800 + Math.random() * 1200;
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Determine outcome
  let shouldSucceed: boolean;

  if (_testOutcome !== null) {
    shouldSucceed = _testOutcome === "success";
    _testOutcome = null; // reset after use
  } else {
    shouldSucceed = Math.random() < 0.85;
  }

  if (!shouldSucceed) {
    throw new Error("Payment processing failed. Please try again.");
  }

  return {
    orderId: generateOrderId(),
    status: "confirmed",
    estimatedDelivery: "30–45 min",
  };
}
