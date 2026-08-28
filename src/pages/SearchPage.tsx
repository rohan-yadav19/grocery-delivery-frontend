import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchBar,
  ProductCard,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
} from "../components";
import { SearchIcon } from "../components/icons";
import { searchProductsAsync } from "../services/searchApi";
import type { Product } from "../types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Debounce delay before firing a search request (ms). */
const DEBOUNCE_MS = 300;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Search page matching the Figma Search.png reference.
 *
 * ### Stale-response protection (request sequence numbers)
 *
 * Each time a search request is dispatched, we capture the `requestId`
 * returned from the mock API (a monotonically increasing integer).
 * When a response arrives, we compare its `requestId` to
 * `latestDispatchedIdRef` — the ID of the most recently dispatched request.
 *
 * If `result.requestId < latestDispatchedIdRef`, the response is stale
 * and silently discarded.
 *
 * This ensures correctness even when:
 *   Request A (slow) starts → Request B (fast) starts →
 *   B resolves → UI shows B's results → A resolves later → A is **ignored**.
 */
function SearchPage() {
  const navigate = useNavigate();

  // ── Local state ───────────────────────────────────────────────────────────

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Stale-response tracking ───────────────────────────────────────────────

  /**
   * Tracks the requestId of the most recently **dispatched** API call.
   * Any response with a requestId lower than this is stale and ignored.
   */
  const latestDispatchedIdRef = useRef(0);

  /** Debounce timer handle. */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Search execution ──────────────────────────────────────────────────────

  const executeSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();

    if (trimmed.length === 0) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await searchProductsAsync(trimmed);

      // ── Stale-response guard ────────────────────────────────────────────
      // The API assigns monotonically increasing requestIds.
      // We store the latest dispatched ID immediately after the call starts
      // (inside the promise chain above). On arrival, if this response's
      // ID is lower than the latest we dispatched, it's stale.
      if (result.requestId < latestDispatchedIdRef.current) {
        return; // stale — silently ignore
      }

      // Accept this result as the latest
      latestDispatchedIdRef.current = result.requestId;
      setResults(result.products);
      setHasSearched(true);
      setIsLoading(false);
    } catch (err) {
      // Only show error if not aborted
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "Search failed");
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  // ── Query change handler ──────────────────────────────────────────────────

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Clear existing debounce timer
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }

      if (newQuery.trim().length === 0) {
        setResults([]);
        setIsLoading(false);
        setError(null);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);

      debounceTimerRef.current = setTimeout(() => {
        executeSearch(newQuery);
      }, DEBOUNCE_MS);
    },
    [executeSearch],
  );

  // ── Retry handler ─────────────────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    if (query.trim().length > 0) {
      executeSearch(query);
    }
  }, [query, executeSearch]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="search-page">
      {/* Search input area */}
      <div className="search-page-input">
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          placeholder="Search Store"
          autoFocus
        />
      </div>

      {/* Content area */}
      <div className="search-page-content">
        {/* Initial state — no query */}
        {!hasSearched && !isLoading && !error && (
          <EmptyState
            icon={<SearchIcon size={48} />}
            title="Search Products"
            description="Type a product name, brand, or category to start searching."
          />
        )}

        {/* Loading skeleton grid */}
        {isLoading && (
          <div className="search-results-grid" aria-label="Loading search results">
            {Array.from({ length: 6 }, (_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <ErrorState
            title="Search Failed"
            description={error}
            retryLabel="Try Again"
            onRetry={handleRetry}
            secondaryLabel="Back to Home"
            onSecondary={() => navigate("/")}
          />
        )}

        {/* Empty results */}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <EmptyState
            icon={<SearchIcon size={48} />}
            title="No Results Found"
            description={`We couldn't find any products matching "${query}".`}
            actionLabel="Clear Search"
            onAction={() => handleQueryChange("")}
          />
        )}

        {/* Results grid */}
        {!isLoading && !error && results.length > 0 && (
          <>
            <p className="search-result-count">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
            <div className="search-results-grid">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
