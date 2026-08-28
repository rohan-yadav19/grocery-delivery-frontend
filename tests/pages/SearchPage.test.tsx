import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import App from "../../src/App";
import {
  setLatencyOverride,
  setFailOverride,
  resetRequestCounter,
} from "../../src/services/searchApi";

/**
 * SearchPage UI integration tests.
 *
 * All tests use instant API (0ms latency) so no fake timers are needed
 * for the happy paths. The stale-response mechanism is exhaustively
 * tested in tests/services/searchApi.test.ts.
 */
describe("SearchPage", () => {
  beforeEach(() => {
    resetRequestCounter();
    setLatencyOverride(() => 0);
    setFailOverride(null);
  });

  afterEach(() => {
    setLatencyOverride(null);
    setFailOverride(null);
    resetRequestCounter();
  });

  function renderSearchPage() {
    return render(
      <MemoryRouter initialEntries={["/search"]}>
        <App />
      </MemoryRouter>,
    );
  }

  /** Type into search, then wait for debounce + instant API. */
  async function typeAndWait(user: ReturnType<typeof userEvent.setup>, text: string) {
    const input = screen.getByLabelText("Search Store");
    await user.clear(input);
    await user.type(input, text);
    // Wait for 300ms debounce + a bit of margin
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });
  }

  // ── 1. Renders ────────────────────────────────────────────────────────────

  it("renders the search page with a search input", () => {
    renderSearchPage();
    expect(screen.getByLabelText("Search Store")).toBeInTheDocument();
  });

  it("shows initial state before any search", () => {
    renderSearchPage();
    expect(screen.getByText("Search Products")).toBeInTheDocument();
  });

  // ── 2. Search returns matching products ───────────────────────────────────

  it("returns matching products after typing a query", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await typeAndWait(user, "apple");

    await waitFor(() => {
      expect(screen.getByText(/Red Apple/i)).toBeInTheDocument();
    });
  });

  // ── 3. Empty results ──────────────────────────────────────────────────────

  it("shows EmptyState when no products match", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await typeAndWait(user, "xyznonexistent");

    await waitFor(() => {
      expect(screen.getByText("No Results Found")).toBeInTheDocument();
    });
  });

  // ── 4. Loading state ──────────────────────────────────────────────────────

  it("shows loading skeleton while search is pending", async () => {
    setLatencyOverride(() => 60000); // very slow
    const user = userEvent.setup();
    renderSearchPage();

    const input = screen.getByLabelText("Search Store");
    await user.type(input, "apple");

    // Wait past debounce so loading state kicks in
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });

    const skeletons = screen.getAllByRole("status", { name: /loading/i });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ── 5. Failure shows ErrorState ───────────────────────────────────────────

  it("shows ErrorState when search fails", async () => {
    setFailOverride(() => true);
    const user = userEvent.setup();
    renderSearchPage();

    await typeAndWait(user, "apple");

    await waitFor(() => {
      expect(screen.getByText("Search Failed")).toBeInTheDocument();
    });
  });

  // ── 6. Retry works ───────────────────────────────────────────────────────

  it("retries a failed search when clicking Try Again", async () => {
    setFailOverride(() => true);
    const user = userEvent.setup();
    renderSearchPage();

    await typeAndWait(user, "apple");

    await waitFor(() => {
      expect(screen.getByText("Search Failed")).toBeInTheDocument();
    });

    // Fix failure and retry
    setFailOverride(null);
    setLatencyOverride(() => 0);

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/Red Apple/i)).toBeInTheDocument();
    });
  });

  // ── 7. Clear resets search ────────────────────────────────────────────────

  it("clears search results when input is cleared", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await typeAndWait(user, "apple");

    await waitFor(() => {
      expect(screen.getByText(/Red Apple/i)).toBeInTheDocument();
    });

    const clearBtn = screen.getByLabelText("Clear search");
    await user.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText("Search Products")).toBeInTheDocument();
    });
  });

  // ── 8. Results count is shown ─────────────────────────────────────────────

  it("displays result count after search", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await typeAndWait(user, "apple");

    await waitFor(() => {
      expect(screen.getByText(/found/i)).toBeInTheDocument();
    });
  });
});
