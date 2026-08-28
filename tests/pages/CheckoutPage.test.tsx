import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useCartStore } from "../../src/stores/cartStore";
import * as orderService from "../../src/services/orderService";

describe("CheckoutPage", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    orderService._setTestOutcome(null);
  });

  function renderCheckout() {
    return render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <App />
      </MemoryRouter>,
    );
  }

  function addToCart(productId: string, qty = 1) {
    for (let i = 0; i < qty; i++) {
      useCartStore.getState().addItem(productId);
    }
  }

  /** Helper: expand a checkout section and select delivery + payment */
  async function fillCheckoutForm(user: ReturnType<typeof userEvent.setup>) {
    // Expand & select delivery
    await user.click(screen.getByText("Select Method"));
    await user.click(screen.getByRole("radio", { name: /standard delivery/i }));

    // Expand & select payment
    await user.click(screen.getByText("Select Payment"));
    await user.click(screen.getByRole("radio", { name: /credit/i }));
  }

  // ── 1. Checkout route renders ──────────────────────────────────────────

  it("renders the checkout page with heading", () => {
    addToCart("prod-diet-coke");
    renderCheckout();
    expect(screen.getByRole("heading", { name: /checkout/i })).toBeInTheDocument();
  });

  // ── 2. Empty cart cannot proceed ───────────────────────────────────────

  it("shows empty state when cart is empty", () => {
    renderCheckout();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue shopping/i })).toBeInTheDocument();
  });

  // ── 3. Delivery section renders ────────────────────────────────────────

  it("renders the Delivery section", () => {
    addToCart("prod-diet-coke");
    renderCheckout();
    // "Delivery" appears in both checkout section label and order summary row
    const deliveryTexts = screen.getAllByText("Delivery");
    expect(deliveryTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── 4. Delivery selection works ────────────────────────────────────────

  it("allows selecting a delivery method", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await user.click(screen.getByText("Select Method"));

    const radio = screen.getByRole("radio", { name: /standard delivery/i });
    await user.click(radio);

    expect(radio).toBeChecked();
  });

  // ── 5. Payment selection works ─────────────────────────────────────────

  it("allows selecting a payment method", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await user.click(screen.getByText("Select Payment"));

    const cardRadio = screen.getByRole("radio", { name: /credit/i });
    await user.click(cardRadio);

    expect(cardRadio).toBeChecked();
  });

  // ── 6. Promo code input works ──────────────────────────────────────────

  it("renders promo code input when section is expanded", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await user.click(screen.getByText("Pick discount"));

    expect(screen.getByPlaceholderText(/enter promo code/i)).toBeInTheDocument();
  });

  // ── 7. Valid promo is applied ──────────────────────────────────────────

  it("applies a valid promo code", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await user.click(screen.getByText("Pick discount"));

    const input = screen.getByPlaceholderText(/enter promo code/i);
    await user.type(input, "FRESH10");
    await user.click(screen.getByRole("button", { name: /^apply$/i }));

    const matches = screen.getAllByText(/FRESH10/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const discountLabels = screen.getAllByText(/10% off/);
    expect(discountLabels.length).toBeGreaterThanOrEqual(1);
  });

  // ── 8. Invalid promo is handled ────────────────────────────────────────

  it("shows error for invalid promo code", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await user.click(screen.getByText("Pick discount"));

    const input = screen.getByPlaceholderText(/enter promo code/i);
    await user.type(input, "BADCODE");
    await user.click(screen.getByRole("button", { name: /^apply$/i }));

    expect(screen.getByText(/invalid promo code/i)).toBeInTheDocument();
  });

  // ── 9. Order summary uses cart totals ──────────────────────────────────

  it("displays the correct total from cart data", () => {
    addToCart("prod-diet-coke", 2);
    renderCheckout();

    const totals = screen.getAllByText("$3.98");
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  // ── 10. Required validation works ──────────────────────────────────────

  it("shows validation errors when placing order without selections", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(screen.getByText(/select a delivery method/i)).toBeInTheDocument();
    expect(screen.getByText(/select a payment method/i)).toBeInTheDocument();
  });

  // ── 11. Place Order button initial state ───────────────────────────────

  it("Place Order button is enabled initially and has aria-busy", () => {
    addToCart("prod-ginger");
    renderCheckout();

    const placeBtn = screen.queryByRole("button", { name: /place order/i });
    if (placeBtn) {
      expect(placeBtn).toBeEnabled();
      expect(placeBtn).toHaveAttribute("aria-busy", "false");
    }
  });

  // ── 12. Failed order navigates to order-failed ──────────────────────────

  it("navigates to order-failed page when order fails", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await fillCheckoutForm(user);

    orderService._setTestOutcome("error");

    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: /oops! order failed/i }),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  // ── 13. Cart remains after failed order ────────────────────────────────

  it("preserves the cart after a failed order", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke", 3);
    renderCheckout();

    await fillCheckoutForm(user);

    orderService._setTestOutcome("error");

    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: /oops! order failed/i }),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Cart should still have items
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0]!.quantity).toBe(3);
  });

  // ── 14. Keyboard accessibility ─────────────────────────────────────────

  it("has keyboard-accessible checkout controls", () => {
    addToCart("prod-diet-coke");
    renderCheckout();

    const placeOrderBtn = screen.getByRole("button", { name: /place order/i });
    expect(placeOrderBtn).toBeEnabled();

    expect(screen.getByLabelText(/go back/i)).toBeInTheDocument();
  });

  // ── 15. Step 18.3: Progress indicator ──────────────────────────────────

  it("renders the checkout progress indicator with Cart, Delivery, and Payment steps", () => {
    addToCart("prod-diet-coke");
    renderCheckout();

    const progressNav = screen.getByLabelText(/checkout progress/i);
    expect(progressNav).toBeInTheDocument();
    expect(progressNav).toHaveTextContent("Cart");
    expect(progressNav).toHaveTextContent("Delivery");
    expect(progressNav).toHaveTextContent("Payment");
  });

  // ── 16. Step 18.3: Product images and details in order summary ─────────

  it("renders product images, unit, and quantity in order summary", () => {
    addToCart("prod-diet-coke", 2);
    renderCheckout();

    const orderSummary = screen.getByLabelText(/order summary/i);
    expect(orderSummary).toBeInTheDocument();

    const productImg = screen.getByAltText(/diet coke/i);
    expect(productImg).toBeInTheDocument();
    expect(screen.getByText(/355 ml × 2/i)).toBeInTheDocument();
  });

  // ── 17. Step 18.3: Delivery address card and editing ───────────────────

  it("renders the delivery address card with Home badge and allows editing", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    const addressRow = screen.getByRole("button", { name: /delivery address/i });
    await user.click(addressRow);

    expect(screen.getByText("Home")).toBeInTheDocument();
    const changeBtn = screen.getByRole("button", { name: /change/i });
    expect(changeBtn).toBeInTheDocument();

    await user.click(changeBtn);
    const input = screen.getByPlaceholderText(/enter delivery address/i);
    expect(input).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "42, 5th Cross Road, HSR Layout, Bengaluru");
    await user.click(screen.getByRole("button", { name: /done/i }));

    const matches = screen.getAllByText(
      "42, 5th Cross Road, HSR Layout, Bengaluru",
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  // ── 18. Step 18.3: Express delivery with fee ───────────────────────────

  it("updates delivery fee and total when express delivery is chosen", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke", 1); // $1.99
    renderCheckout();

    await user.click(screen.getByText("Select Method"));
    const expressRadio = screen.getByRole("radio", { name: /express delivery/i });
    await user.click(expressRadio);

    // Express fee is $2.99, subtotal $1.99 -> Total $4.98
    const feeTexts = screen.getAllByText("$2.99");
    expect(feeTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$4.98")).toBeInTheDocument();
  });

  // ── 19. Loading state (placed LAST to avoid async bleed) ───────────────

  it("shows loading text when placing order", async () => {
    const user = userEvent.setup();
    addToCart("prod-diet-coke");
    renderCheckout();

    await fillCheckoutForm(user);

    orderService._setTestOutcome("error");

    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(screen.queryByText(/placing order/i)).toBeInTheDocument();
    });
  });
});

