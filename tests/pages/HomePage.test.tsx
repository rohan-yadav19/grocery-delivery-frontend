import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import App from "../../src/App";
import HomePage from "../../src/pages/HomePage";
import { useCartStore } from "../../src/stores/cartStore";
import { useSessionStore } from "../../src/stores/sessionStore";

describe("HomePage Professional UI & Carousel", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useCartStore.getState().clearCart();
    useSessionStore.setState({
      isAuthenticated: true,
      hasSeenOnboarding: true,
      zone: "Bengaluru",
      area: "Koramangala",
      deliveryAddress: "Koramangala, Bengaluru, Karnataka, India",
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders the Indian Bengaluru location and never Dhaka", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText("Koramangala, Bengaluru").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Dhaka/i)).not.toBeInTheDocument();
  });

  it("clicking location selector navigates to /select-location", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const locationBtns = screen.getAllByRole("button", {
      name: /change location/i,
    });
    expect(locationBtns.length).toBeGreaterThan(0);
    await user.click(locationBtns[0]!);

    expect(
      await screen.findByRole("heading", { name: /select your location/i }),
    ).toBeInTheDocument();
  });

  it("renders the promotional carousel banner with real asset path", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    // Verify banner carousel container
    const carousel = screen.getByRole("region", {
      name: /promotional banner carousel/i,
    });
    expect(carousel).toBeInTheDocument();

    // Verify real asset is loaded in slide 1
    const bannerImg = container.querySelector(
      'img[src="/assets/banners/fresh-vegetables-banner.png"]',
    );
    expect(bannerImg).toBeInTheDocument();
  });

  it("renders carousel pagination dots and allows clicking to change slides", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const dots = screen.getAllByRole("tab", { name: /go to slide/i });
    expect(dots).toHaveLength(3);

    // Initial active slide is 1
    expect(dots[0]).toHaveAttribute("aria-selected", "true");

    // Click dot 2
    expect(dots[1]).toBeDefined();
    await user.click(dots[1]!);
    expect(dots[1]).toHaveAttribute("aria-selected", "true");
    expect(dots[0]).toHaveAttribute("aria-selected", "false");

    // Click dot 3
    expect(dots[2]).toBeDefined();
    await user.click(dots[2]!);
    expect(dots[2]).toHaveAttribute("aria-selected", "true");
  });

  it("automatically advances carousel slides via autoplay", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const dots = screen.getAllByRole("tab", { name: /go to slide/i });
    expect(dots[0]).toHaveAttribute("aria-selected", "true");

    // Advance 3.8s
    act(() => {
      vi.advanceTimersByTime(3800);
    });
    expect(dots[1]).toHaveAttribute("aria-selected", "true");

    // Advance another 3.8s
    act(() => {
      vi.advanceTimersByTime(3800);
    });
    expect(dots[2]).toHaveAttribute("aria-selected", "true");

    // Continuous loop back to slide 1
    act(() => {
      vi.advanceTimersByTime(3800);
    });
    expect(dots[0]).toHaveAttribute("aria-selected", "true");
  });

  it("renders product sections, product cards, and images", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    // Section headings
    expect(
      screen.getByRole("heading", { level: 2, name: /exclusive offer/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /best selling/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /groceries/i }),
    ).toBeInTheDocument();

    // Products render
    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(screen.getByText("Red Apple")).toBeInTheDocument();
  });

  it("allows adding a product to cart from Home product card", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const addBananaBtn = screen.getByRole("button", {
      name: /add organic bananas to cart/i,
    });
    await user.click(addBananaBtn);

    const cartItems = useCartStore.getState().items;
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]?.productId).toBe("prod-organic-bananas");
  });

  it("renders the mobile bottom navigation in the layout", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const navs = screen.getAllByRole("navigation", {
      name: /main navigation/i,
    });
    expect(navs.length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^shop$/i }).length).toBeGreaterThan(0);
  });

  it("renders product sections using ProductCard with correct buttons and prices", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const bananaCard = screen.getByTestId("product-card-prod-organic-bananas");
    expect(bananaCard).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add organic bananas to cart/i })).toBeInTheDocument();
    expect(within(bananaCard).getByText("$4.99")).toBeInTheDocument();
  });

  // ── Step 18.5 Additions ───────────────────────────────────────────────

  it("renders the Groceries section with category filter chips (Pulses, Rice, Cooking Oil & Ghee) and accessible ARIA attributes", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const filterGroup = screen.getByRole("group", {
      name: /grocery category filters/i,
    });
    expect(filterGroup).toBeInTheDocument();

    const pulsesChip = screen.getByRole("button", {
      name: /filter by pulses/i,
    });
    const riceChip = screen.getByRole("button", {
      name: /filter by rice/i,
    });
    const oilChip = screen.getByRole("button", {
      name: /filter by cooking oil & ghee/i,
    });

    expect(pulsesChip).toBeInTheDocument();
    expect(riceChip).toBeInTheDocument();
    expect(oilChip).toBeInTheDocument();
    expect(pulsesChip).toHaveAttribute("aria-pressed", "false");
    expect(riceChip).toHaveAttribute("aria-pressed", "false");
    expect(oilChip).toHaveAttribute("aria-pressed", "false");
  });

  it("filters grocery products to Pulses when Pulses chip is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const pulsesChip = screen.getByRole("button", {
      name: /filter by pulses/i,
    });
    await user.click(pulsesChip);

    expect(pulsesChip).toHaveAttribute("aria-pressed", "true");
    const grocerySection = screen.getByRole("region", { name: /groceries/i });
    expect(within(grocerySection).getByText("Natural Pulses")).toBeInTheDocument();
    expect(
      within(grocerySection).getByTestId("product-card-prod-pulses"),
    ).toBeInTheDocument();
  });

  it("filters grocery products to Rice when Rice chip is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const riceChip = screen.getByRole("button", {
      name: /filter by rice/i,
    });
    await user.click(riceChip);

    expect(riceChip).toHaveAttribute("aria-pressed", "true");
    const grocerySection = screen.getByRole("region", { name: /groceries/i });
    expect(
      within(grocerySection).getByText("Premium Basmati Rice"),
    ).toBeInTheDocument();
    expect(
      within(grocerySection).getByTestId("product-card-prod-rice"),
    ).toBeInTheDocument();
  });

  it("filters grocery products to Cooking Oil & Ghee when Cooking Oil chip is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const oilChip = screen.getByRole("button", {
      name: /filter by cooking oil & ghee/i,
    });
    await user.click(oilChip);

    expect(oilChip).toHaveAttribute("aria-pressed", "true");
    const grocerySection = screen.getByRole("region", { name: /groceries/i });
    expect(within(grocerySection).getByText("Pure Canola Oil")).toBeInTheDocument();
    expect(
      within(grocerySection).getByTestId("product-card-prod-canola-oil"),
    ).toBeInTheDocument();
  });

  it("curates sections with approximately 8 products each", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const exclusiveSection = screen.getByRole("region", {
      name: /exclusive offer/i,
    });
    const bestSellingSection = screen.getByRole("region", {
      name: /best selling/i,
    });
    const grocerySection = screen.getByRole("region", {
      name: /groceries/i,
    });

    const exclusiveCards = within(exclusiveSection).getAllByRole("article");
    const bestSellingCards = within(bestSellingSection).getAllByRole("article");
    const groceryCards = within(grocerySection).getAllByRole("article");

    expect(exclusiveCards.length).toBe(8);
    expect(bestSellingCards.length).toBe(8);
    expect(groceryCards.length).toBe(8);
  });

  it("toggles off the filter when the active chip is clicked again", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const pulsesChip = screen.getByRole("button", {
      name: /filter by pulses/i,
    });
    await user.click(pulsesChip);
    expect(pulsesChip).toHaveAttribute("aria-pressed", "true");

    // Click again to toggle off
    await user.click(pulsesChip);
    expect(pulsesChip).toHaveAttribute("aria-pressed", "false");
    const grocerySection = screen.getByRole("region", { name: /groceries/i });
    expect(within(grocerySection).getByText("Beef Bone")).toBeInTheDocument();
  });

  it("renders consistent ProductCard structure with real images across all sections", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );

    const cards = container.querySelectorAll(".product-card");
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card.querySelector(".product-card__image")).toBeInTheDocument();
      expect(card.querySelector(".product-card__img")).toBeInTheDocument();
      expect(card.querySelector(".product-card__name")).toBeInTheDocument();
      expect(card.querySelector(".product-card__unit")).toBeInTheDocument();
      expect(card.querySelector(".product-card__price")).toBeInTheDocument();
      expect(card.querySelector(".product-card__add-btn")).toBeInTheDocument();
    });
  });
});

