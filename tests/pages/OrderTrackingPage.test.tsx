import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import App from "../../src/App";
import OrderTrackingPage from "../../src/pages/OrderTrackingPage";
import { useOrderStore, type TrackedOrder } from "../../src/stores/orderStore";
import { useSessionStore } from "../../src/stores/sessionStore";

const MOCK_ORDER: TrackedOrder = {
  orderId: "ORD-98765",
  items: [
    {
      id: "prod-1",
      name: "Organic Bananas",
      price: 4.99,
      quantity: 2,
      image: "/assets/products/organic-bananas.png",
      unit: "7pcs, ~1kg",
    },
    {
      id: "prod-2",
      name: "Red Apple",
      price: 3.49,
      quantity: 1,
      image: "/assets/products/red-apple.png",
      unit: "1kg",
    },
  ],
  subtotal: 13.47,
  deliveryFee: 2.99,
  discount: 1.35,
  total: 15.11,
  deliveryMethod: "Express Delivery",
  paymentMethod: "Credit Card",
  deliveryAddress: "742 Evergreen Terrace, Springfield",
  promoCode: "FRESH10",
  status: "confirmed",
  estimatedDelivery: "25–35 min",
  createdAt: "2026-08-28T10:00:00.000Z",
};

describe("OrderTrackingPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useSessionStore.setState({ isAuthenticated: true, hasSeenOnboarding: true });
    useOrderStore.getState().clearActiveOrder();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders the tracking page header and order ID", () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /#ORD-98765/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/25–35 min/i)).toBeInTheDocument();
  });

  it("renders order items with names, quantities, and prices", () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(screen.getByText(/Qty: 2/i)).toBeInTheDocument();
    expect(screen.getByText("Red Apple")).toBeInTheDocument();
    expect(screen.getByText(/Qty: 1/i)).toBeInTheDocument();
  });

  it("renders delivery address, method, and total price breakdown", () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("742 Evergreen Terrace, Springfield"),
    ).toBeInTheDocument();
    expect(screen.getByText("Express Delivery")).toBeInTheDocument();
    expect(screen.getByText("$13.47")).toBeInTheDocument(); // subtotal
    expect(screen.getByText("$2.99")).toBeInTheDocument(); // delivery fee
    expect(screen.getByText("-$1.35")).toBeInTheDocument(); // discount
    expect(screen.getByText("$15.11")).toBeInTheDocument(); // total
  });

  it("renders the initial order status as confirmed", () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/order confirmed/i).length).toBeGreaterThan(0);
  });

  it("simulates tracking progress progression through steps over time", async () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    // Initial status: confirmed
    expect(useOrderStore.getState().activeOrder?.status).toBe("confirmed");

    // Advance 3.5s -> transitions to preparing
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(useOrderStore.getState().activeOrder?.status).toBe("preparing");

    // Advance another 3.8s -> transitions to out_for_delivery
    act(() => {
      vi.advanceTimersByTime(3800);
    });
    expect(useOrderStore.getState().activeOrder?.status).toBe("out_for_delivery");

    // Advance another 3.8s -> transitions to delivered
    act(() => {
      vi.advanceTimersByTime(3800);
    });
    expect(useOrderStore.getState().activeOrder?.status).toBe("delivered");
  });

  it("navigates Back to Home when clicking the Back to Home button", async () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <App />
      </MemoryRouter>,
    );

    const backHomeBtn = screen.getByRole("button", { name: /back to home/i });
    await user.click(backHomeBtn);

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /exclusive offer/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders Order Not Found empty state when no order exists", () => {
    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /order not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /back to home/i }),
    ).toBeInTheDocument();
  });

  it("preserves tracking order across simulated browser refresh via orderStore persistence", () => {
    // Save order in store
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);

    // Re-render from clean route without location.state (simulates refresh)
    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /#ORD-98765/i }),
    ).toBeInTheDocument();
  });

  it("provides accessible semantic structure and ARIA attributes", () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    // Timeline list role
    expect(
      screen.getByRole("list", { name: /order status timeline/i }),
    ).toBeInTheDocument();

    // Items list role
    expect(
      screen.getByRole("list", { name: /ordered products/i }),
    ).toBeInTheDocument();

    // Back to home button
    expect(
      screen.getByRole("button", { name: /back to home/i }),
    ).toBeInTheDocument();
  });

  // ── Step 18.4 Additions ───────────────────────────────────────────────

  it("copies the order ID to clipboard when clicking Copy button", async () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      configurable: true,
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    const copyBtn = screen.getByRole("button", { name: /copy order id/i });
    expect(copyBtn).toBeInTheDocument();

    await user.click(copyBtn);
    expect(writeTextSpy).toHaveBeenCalledWith("ORD-98765");
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
  });

  it("renders all 5 tracking steps and identifies current active step", () => {
    useOrderStore.getState().setActiveOrder({
      ...MOCK_ORDER,
      status: "preparing",
    });

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <OrderTrackingPage />
      </MemoryRouter>,
    );

    const timeline = screen.getByRole("list", { name: /order status timeline/i });
    expect(timeline).toBeInTheDocument();

    expect(screen.getByText("Order Placed")).toBeInTheDocument();
    expect(screen.getAllByText("Order Confirmed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Preparing Order").length).toBeGreaterThan(0);
    expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();

    // In Progress badge for current step
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
  });

  it("renders product thumbnails and navigation to explore page", async () => {
    useOrderStore.getState().setActiveOrder(MOCK_ORDER);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <MemoryRouter initialEntries={["/order-tracking"]}>
        <App />
      </MemoryRouter>,
    );

    // Product images
    expect(screen.getByAltText("Organic Bananas")).toBeInTheDocument();
    expect(screen.getByAltText("Red Apple")).toBeInTheDocument();

    // Continue shopping navigation
    const continueBtn = screen.getByRole("button", {
      name: /continue shopping/i,
    });
    expect(continueBtn).toBeInTheDocument();

    await user.click(continueBtn);
    expect(
      await screen.findByRole("heading", { level: 1, name: /find products/i }),
    ).toBeInTheDocument();
  });
});

