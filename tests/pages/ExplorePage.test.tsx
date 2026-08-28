import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import App from "../../src/App";

describe("ExplorePage", () => {
  it("renders the 'Find Products' heading", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /find products/i }),
    ).toBeInTheDocument();
  });

  it("renders all categories from the data", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <App />
      </MemoryRouter>,
    );

    // Check a subset of known categories
    expect(screen.getByText("Fresh Fruits & Vegetable")).toBeInTheDocument();
    expect(screen.getByText("Beverages")).toBeInTheDocument();
    expect(screen.getByText("Meat & Fish")).toBeInTheDocument();
    expect(screen.getByText("Dairy & Eggs")).toBeInTheDocument();
  });

  it("renders category cards as links to category routes", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <App />
      </MemoryRouter>,
    );

    const beveragesLink = screen.getByRole("link", { name: /beverages/i });
    expect(beveragesLink).toHaveAttribute("href", "/category/cat-beverages");
  });

  it("renders the search bar", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("Search Store")).toBeInTheDocument();
  });

  it("renders the category grid with list semantics", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("list", { name: /product categories/i })).toBeInTheDocument();
  });
});
