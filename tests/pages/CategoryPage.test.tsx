import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../../src/App";
import { useCartStore } from "../../src/stores/cartStore";

describe("CategoryPage", () => {
  beforeEach(() => {
    // Reset cart state between tests
    useCartStore.getState().clearCart();
  });

  it("displays the category name in the header for a valid category", () => {
    render(
      <MemoryRouter initialEntries={["/category/cat-beverages"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /beverages/i }),
    ).toBeInTheDocument();
  });

  it("displays only products belonging to the selected category", () => {
    render(
      <MemoryRouter initialEntries={["/category/cat-beverages"]}>
        <App />
      </MemoryRouter>,
    );

    // Beverages products should be present
    expect(screen.getByText("Diet Coke")).toBeInTheDocument();
    expect(screen.getByText("Sprite Can")).toBeInTheDocument();
    expect(screen.getByText("Coca Cola Can")).toBeInTheDocument();

    // Products from other categories should NOT be present
    expect(screen.queryByText("Organic Bananas")).not.toBeInTheDocument();
    expect(screen.queryByText("Beef Bone")).not.toBeInTheDocument();
  });

  it("displays an error state for an invalid category ID", () => {
    render(
      <MemoryRouter initialEntries={["/category/cat-nonexistent"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Category Not Found")).toBeInTheDocument();
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument();
  });

  it("provides a 'Browse Categories' action on invalid category", () => {
    render(
      <MemoryRouter initialEntries={["/category/cat-nonexistent"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /browse categories/i }),
    ).toBeInTheDocument();
  });

  it("adds a product to cart when the add button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/category/cat-beverages"]}>
        <App />
      </MemoryRouter>,
    );

    const addButton = screen.getByLabelText("Add Diet Coke to cart");
    await user.click(addButton);

    const cart = useCartStore.getState();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0]!.productId).toBe("prod-diet-coke");
  });

  it("renders a back button", () => {
    render(
      <MemoryRouter initialEntries={["/category/cat-beverages"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Go back")).toBeInTheDocument();
  });

  it("renders the product grid with list semantics", () => {
    render(
      <MemoryRouter initialEntries={["/category/cat-beverages"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("list", { name: /beverages products/i }),
    ).toBeInTheDocument();
  });

  it("renders the filter button", () => {
    render(
      <MemoryRouter initialEntries={["/category/cat-beverages"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Filter products")).toBeInTheDocument();
  });
});
