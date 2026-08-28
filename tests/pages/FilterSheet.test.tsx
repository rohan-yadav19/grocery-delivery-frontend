import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import App from "../../src/App";

/**
 * Filter tests — tests the FilterSheet integration on the CategoryPage.
 *
 * Uses the Beverages category (cat-beverages) which has 6 products
 * with known brands: Coca-Cola (3), Tropicana (2), PepsiCo (1).
 */
describe("Filters (CategoryPage)", () => {
  function renderBeverages() {
    return render(
      <MemoryRouter initialEntries={["/category/cat-beverages"]}>
        <App />
      </MemoryRouter>,
    );
  }

  /** Get the product grid container. */
  function getProductGrid() {
    return screen.getByRole("list", { name: /beverages products/i });
  }

  /** Count product items in the grid. */
  function getProductCount() {
    const grid = getProductGrid();
    return within(grid).getAllByRole("listitem").length;
  }

  // ── 1. Filter button renders ──────────────────────────────────────────────

  it("renders the filter button", () => {
    renderBeverages();
    expect(screen.getByLabelText(/filter products/i)).toBeInTheDocument();
  });

  // ── 2. Filter sheet opens ─────────────────────────────────────────────────

  it("opens the filter sheet when filter button is clicked", async () => {
    const user = userEvent.setup();
    renderBeverages();

    await user.click(screen.getByLabelText(/filter products/i));

    expect(screen.getByRole("dialog", { name: /filters/i })).toBeInTheDocument();
  });

  // ── 3. Category options render ────────────────────────────────────────────

  it("shows category filter options inside the sheet", async () => {
    const user = userEvent.setup();
    renderBeverages();

    await user.click(screen.getByLabelText(/filter products/i));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Categories")).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/beverages/i)).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/meat & fish/i)).toBeInTheDocument();
  });

  // ── 4. Brand options render ───────────────────────────────────────────────

  it("shows brand filter options inside the sheet", async () => {
    const user = userEvent.setup();
    renderBeverages();

    await user.click(screen.getByLabelText(/filter products/i));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Brand")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Coca-Cola")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Tropicana")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("PepsiCo")).toBeInTheDocument();
  });

  // ── 5. Multiple filters can be selected ───────────────────────────────────

  it("allows selecting multiple filter options", async () => {
    const user = userEvent.setup();
    renderBeverages();

    await user.click(screen.getByLabelText(/filter products/i));

    const dialog = screen.getByRole("dialog");
    const cocaCola = within(dialog).getByLabelText("Coca-Cola");
    const tropicana = within(dialog).getByLabelText("Tropicana");

    await user.click(cocaCola);
    await user.click(tropicana);

    expect(cocaCola).toBeChecked();
    expect(tropicana).toBeChecked();
  });

  // ── 6. Apply filters updates product results ─────────────────────────────

  it("filters products when Apply Filter is clicked", async () => {
    const user = userEvent.setup();
    renderBeverages();

    // Initially 8 beverages
    expect(getProductCount()).toBe(8);

    await user.click(screen.getByLabelText(/filter products/i));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByLabelText("PepsiCo"));
    await user.click(within(dialog).getByRole("button", { name: /apply filter/i }));

    // Should only show PepsiCo products (Pepsi Can)
    await waitFor(() => {
      const grid = screen.getByRole("list", { name: /beverages products/i });
      expect(within(grid).getAllByRole("listitem").length).toBe(1);
    });

    expect(screen.getByText("Pepsi Can")).toBeInTheDocument();
  });

  // ── 7. Clear filters resets results ───────────────────────────────────────

  it("clears all filters and resets product list", async () => {
    const user = userEvent.setup();
    renderBeverages();

    // Apply a brand filter
    await user.click(screen.getByLabelText(/filter products/i));
    let dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByLabelText("PepsiCo"));
    await user.click(within(dialog).getByRole("button", { name: /apply filter/i }));

    await waitFor(() => {
      const grid = screen.getByRole("list", { name: /beverages products/i });
      expect(within(grid).getAllByRole("listitem").length).toBe(1);
    });

    // Open filter again and clear
    await user.click(screen.getByLabelText(/filter products/i));
    dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByText("Clear Filters"));
    await user.click(within(dialog).getByRole("button", { name: /apply filter/i }));

    // All 8 beverages should be back
    await waitFor(() => {
      expect(getProductCount()).toBe(8);
    });
  });

  // ── 8. Closing without Apply does not commit changes ──────────────────────

  it("does not apply filters when sheet is closed without clicking Apply", async () => {
    const user = userEvent.setup();
    renderBeverages();

    expect(getProductCount()).toBe(8);

    await user.click(screen.getByLabelText(/filter products/i));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByLabelText("PepsiCo"));

    // Close without applying
    await user.click(within(dialog).getByLabelText("Close"));

    // Products should still be all 8
    await waitFor(() => {
      expect(getProductCount()).toBe(8);
    });
  });

  // ── 9. Empty filtered result shows EmptyState ─────────────────────────────

  it("shows empty state when filters match no products", async () => {
    const user = userEvent.setup();
    renderBeverages();

    await user.click(screen.getByLabelText(/filter products/i));

    const dialog = screen.getByRole("dialog");
    // Select a combination with no products (Meat & Fish + Tropicana)
    await user.click(within(dialog).getByLabelText("Meat & Fish"));
    await user.click(within(dialog).getByLabelText("Tropicana"));
    await user.click(within(dialog).getByRole("button", { name: /apply filter/i }));

    await waitFor(() => {
      expect(screen.getByText("No Matching Products")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  // ── 10. Filter badge shows active count ───────────────────────────────────

  it("shows a badge with the count of active filters", async () => {
    const user = userEvent.setup();
    renderBeverages();

    await user.click(screen.getByLabelText(/filter products/i));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByLabelText("Coca-Cola"));
    await user.click(within(dialog).getByLabelText("PepsiCo"));
    await user.click(within(dialog).getByRole("button", { name: /apply filter/i }));

    // The filter button should now indicate 2 active filters
    const filterBtn = screen.getByLabelText(/filter products.*2 active/i);
    expect(filterBtn).toBeInTheDocument();
  });
});
