import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useCartStore } from "../../src/stores/cartStore";

describe("OrderSuccessPage", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  function renderRoute(path: string, state?: Record<string, unknown>) {
    return render(
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <App />
      </MemoryRouter>,
    );
  }

  // ── 1. Success screen renders ──────────────────────────────────────────

  it("renders the success heading", () => {
    renderRoute("/order-success", { orderId: "ORD-123" });
    expect(
      screen.getByRole("heading", { name: /your order has been accepted/i }),
    ).toBeInTheDocument();
  });

  // ── 2. Shows supporting message ────────────────────────────────────────

  it("shows the supporting message", () => {
    renderRoute("/order-success");
    expect(
      screen.getByText(/your items have been placed/i),
    ).toBeInTheDocument();
  });

  // ── 3. Shows order ID when provided ───────────────────────────────────

  it("displays the order ID when provided", () => {
    renderRoute("/order-success", { orderId: "ORD-ABC-42" });
    expect(screen.getByText(/ORD-ABC-42/)).toBeInTheDocument();
  });

  // ── 4. Track Order CTA present & navigates to /order-tracking ───────────

  it("renders Track Order button and navigates to /order-tracking", async () => {
    const user = userEvent.setup();
    renderRoute("/order-success", { orderId: "ORD-999" });

    const trackBtn = screen.getByRole("button", { name: /track order/i });
    expect(trackBtn).toBeInTheDocument();

    await user.click(trackBtn);

    expect(
      await screen.findByRole("heading", { name: /#ORD-999/i }),
    ).toBeInTheDocument();
  });

  // ── 5. Back to home link present ───────────────────────────────────────

  it("renders Back to home link", () => {
    renderRoute("/order-success");
    expect(
      screen.getByRole("button", { name: /back to home/i }),
    ).toBeInTheDocument();
  });

  // ── 6. Keyboard accessible ─────────────────────────────────────────────

  it("has keyboard-accessible action buttons", () => {
    renderRoute("/order-success");
    const trackBtn = screen.getByRole("button", { name: /track order/i });
    const backBtn = screen.getByRole("button", { name: /back to home/i });
    expect(trackBtn).toBeEnabled();
    expect(backBtn).toBeEnabled();
  });

  // ── 7. Refreshing does not crash ──────────────────────────────────────

  it("renders without state (simulates refresh)", () => {
    renderRoute("/order-success");
    expect(
      screen.getByRole("heading", { name: /your order has been accepted/i }),
    ).toBeInTheDocument();
  });

  // ── 8. Status region for screen readers ────────────────────────────────

  it("has an accessible status role", () => {
    renderRoute("/order-success");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("OrderFailedPage", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  function renderRoute(path: string, state?: Record<string, unknown>) {
    return render(
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <App />
      </MemoryRouter>,
    );
  }

  // ── 1. Failure heading renders ─────────────────────────────────────────

  it("renders the failure heading", () => {
    renderRoute("/order-failed", { errorMessage: "Payment declined" });
    expect(
      screen.getByRole("heading", { name: /oops! order failed/i }),
    ).toBeInTheDocument();
  });

  // ── 2. Shows error message ─────────────────────────────────────────────

  it("shows the error message from state", () => {
    renderRoute("/order-failed", { errorMessage: "Payment declined" });
    expect(screen.getByText("Payment declined")).toBeInTheDocument();
  });

  // ── 3. Shows default message without state ─────────────────────────────

  it("shows default error message without state", () => {
    renderRoute("/order-failed");
    expect(
      screen.getByText(/something went terribly wrong/i),
    ).toBeInTheDocument();
  });

  // ── 4. Try Again CTA present ──────────────────────────────────────────

  it("renders Please Try Again button", () => {
    renderRoute("/order-failed");
    expect(
      screen.getByRole("button", { name: /please try again/i }),
    ).toBeInTheDocument();
  });

  // ── 5. Back to home link present ──────────────────────────────────────

  it("renders Back to home link", () => {
    renderRoute("/order-failed");
    expect(
      screen.getByRole("button", { name: /back to home/i }),
    ).toBeInTheDocument();
  });

  // ── 6. Cart remains intact after failure ──────────────────────────────

  it("preserves cart items on the failure page", () => {
    useCartStore.getState().addItem("prod-diet-coke");
    useCartStore.getState().addItem("prod-diet-coke");
    renderRoute("/order-failed", { errorMessage: "Network error" });

    // Cart is not cleared
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0]!.quantity).toBe(2);
  });

  // ── 7. Keyboard accessible ─────────────────────────────────────────────

  it("has keyboard-accessible action buttons", () => {
    renderRoute("/order-failed");
    const tryBtn = screen.getByRole("button", { name: /please try again/i });
    const backBtn = screen.getByRole("button", { name: /back to home/i });
    expect(tryBtn).toBeEnabled();
    expect(backBtn).toBeEnabled();
  });

  // ── 8. Refreshing does not crash ──────────────────────────────────────

  it("renders without state (simulates refresh)", () => {
    renderRoute("/order-failed");
    expect(
      screen.getByRole("heading", { name: /oops! order failed/i }),
    ).toBeInTheDocument();
  });

  // ── 9. Alert region for screen readers ─────────────────────────────────

  it("has an accessible alert role", () => {
    renderRoute("/order-failed");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
