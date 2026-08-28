import { describe, it, expect } from "vitest";
import { resolveCartItem, deriveCartSummary, getDeliveryFee } from "../../src/services/cartService";
import type { CartItem } from "../../src/types";

describe("cartService", () => {
  // ── resolveCartItem ─────────────────────────────────────────────────────

  describe("resolveCartItem", () => {
    it("returns a valid CartLineItem for an existing product", () => {
      const item: CartItem = { productId: "prod-diet-coke", quantity: 2 };
      const result = resolveCartItem(item);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Diet Coke");
      expect(result!.price).toBe(1.99);
      expect(result!.quantity).toBe(2);
      expect(result!.lineTotal).toBeCloseTo(3.98);
    });

    it("returns null for a product that does not exist", () => {
      const item: CartItem = { productId: "prod-nonexistent", quantity: 1 };
      const result = resolveCartItem(item);
      expect(result).toBeNull();
    });

    it("clamps quantity to stock when quantity exceeds stock", () => {
      // Diet Coke has stock: 100
      const item: CartItem = { productId: "prod-diet-coke", quantity: 999 };
      const result = resolveCartItem(item);
      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(100);
      expect(result!.lineTotal).toBeCloseTo(1.99 * 100);
    });

    it("clamps quantity to 1 when quantity is zero or negative", () => {
      const item: CartItem = { productId: "prod-diet-coke", quantity: 0 };
      const result = resolveCartItem(item);
      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(1);
    });

    it("uses the CURRENT product price, not a stale one", () => {
      // Red Apple's current price is 5.99 in products.json
      const item: CartItem = { productId: "prod-red-apple", quantity: 1 };
      const result = resolveCartItem(item);
      expect(result).not.toBeNull();
      expect(result!.price).toBe(5.99);
      expect(result!.lineTotal).toBeCloseTo(5.99);
    });
  });

  // ── deriveCartSummary ───────────────────────────────────────────────────

  describe("deriveCartSummary", () => {
    it("derives correct summary for multiple items", () => {
      const items: CartItem[] = [
        { productId: "prod-diet-coke", quantity: 2 },   // 2 * 1.99 = 3.98
        { productId: "prod-red-apple", quantity: 1 },   // 1 * 5.99 = 5.99
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items.length).toBe(2);
      expect(summary.subtotal).toBeCloseTo(9.97);
      expect(summary.itemCount).toBe(3);
    });

    it("filters out non-existent products", () => {
      const items: CartItem[] = [
        { productId: "prod-diet-coke", quantity: 1 },
        { productId: "prod-deleted-product", quantity: 3 },
        { productId: "prod-red-apple", quantity: 1 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items.length).toBe(2);
      expect(summary.items.every((i) => i.productId !== "prod-deleted-product")).toBe(true);
    });

    it("returns empty summary for all-invalid items", () => {
      const items: CartItem[] = [
        { productId: "prod-nonexistent-1", quantity: 1 },
        { productId: "prod-nonexistent-2", quantity: 5 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items.length).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.itemCount).toBe(0);
    });

    it("returns empty summary for empty input", () => {
      const summary = deriveCartSummary([]);
      expect(summary.items.length).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.itemCount).toBe(0);
    });

    it("clamps quantities and computes correct totals", () => {
      // Ginger has stock: 40, price: 2.99
      const items: CartItem[] = [
        { productId: "prod-ginger", quantity: 100 },
      ];
      const summary = deriveCartSummary(items);
      expect(summary.items[0]!.quantity).toBe(40);
      expect(summary.subtotal).toBeCloseTo(2.99 * 40);
    });
  });

  // ── getDeliveryFee ────────────────────────────────────────────────────────

  describe("getDeliveryFee", () => {
    it("returns 0 (free delivery)", () => {
      expect(getDeliveryFee(50)).toBe(0);
    });
  });
});
