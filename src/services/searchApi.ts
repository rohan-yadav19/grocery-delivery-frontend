import type { Product } from "../types";
import { searchProducts as syncSearch } from "./productService";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Minimum simulated latency in ms. */
const MIN_LATENCY_MS = 200;

/** Maximum simulated latency in ms. */
const MAX_LATENCY_MS = 1200;

/** Whether to log request lifecycle events (dev only). */
let debugMode = false;

/** Enable or disable debug logging. */
export function setSearchDebug(enabled: boolean): void {
  debugMode = enabled;
}

// ---------------------------------------------------------------------------
// Latency override (for testing)
// ---------------------------------------------------------------------------

/**
 * When set, this function replaces the random delay with a controlled one.
 * Accepts the query string and returns the delay in ms.
 *
 * Set to `null` to restore random behaviour.
 */
let latencyOverride: ((query: string) => number) | null = null;

/** Override the latency for deterministic tests. */
export function setLatencyOverride(fn: ((query: string) => number) | null): void {
  latencyOverride = fn;
}

// ---------------------------------------------------------------------------
// Failure simulation (for testing)
// ---------------------------------------------------------------------------

let failOverride: ((query: string) => boolean) | null = null;

/** Override failure behaviour for deterministic tests. */
export function setFailOverride(fn: ((query: string) => boolean) | null): void {
  failOverride = fn;
}

// ---------------------------------------------------------------------------
// Mock API
// ---------------------------------------------------------------------------

/** Internal monotonic request counter for stale-response detection. */
let requestCounter = 0;

/** Reset counter (useful in tests). */
export function resetRequestCounter(): void {
  requestCounter = 0;
}

export interface SearchResult {
  /** Monotonically increasing request ID. */
  readonly requestId: number;
  /** The query that produced this result. */
  readonly query: string;
  /** Matching products. */
  readonly products: readonly Product[];
}

/**
 * Simulated async product search with variable latency.
 *
 * Returns a `SearchResult` that includes a `requestId` for stale-response
 * detection by the consumer.
 *
 * @param query - the search query string
 * @param signal - optional AbortSignal for cancellation
 */
export async function searchProductsAsync(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const requestId = ++requestCounter;

  const delay =
    latencyOverride !== null
      ? latencyOverride(query)
      : Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1)) + MIN_LATENCY_MS;

  if (debugMode) {
    // eslint-disable-next-line no-console
    console.log(`[search] #${requestId} query="${query}" delay=${delay}ms START`);
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  // Check for simulated failure
  const shouldFail = failOverride !== null ? failOverride(query) : false;
  if (shouldFail) {
    throw new Error(`Search failed for "${query}"`);
  }

  const products = syncSearch(query);

  if (debugMode) {
    // eslint-disable-next-line no-console
    console.log(
      `[search] #${requestId} query="${query}" results=${products.length} DONE`,
    );
  }

  return { requestId, query, products: [...products] };
}
