import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import { BottomNav } from "../../src/components/BottomNav";
import { useCartStore } from "../../src/stores/cartStore";

function renderBottomNav(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <BottomNav />
    </MemoryRouter>,
  );
}

describe("BottomNav", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("renders all 5 navigation items", () => {
    renderBottomNav();

    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Favourite")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("highlights the active nav item based on current route", () => {
    renderBottomNav("/explore");

    const exploreLink = screen.getByRole("link", { name: /explore/i });
    expect(exploreLink.className).toContain("text-[var(--color-brand)]");
  });

  it("shows a cart badge when items are in the cart", () => {
    useCartStore.setState({
      items: [
        { productId: "prod-1", quantity: 2 },
        { productId: "prod-2", quantity: 1 },
      ],
    });

    renderBottomNav();

    const badge = screen.getByLabelText("2 items in cart");
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe("2");
  });

  it("does not show a cart badge when the cart is empty", () => {
    renderBottomNav();

    expect(screen.queryByLabelText(/items in cart/i)).not.toBeInTheDocument();
  });

  it("renders accessible navigation landmark", () => {
    renderBottomNav();

    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
  });
});
