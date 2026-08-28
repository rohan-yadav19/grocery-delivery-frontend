import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useCartStore } from "../../src/stores/cartStore";
import { useFavoriteStore } from "../../src/stores/favoriteStore";

/**
 * Product Detail page tests.
 *
 * Uses "prod-red-apple" (Red Apple, Fruits & Vegetables) as the test fixture.
 */
describe("ProductDetailPage", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useFavoriteStore.getState().clearFavorites();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders the product name and price for a valid product", () => {
    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /red apple/i })).toBeInTheDocument();
    expect(screen.getByText("$5.99")).toBeInTheDocument();
  });

  it("renders the product description in the accordion", () => {
    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    // "Product Detail" accordion starts expanded
    expect(screen.getByText(/crisp, juicy/i)).toBeInTheDocument();
  });

  // ── Invalid product ───────────────────────────────────────────────────────

  it("displays error state for an invalid product ID", () => {
    render(
      <MemoryRouter initialEntries={["/product/prod-nonexistent"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Product Not Found")).toBeInTheDocument();
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument();
  });

  // ── Quantity ──────────────────────────────────────────────────────────────

  it("starts with quantity 1", () => {
    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    // The QuantityStepper shows the current value
    const quantityDisplay = screen.getByText("1");
    expect(quantityDisplay).toBeInTheDocument();
  });

  it("can increase quantity", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    const incrementBtn = screen.getByLabelText("Increase quantity");
    await user.click(incrementBtn);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("cannot decrease quantity below 1", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    const decrementBtn = screen.getByLabelText("Decrease quantity");
    expect(decrementBtn).toBeDisabled();

    await user.click(decrementBtn);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  // ── Favorites ─────────────────────────────────────────────────────────────

  it("toggles favorite state when heart button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    const favBtn = screen.getByLabelText(/add red apple to favorites/i);
    expect(favBtn).toHaveAttribute("aria-pressed", "false");

    await user.click(favBtn);

    expect(useFavoriteStore.getState().isFavorite("prod-red-apple")).toBe(true);
    // After toggling, label changes to "Remove"
    expect(screen.getByLabelText(/remove red apple from favorites/i)).toBeInTheDocument();
  });

  // ── Cart ──────────────────────────────────────────────────────────────────

  it("adds the selected quantity to cart when 'Add To Basket' is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    // Increase quantity to 3
    const incrementBtn = screen.getByLabelText("Increase quantity");
    await user.click(incrementBtn);
    await user.click(incrementBtn);

    // Click Add To Basket (mobile sticky button)
    const addButtons = screen.getAllByRole("button", { name: /add to basket/i });
    await user.click(addButtons[0]!);

    const cart = useCartStore.getState();
    const item = cart.items.find((i) => i.productId === "prod-red-apple");
    expect(item).toBeDefined();
    expect(item!.quantity).toBe(3);
  });

  // ── Accordions ────────────────────────────────────────────────────────────

  it("collapses and expands the Product Detail accordion", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    // Product Detail accordion starts expanded
    const detailToggle = screen.getByRole("button", { name: /product detail/i });
    expect(detailToggle).toHaveAttribute("aria-expanded", "true");

    // Collapse it
    await user.click(detailToggle);
    expect(detailToggle).toHaveAttribute("aria-expanded", "false");

    // Expand again
    await user.click(detailToggle);
    expect(detailToggle).toHaveAttribute("aria-expanded", "true");
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  it("renders a back button", () => {
    render(
      <MemoryRouter initialEntries={["/product/prod-red-apple"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Go back")).toBeInTheDocument();
  });
});
