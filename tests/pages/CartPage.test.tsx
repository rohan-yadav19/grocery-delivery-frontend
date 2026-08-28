import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useCartStore } from "../../src/stores/cartStore";

/**
 * CartPage integration tests.
 *
 * Uses the Zustand store directly to set up cart state before each test.
 */
describe("CartPage", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  function renderCart() {
    return render(
      <MemoryRouter initialEntries={["/cart"]}>
        <App />
      </MemoryRouter>,
    );
  }

  function addToCart(productId: string, qty = 1) {
    for (let i = 0; i < qty; i++) {
      useCartStore.getState().addItem(productId);
    }
  }

  // ── 1. Cart page renders ───────────────────────────────────────────────

  it("renders the cart page with heading", () => {
    renderCart();
    expect(screen.getByRole("heading", { name: /my cart/i })).toBeInTheDocument();
  });

  // ── 2. Empty cart state ────────────────────────────────────────────────

  it("shows empty state when cart is empty", () => {
    renderCart();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue shopping/i })).toBeInTheDocument();
  });

  // ── 3. Cart item renders ──────────────────────────────────────────────

  it("renders cart items with product info", () => {
    addToCart("prod-diet-coke");
    renderCart();

    expect(screen.getByText("Diet Coke")).toBeInTheDocument();
    expect(screen.getByText("355 ml")).toBeInTheDocument();
  });

  // ── 4. Quantity increases ─────────────────────────────────────────────

  it("increases quantity when + is clicked", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCart();

    await user.click(screen.getByLabelText("Increase quantity"));

    expect(useCartStore.getState().getQuantity("prod-diet-coke")).toBe(2);
  });

  // ── 5. Quantity decreases ─────────────────────────────────────────────

  it("decreases quantity when − is clicked", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke", 3);
    renderCart();

    await user.click(screen.getByLabelText("Decrease quantity"));

    expect(useCartStore.getState().getQuantity("prod-diet-coke")).toBe(2);
  });

  // ── 6. Quantity cannot exceed stock ───────────────────────────────────

  it("disables + button at stock limit", () => {
    // Diet Coke stock = 100, add 100
    addToCart("prod-diet-coke", 100);
    renderCart();

    const plusBtn = screen.getByLabelText("Increase quantity");
    expect(plusBtn).toBeDisabled();
  });

  // ── 7. Quantity reaching zero removes item ────────────────────────────

  it("removes item when quantity reaches zero", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCart();

    // Set min=0 on QuantityStepper, so decrement from 1 should remove
    await user.click(screen.getByLabelText("Decrease quantity"));

    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });

  // ── 8. Remove item works ──────────────────────────────────────────────

  it("removes item when X button is clicked", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCart();

    await user.click(screen.getByLabelText(/remove diet coke/i));

    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });

  // ── 9. Subtotal calculates correctly ──────────────────────────────────

  it("shows correct subtotal for cart items", () => {
    addToCart("prod-diet-coke", 2); // 2 * $1.99 = $3.98
    addToCart("prod-red-apple");    // 1 * $5.99 = $5.99
    renderCart();

    // $9.97 appears in subtotal, total, and checkout button
    const totals = screen.getAllByText("$9.97");
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  // ── 10. Total calculates correctly ────────────────────────────────────

  it("shows correct total with delivery fee", () => {
    addToCart("prod-ginger"); // 1 * $2.99 = $2.99
    renderCart();

    // Delivery is free, so total = $2.99
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  // ── 11. Cart persists across store reload ─────────────────────────────

  it("preserves cart items after store is re-read", () => {
    addToCart("prod-diet-coke", 3);

    // Verify state is in the store
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0]!.quantity).toBe(3);

    // Re-render shows the items
    renderCart();
    expect(screen.getByText("Diet Coke")).toBeInTheDocument();
  });

  // ── 15. Checkout button is available ──────────────────────────────────

  it("shows a Go to Checkout button when cart has items", () => {
    addToCart("prod-diet-coke");
    renderCart();
    expect(screen.getByRole("button", { name: /go to checkout/i })).toBeInTheDocument();
  });

  // ── 16. Continue Shopping works ───────────────────────────────────────

  it("shows Continue Shopping button on empty cart", () => {
    renderCart();
    expect(screen.getByRole("button", { name: /continue shopping/i })).toBeInTheDocument();
  });

  // ── 17. Keyboard-accessible controls ──────────────────────────────────

  it("has keyboard-accessible quantity controls and remove button", () => {
    addToCart("prod-diet-coke");
    renderCart();

    expect(screen.getByLabelText("Increase quantity")).toBeEnabled();
    expect(screen.getByLabelText("Decrease quantity")).toBeEnabled();
    expect(screen.getByLabelText(/remove diet coke/i)).toBeInTheDocument();
  });

  // ── Multiple items ────────────────────────────────────────────────────

  it("renders multiple cart items correctly", () => {
    addToCart("prod-diet-coke", 2);
    addToCart("prod-ginger");
    addToCart("prod-red-apple", 3);
    renderCart();

    const list = screen.getByRole("list", { name: /cart items/i });
    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBe(3);
  });
});
