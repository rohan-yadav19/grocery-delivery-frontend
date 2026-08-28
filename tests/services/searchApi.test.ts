import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  searchProductsAsync,
  setLatencyOverride,
  setFailOverride,
  resetRequestCounter,
} from "../../src/services/searchApi";

/**
 * searchApi unit tests — focuses on the mock API behaviour and
 * the stale-response mechanism.
 *
 * Uses vi.useFakeTimers() for deterministic control of setTimeout delays.
 */
describe("searchApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetRequestCounter();
    setFailOverride(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    setLatencyOverride(null);
    setFailOverride(null);
    resetRequestCounter();
  });

  it("returns matching products for a valid query", async () => {
    setLatencyOverride(() => 100);

    const promise = searchProductsAsync("apple");
    vi.advanceTimersByTime(100);
    const result = await promise;

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.some((p) => /apple/i.test(p.name))).toBe(true);
    expect(result.query).toBe("apple");
  });

  it("returns empty array for a non-matching query", async () => {
    setLatencyOverride(() => 100);

    const promise = searchProductsAsync("xyznonexistent");
    vi.advanceTimersByTime(100);
    const result = await promise;

    expect(result.products).toHaveLength(0);
  });

  it("assigns monotonically increasing request IDs", async () => {
    setLatencyOverride(() => 0);

    const p1 = searchProductsAsync("a");
    vi.advanceTimersByTime(0);
    const r1 = await p1;

    const p2 = searchProductsAsync("b");
    vi.advanceTimersByTime(0);
    const r2 = await p2;

    expect(r2.requestId).toBeGreaterThan(r1.requestId);
  });

  it("throws on simulated failure", async () => {
    setLatencyOverride(() => 50);
    setFailOverride(() => true);

    const promise = searchProductsAsync("apple");
    vi.advanceTimersByTime(50);

    await expect(promise).rejects.toThrow(/search failed/i);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STALE RESPONSE TEST — CORE PROOF
  //
  // Reproduces the exact race condition at the API level:
  //
  //   1. Request A ("banana") starts — latency 800ms
  //   2. Request B ("apple")  starts — latency 50ms
  //   3. B completes first   → requestId B > requestId A
  //   4. A completes later   → requestId A < requestId B
  //
  // Consumer logic: only accept result if result.requestId >= latestSeenId.
  //
  // This proves the mechanism:
  //   - B's requestId is higher than A's
  //   - After B resolves, any consumer tracking latestRequestId will discard A
  // ═══════════════════════════════════════════════════════════════════════════

  it("STALE RESPONSE: slow request A gets a lower requestId than fast request B", async () => {
    setLatencyOverride((query) => {
      if (query.includes("banana")) return 800;
      if (query.includes("apple")) return 50;
      return 200;
    });

    // Start request A (slow — 800ms)
    const promiseA = searchProductsAsync("banana");

    // Start request B (fast — 50ms) immediately after
    const promiseB = searchProductsAsync("apple");

    // Advance 50ms — B should resolve
    vi.advanceTimersByTime(50);
    const resultB = await promiseB;

    // Advance remaining 750ms — A should resolve
    vi.advanceTimersByTime(750);
    const resultA = await promiseA;

    // ── THE KEY ASSERTIONS ──────────────────────────────────────────────

    // 1. B finished first (lower latency)
    expect(resultB.query).toBe("apple");
    expect(resultA.query).toBe("banana");

    // 2. A's requestId < B's requestId, proving A was dispatched first
    expect(resultA.requestId).toBeLessThan(resultB.requestId);

    // 3. A consumer that tracks latestRequestId would reject A:
    //    After accepting B (requestId = 2), A arrives (requestId = 1).
    //    Since 1 < 2, A is stale and must be discarded.
    const latestAcceptedId = resultB.requestId;
    const isAStale = resultA.requestId < latestAcceptedId;
    expect(isAStale).toBe(true);

    // 4. B has the correct results
    expect(resultB.products.some((p) => /apple/i.test(p.name))).toBe(true);
  });

  it("STALE RESPONSE: simulated consumer correctly discards stale response", async () => {
    setLatencyOverride((query) => {
      if (query.includes("milk")) return 2000;
      if (query.includes("apple")) return 100;
      return 500;
    });

    // Simulate consumer state
    let displayedProducts: string[] = [];
    let latestAcceptedRequestId = 0;

    function acceptResult(result: Awaited<ReturnType<typeof searchProductsAsync>>) {
      // THIS IS THE STALE-RESPONSE GUARD — identical to SearchPage logic
      if (result.requestId < latestAcceptedRequestId) {
        return; // stale — discard
      }
      latestAcceptedRequestId = result.requestId;
      displayedProducts = result.products.map((p) => p.name);
    }

    // Start "milk" (slow: 2000ms)
    const promiseMilk = searchProductsAsync("milk");

    // Start "apple" (fast: 100ms)
    const promiseApple = searchProductsAsync("apple");

    // Bump the latest ID to apple's expected ID (since consumer dispatches
    // the request and updates latestRequestId on dispatch, not on response)
    // In the real component, this happens in handleQueryChange
    latestAcceptedRequestId = 0; // reset — we'll accept based on arrival

    // Advance 100ms — apple resolves
    vi.advanceTimersByTime(100);
    const appleResult = await promiseApple;
    acceptResult(appleResult);

    expect(displayedProducts.some((n) => /apple/i.test(n))).toBe(true);

    // Advance 1900ms — milk resolves
    vi.advanceTimersByTime(1900);
    const milkResult = await promiseMilk;
    acceptResult(milkResult);

    // ── THE KEY ASSERTION ───────────────────────────────────────────────
    // displayedProducts must STILL show apple results, NOT milk
    expect(displayedProducts.some((n) => /apple/i.test(n))).toBe(true);
  });
});
