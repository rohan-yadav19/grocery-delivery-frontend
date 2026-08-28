import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ProductCard } from "../../src/components/ProductCard";
import { ToastProvider } from "../../src/components/ToastContext";
import { useCartStore } from "../../src/stores/cartStore";
import type { Product } from "../../src/types";

const mockProduct: Product = {
  id: "prod-test-apple",
  name: "Test Apple",
  categoryId: "cat-fruits-vegetables",
  price: 5.99,
  unit: "1 kg",
  stock: 2,
  image: "/assets/products/test-apple.png",
  description: "A delicious test apple.",
  rating: { average: 4.5, count: 42 },
};

function renderProductCard(product: Product = mockProduct) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<ProductCard product={product} />} />
          <Route path="/cart" element={<div>Cart Destination Page</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe("ProductCard", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders the product name, price, and unit", () => {
    renderProductCard();

    expect(screen.getByText("Test Apple")).toBeInTheDocument();
    expect(screen.getByText("$5.99")).toBeInTheDocument();
    expect(screen.getByText("1 kg")).toBeInTheDocument();
  });

  it("renders the product image with correct alt text", () => {
    renderProductCard();

    const img = screen.getByAltText("Test Apple");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe("/assets/products/test-apple.png");
  });

  it("links to the correct product detail page", () => {
    renderProductCard();

    const links = screen.getAllByRole("link");
    const productLink = links.find((link) =>
      link.getAttribute("href")?.includes("/product/prod-test-apple"),
    );
    expect(productLink).toBeDefined();
  });

  it("adds the product to the cart when the add button is clicked", async () => {
    const user = userEvent.setup();
    renderProductCard();

    const addButton = screen.getByRole("button", { name: /add test apple to cart/i });
    await user.click(addButton);

    const quantity = useCartStore.getState().getQuantity("prod-test-apple");
    expect(quantity).toBe(1);
  });

  it("increments quantity on repeated add clicks", async () => {
    const user = userEvent.setup();
    renderProductCard();

    const addButton = screen.getByRole("button", { name: /test apple/i });
    await user.click(addButton);
    await user.click(addButton);

    const quantity = useCartStore.getState().getQuantity("prod-test-apple");
    expect(quantity).toBe(2);
  });

  it("provides accessible aria-label on the add to cart button", () => {
    renderProductCard();

    const addButton = screen.getByRole("button", {
      name: "Add Test Apple to cart",
    });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute("aria-label", "Add Test Apple to cart");
  });

  it("renders consistent semantic card structure", () => {
    const { container } = renderProductCard();

    const card = container.querySelector(".product-card");
    expect(card).toBeInTheDocument();
    expect(container.querySelector(".product-card__image")).toBeInTheDocument();
    expect(container.querySelector(".product-card__content")).toBeInTheDocument();
    expect(container.querySelector(".product-card__name")).toHaveTextContent("Test Apple");
    expect(container.querySelector(".product-card__unit")).toHaveTextContent("1 kg");
    expect(container.querySelector(".product-card__bottom")).toBeInTheDocument();
    expect(container.querySelector(".product-card__price")).toHaveTextContent("$5.99");
    expect(container.querySelector(".product-card__add-btn")).toBeInTheDocument();
  });

  it("changes add button to checkmark and updates aria-label immediately on click", async () => {
    const user = userEvent.setup();
    renderProductCard();

    const addButton = screen.getByRole("button", { name: /add test apple to cart/i });
    await user.click(addButton);

    expect(screen.getByRole("button", { name: "Test Apple added to cart" })).toBeInTheDocument();
  });

  it("displays success toast with product name, aria-live='polite', and View Cart action", async () => {
    const user = userEvent.setup();
    renderProductCard();

    const addButton = screen.getByRole("button", { name: /add test apple to cart/i });
    await user.click(addButton);

    const toast = screen.getByTestId("cart-toast");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(within(toast).getByText("Test Apple")).toBeInTheDocument();
    expect(within(toast).getByText(/added to cart/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view cart/i })).toHaveAttribute("href", "/cart");
  });

  it("clicking View Cart on the toast navigates to /cart and dismisses the toast", async () => {
    const user = userEvent.setup();
    renderProductCard();

    const addButton = screen.getByRole("button", { name: /add test apple to cart/i });
    await user.click(addButton);

    const viewCartLink = screen.getByRole("link", { name: /view cart/i });
    await user.click(viewCartLink);

    expect(screen.getByText("Cart Destination Page")).toBeInTheDocument();
    expect(screen.queryByTestId("cart-toast")).not.toBeInTheDocument();
  });

  it("dismisses toast automatically after timeout", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderProductCard();

    const addButton = screen.getByRole("button", { name: /add test apple to cart/i });
    await user.click(addButton);

    expect(screen.getByTestId("cart-toast")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByTestId("cart-toast")).not.toBeInTheDocument();
  });

  it("prevents adding beyond stock limit and displays warning feedback", async () => {
    const user = userEvent.setup();
    // Stock is 2
    renderProductCard(mockProduct);

    const addButton = screen.getByRole("button", { name: /test apple/i });
    await user.click(addButton); // qty: 1
    await user.click(addButton); // qty: 2 (max)
    expect(useCartStore.getState().getQuantity("prod-test-apple")).toBe(2);

    // 3rd click exceeds stock
    await user.click(addButton);
    expect(useCartStore.getState().getQuantity("prod-test-apple")).toBe(2);
    expect(screen.getByText(/maximum available stock/i)).toBeInTheDocument();
  });
});
