# Architecture Decisions

This document records key technical decisions made during the design and implementation of **FreshCart**, including problem definitions, options evaluated, chosen decisions, and trade-offs.

---

## 1. Persisted Cart Consistency Strategy

### Problem / Ambiguity
The cart is persisted in `localStorage` via Zustand's `persist` middleware. When a user returns after a previous session, the persisted cart data may become inconsistent with the current product catalogue:
1. A product in the cart may have been removed from the catalogue.
2. A product's price may have changed since the last session.
3. A persisted quantity may exceed the product's current stock or be zero/negative.

The application must handle all cases gracefully without displaying stale data, broken components, or invalid checkout totals.

### Options Considered
- **Option A — Persist full product snapshots:** Store full product objects (name, price, image, stock) inside each cart item entry.
  * *Drawback:* Stale prices produce incorrect totals; deleted products still appear in UI; schema changes require complex migrations.
- **Option B — Persist only product IDs; derive data at read-time (Chosen):** Store only `{ productId, quantity }` pairs in `localStorage`. On every render, look up each item against live `products.json` using `deriveCartSummary()`.
- **Option C — Startup mutation sync:** Mutate persisted store state synchronously on application mount before rendering.

### Decision Made
**Strategy: ID-only persistence with read-time validation.**
- Implemented in [cartService.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/services/cartService.ts).
- Non-existent products are silently excluded from `CartSummary`.
- Prices are always resolved from live `products.json` at render time, preventing stale price bugs.
- Quantities are clamped to `[1, product.stock]`.
- A mount effect silently cleans up invalid IDs in `localStorage`.

### Trade-off
Slightly increased render-time lookup overhead (O(N) mapping over cart items), which is completely negligible for shopping cart sizes (<100 items) and provides 100% data consistency.

---

## 2. Decoupled Data Layer & Typed Service Abstraction

### Problem / Ambiguity
Components needing product data, search filtering, or order processing could import raw JSON files directly or manage fetch state in individual page components. This leads to code duplication, fragile data contracts, and difficult unit testing.

### Options Considered
- **Option A — Direct JSON imports in React components:** `import products from '../data/products.json'`.
  * *Drawback:* Component code tightly couples to JSON structure; searching/filtering logic gets duplicated across screens.
- **Option B — Centralized Typed Service Layer (Chosen):** Encapsulate all catalogue queries, search filtering, and order generation inside dedicated service files ([productService.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/services/productService.ts), [searchApi.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/services/searchApi.ts), [orderService.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/services/orderService.ts)).

### Decision Made
Created explicit typed service functions (`getProductById`, `getProductsByCategory`, `searchProductsAsync`, `createOrder`). Components interact exclusively through typed TypeScript contracts (`Product`, `Category`, `CartSummary`, `Order`).

### Trade-off
Requires maintaining explicit TypeScript interfaces and service functions when modifying mock datasets, but guarantees type safety, maintainability, and clean unit testing.

---

## 3. Global State Management Framework (Zustand 5 vs. Alternatives)

### Problem / Ambiguity
Managing shared client state (shopping cart items, user favorites, active delivery location session) across non-nested components without props drilling or unnecessary re-renders.

### Options Considered
- **Option A — React Context API:** Standard built-in solution.
  * *Drawback:* Every cart/favorite update triggers re-renders across all context consumer subtrees unless wrapped in granular context providers.
- **Option B — Redux Toolkit:** Standard enterprise state framework.
  * *Drawback:* Overkill boilerplate (reducers, actions, slices) for a client-only mock application.
- **Option C — Zustand 5 with persist middleware (Chosen):** Lightweight, hook-based store.

### Decision Made
Utilized Zustand 5 stores ([cartStore.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/stores/cartStore.ts), [favoriteStore.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/stores/favoriteStore.ts), [sessionStore.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/stores/sessionStore.ts)). Selective state subscriptions (`useCartStore(state => state.items)`) ensure components only re-render when their specific slice changes.

### Trade-off
Adds a lightweight external dependency (`zustand`), but reduces boilerplate and delivers high re-render performance.

---

## 4. Monotonic Request ID Sequence Tracking for Async Search Race Conditions

### Problem / Ambiguity
When users type rapidly in the search bar, multiple asynchronous API requests are dispatched. Network latency variability can cause an earlier request ("milk", delay 800ms) to resolve *after* a later request ("bread", delay 50ms), overwriting fresh results with stale query results.

### Options Considered
- **Option A — Standard AbortController cancellation:** Abort prior fetch promises when a new query is typed.
  * *Drawback:* Mock in-memory delays using setTimeout don't always abort cleanly across test environments; unhandled promise rejection edge cases in mock timers.
- **Option B — Monotonic Request ID Tracking (Chosen):** Assign an incremental `requestId` to every search call in [searchApi.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/services/searchApi.ts). The UI consumer compares `result.requestId` against `latestAcceptedRequestId` and ignores out-of-order responses.

### Decision Made
Implemented monotonic request IDs combined with `AbortSignal` support. Consumers check `if (result.requestId < latestAcceptedRequestId) return;` before updating component state.

### Trade-off
Slightly more explicit state tracking logic in search components, but completely eliminates async race condition bugs under arbitrary network latency.
