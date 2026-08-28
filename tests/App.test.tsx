import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import App from "../src/App";
import { useSessionStore } from "../src/stores/sessionStore";

describe("App", () => {
  it("renders the home page with product sections at the root route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    // Home page should show the "Exclusive Offer" section heading
    expect(screen.getByRole("heading", { level: 2, name: /exclusive offer/i })).toBeInTheDocument();
  });

  it("renders the Explore page at /explore", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /find products/i })).toBeInTheDocument();
  });

  it("renders the Cart page at /cart", () => {
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /my cart/i })).toBeInTheDocument();
  });

  it("renders the Welcome page at /welcome", () => {
    useSessionStore.setState({ isAuthenticated: false });
    render(
      <MemoryRouter initialEntries={["/welcome"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /welcome/i })).toBeInTheDocument();
  });

  it("renders the main navigation on tab routes", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const navElements = screen.getAllByRole("navigation", { name: /main navigation/i });
    expect(navElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders product cards on the home page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    // Should render at least one product name from the data
    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
  });

  it("renders the promotional banner on the home page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("region", { name: /promotional banner carousel/i }),
    ).toBeInTheDocument();
  });

  it("renders the Indian Bengaluru location header and not Dhaka", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText("Koramangala, Bengaluru").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Dhaka/i)).not.toBeInTheDocument();
  });
});
