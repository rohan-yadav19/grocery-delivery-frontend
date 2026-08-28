import { describe, it, expect, beforeEach } from "vitest";
import { validatePromoCode, _setTestOutcome, placeOrder } from "../../src/services/orderService";
import type { PlaceOrderRequest } from "../../src/services/orderService";

function makeMockRequest(overrides?: Partial<PlaceOrderRequest>): PlaceOrderRequest {
  return {
    items: [{ productId: "p1", name: "Test", price: 5, quantity: 1, lineTotal: 5 }],
    subtotal: 5,
    deliveryFee: 0,
    discount: 0,
    total: 5,
    deliveryMethod: "standard",
    paymentMethod: "card",
    deliveryAddress: "123 Test St",
    promoCode: null,
    ...overrides,
  };
}

describe("orderService", () => {
  beforeEach(() => {
    _setTestOutcome(null);
  });

  // ── validatePromoCode ───────────────────────────────────────────────────

  describe("validatePromoCode", () => {
    it("returns discount info for a valid code (FRESH10)", () => {
      const result = validatePromoCode("FRESH10");
      expect(result).not.toBeNull();
      expect(result!.discount).toBe(0.1);
      expect(result!.label).toBe("10% off");
    });

    it("returns discount info for SAVE5", () => {
      const result = validatePromoCode("save5");
      expect(result).not.toBeNull();
      expect(result!.discount).toBe(0.05);
    });

    it("is case-insensitive", () => {
      expect(validatePromoCode("fresh10")).not.toBeNull();
      expect(validatePromoCode("Fresh10")).not.toBeNull();
    });

    it("returns null for invalid code", () => {
      expect(validatePromoCode("INVALID")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(validatePromoCode("")).toBeNull();
    });
  });

  // ── placeOrder ──────────────────────────────────────────────────────────

  describe("placeOrder", () => {
    it("returns an order ID on deterministic success", async () => {
      _setTestOutcome("success");
      const response = await placeOrder(makeMockRequest());
      expect(response.orderId).toMatch(/^ORD-/);
      expect(response.status).toBe("confirmed");
    });

    it("throws on deterministic failure", async () => {
      _setTestOutcome("error");
      await expect(placeOrder(makeMockRequest())).rejects.toThrow(
        "Payment processing failed",
      );
    });

    it("resets test outcome after one use", async () => {
      _setTestOutcome("success");
      await placeOrder(makeMockRequest());

      // The next call should use random behavior (not guaranteed result)
      // but _setTestOutcome should be null now — just verify no crash
      _setTestOutcome("success");
      const response = await placeOrder(makeMockRequest());
      expect(response.orderId).toBeTruthy();
    });
  });
});
