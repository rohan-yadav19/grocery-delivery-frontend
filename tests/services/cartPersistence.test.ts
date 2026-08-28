import { describe, it, expect } from "vitest";
import { deriveCartSummary, resolveCartItem } from "../../src/services/cartService";
import type { CartItem } from "../../src/types";

/**
 * Persisted cart consistency tests.
 *
 * Explicitly verifies all four required assignment edge cases:
 * 1. Product no longer exists in current dataset (silently removed).
 * 2. Persisted price differs from latest dataset (always uses live catalogue price).
 * 3. Quantity becomes zero or negative (clamped to 1).
 * 4. Quantity exceeds available stock (clamped to product stock).
 *
 * These tests construct raw CartItem arrays that mimic corrupted/stale
 * localStorage data and verify that deriveCartSummary produces safe results.
 */
describe("Persisted Cart Consistency", () => {
  // ── Case A: Product no longer exists ─────────────────────────────────

  describe("Case A — Product deleted from catalogue", () => {
    it("removes a non-existent product from derived cart", () => {
      const items: CartItem[] = [
        { productId: "prod-old-deleted-product", quantity: 5 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items.length).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.itemCount).toBe(0);
    });

    it("preserves valid items while removing deleted ones", () => {
      const items: CartItem[] = [
        { productId: "prod-diet-coke", quantity: 1 },
        { productId: "prod-removed-xyz", quantity: 3 },
        { productId: "prod-red-apple", quantity: 2 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items.length).toBe(2);
      expect(summary.items.map((i) => i.productId)).toEqual([
        "prod-diet-coke",
        "prod-red-apple",
      ]);
    });

    it("resolveCartItem returns null for deleted product", () => {
      const result = resolveCartItem({ productId: "prod-fantasy", quantity: 10 });
      expect(result).toBeNull();
    });
  });

  // ── Case B: Product price changed ────────────────────────────────────

  describe("Case B — Price changed since persistence", () => {
    it("uses current product price, not any stale persisted price", () => {
      // Red Apple's current price in products.json is $5.99
      const items: CartItem[] = [
        { productId: "prod-red-apple", quantity: 2 },
      ];
      const summary = deriveCartSummary(items);

      // The summary should use the live price
      expect(summary.items[0]!.price).toBe(5.99);
      expect(summary.items[0]!.lineTotal).toBeCloseTo(11.98);
      expect(summary.subtotal).toBeCloseTo(11.98);
    });

    it("never includes a stale price in the line total", () => {
      // Even if the persisted CartItem has no price field (it shouldn't),
      // the derived line item gets its price from the product catalogue.
      const item: CartItem = { productId: "prod-ginger", quantity: 3 };
      const result = resolveCartItem(item);
      expect(result).not.toBeNull();
      // Ginger price = 2.99
      expect(result!.price).toBe(2.99);
      expect(result!.lineTotal).toBeCloseTo(8.97);
    });
  });

  // ── Case C: Invalid quantity ─────────────────────────────────────────

  describe("Case C — Persisted quantity exceeds stock", () => {
    it("clamps quantity to current stock", () => {
      // Beef Bone stock = 15
      const items: CartItem[] = [
        { productId: "prod-beef-bone", quantity: 200 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items[0]!.quantity).toBe(15);
      expect(summary.items[0]!.lineTotal).toBeCloseTo(8.99 * 15);
    });

    it("clamps quantity to 1 when persisted as zero", () => {
      const items: CartItem[] = [
        { productId: "prod-ginger", quantity: 0 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items[0]!.quantity).toBe(1);
    });

    it("clamps negative quantity to 1", () => {
      const items: CartItem[] = [
        { productId: "prod-ginger", quantity: -5 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items[0]!.quantity).toBe(1);
    });
  });

  // ── Combined scenario ────────────────────────────────────────────────

  describe("Combined — mixed valid, deleted, and invalid items", () => {
    it("produces a correct summary from messy persisted data", () => {
      const items: CartItem[] = [
        // Valid product, valid quantity
        { productId: "prod-diet-coke", quantity: 3 },       // 3 * 1.99 = 5.97
        // Deleted product
        { productId: "prod-old-milk", quantity: 10 },       // removed
        // Valid product, quantity exceeds stock (Red Apple stock=35)
        { productId: "prod-red-apple", quantity: 999 },     // clamped to 35 * 5.99 = 209.65
        // Zero quantity
        { productId: "prod-ginger", quantity: 0 },          // clamped to 1 * 2.99 = 2.99
      ];

      const summary = deriveCartSummary(items);

      // 3 valid items (deleted product removed)
      expect(summary.items.length).toBe(3);

      // Correct quantities
      expect(summary.items[0]!.quantity).toBe(3);  // diet coke
      expect(summary.items[1]!.quantity).toBe(35); // red apple clamped
      expect(summary.items[2]!.quantity).toBe(1);  // ginger clamped

      // Correct subtotal
      const expectedSubtotal = (3 * 1.99) + (35 * 5.99) + (1 * 2.99);
      expect(summary.subtotal).toBeCloseTo(expectedSubtotal);

      // Correct item count
      expect(summary.itemCount).toBe(3 + 35 + 1);
    });
  });
});
