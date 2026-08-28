import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useFavoriteStore } from "../../src/stores/favoriteStore";
import { useCartStore } from "../../src/stores/cartStore";

describe("FavoritesPage", () => {
  beforeEach(() => {
    useFavoriteStore.getState().clearFavorites();
    useCartStore.getState().clearCart();
  });

  function renderFavorites() {
    return render(
      <MemoryRouter initialEntries={["/favorites"]}>
        <App />
      </MemoryRouter>,
    );
  }

  function addFavorite(productId: string) {
    if (!useFavoriteStore.getState().isFavorite(productId)) {
      useFavoriteStore.getState().toggleFavorite(productId);
    }
  }

  // ── 1. Page & Heading Rendering ───────────────────────────────────────────

  it("renders the favourites page with heading", () => {
    renderFavorites();
    expect(
      screen.getByRole("heading", { level: 1, name: /favourites/i }),
    ).toBeInTheDocument();
  });

  // ── 2. Empty State ────────────────────────────────────────────────────────

  it("shows empty state when no favourites are saved", () => {
    renderFavorites();
    expect(screen.getByText(/no favourites yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /explore products/i }),
    ).toBeInTheDocument();
  });

  it("navigates to explore page when clicking explore button in empty state", async () => {
    const user = userEvent.setup();
    renderFavorites();

    await user.click(screen.getByRole("button", { name: /explore products/i }));
    expect(
      screen.getByRole("heading", { level: 1, name: /find products/i }),
    ).toBeInTheDocument();
  });

  // ── 3. Favourites Rendering ───────────────────────────────────────────────

  it("renders saved favourite products with name, unit, and price", () => {
    addFavorite("prod-diet-coke");
    addFavorite("prod-organic-bananas");
    renderFavorites();

    expect(screen.getByText("Diet Coke")).toBeInTheDocument();
    expect(screen.getByText("355 ml")).toBeInTheDocument();
    expect(screen.getByText("$1.99")).toBeInTheDocument();

    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(screen.getByText("1 dozen")).toBeInTheDocument();
    expect(screen.getByText("$4.99")).toBeInTheDocument();
  });

  // ── 4. Favourite Removal / Toggle ─────────────────────────────────────────

  it("removes a product from favourites when heart button is clicked", async () => {
    const user = userEvent.setup();
    addFavorite("prod-diet-coke");
    addFavorite("prod-organic-bananas");
    renderFavorites();

    expect(screen.getByText("Diet Coke")).toBeInTheDocument();

    const removeBtn = screen.getByLabelText("Remove Diet Coke from favourites");
    await user.click(removeBtn);

    expect(screen.queryByText("Diet Coke")).not.toBeInTheDocument();
    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(useFavoriteStore.getState().isFavorite("prod-diet-coke")).toBe(false);
  });

  it("shows empty state after removing the last favourite item", async () => {
    const user = userEvent.setup();
    addFavorite("prod-diet-coke");
    renderFavorites();

    const removeBtn = screen.getByLabelText("Remove Diet Coke from favourites");
    await user.click(removeBtn);

    expect(screen.getByText(/no favourites yet/i)).toBeInTheDocument();
  });

  // ── 5. Add All To Cart ────────────────────────────────────────────────────

  it("adds all favourite products to the cart store when Add All To Cart is clicked", async () => {
    const user = userEvent.setup();
    addFavorite("prod-diet-coke");
    addFavorite("prod-organic-bananas");
    renderFavorites();

    const addAllBtn = screen.getByRole("button", {
      name: /add all favourites to cart/i,
    });
    await user.click(addAllBtn);

    expect(useCartStore.getState().getQuantity("prod-diet-coke")).toBe(1);
    expect(useCartStore.getState().getQuantity("prod-organic-bananas")).toBe(1);
  });

  it("navigates to cart page after clicking Add All To Cart", async () => {
    const user = userEvent.setup();
    addFavorite("prod-diet-coke");
    renderFavorites();

    const addAllBtn = screen.getByRole("button", {
      name: /add all favourites to cart/i,
    });
    await user.click(addAllBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: /my cart/i }),
      ).toBeInTheDocument();
    });
  });

  // ── 6. Navigation & Links ─────────────────────────────────────────────────

  it("links to product detail page from favourite item", () => {
    addFavorite("prod-organic-bananas");
    renderFavorites();

    const detailLinks = screen.getAllByRole("link", {
      name: /organic bananas/i,
    });
    expect(detailLinks.length).toBeGreaterThanOrEqual(1);
    expect(detailLinks[0]).toHaveAttribute("href", "/product/prod-organic-bananas");
  });

  // ── 7. Accessibility ──────────────────────────────────────────────────────

  it("provides accessible list and item roles", () => {
    addFavorite("prod-diet-coke");
    addFavorite("prod-organic-bananas");
    renderFavorites();

    const list = screen.getByRole("list", { name: /favourite products/i });
    expect(list).toBeInTheDocument();

    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBe(2);
  });

  // ── 8. Resilient catalogue filtering ──────────────────────────────────────

  it("cleans up invalid / nonexistent product IDs automatically", () => {
    useFavoriteStore.setState({
      favoriteIds: ["prod-diet-coke", "nonexistent-product-id"],
    });

    renderFavorites();

    expect(screen.getByText("Diet Coke")).toBeInTheDocument();
    expect(screen.queryByText("nonexistent-product-id")).not.toBeInTheDocument();
  });
});
