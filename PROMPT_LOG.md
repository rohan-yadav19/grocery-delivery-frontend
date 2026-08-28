# AI Prompt & Assistance Log

This document records material AI prompts, code suggestions, design decisions, and corrections made during the development of **FreshCart**.

---

## AI Prompt History

### Prompt 1: Persisted Shopping Cart Architecture
* **AI Tool / Model:** Antigravity Assistant (Gemini 3.6 Flash)
* **Prompt:** *"Design a persisted shopping cart state manager using Zustand 5 for a mobile-first grocery delivery application."*
* **AI Suggested:** Storing full product objects (`{ id, name, price, image, stock, quantity }`) directly in `localStorage` via Zustand's `persist` middleware.
* **What Was Used:** Adopted Zustand 5 with `persist` middleware for store infrastructure.
* **What Was Changed / Rejected:** Rejected storing full product snapshots (prices, titles, stock levels) in `localStorage`. Instead, persisted only `{ productId, quantity }` arrays and created `deriveCartSummary()` in `cartService.ts` to derive live prices and stock levels at render time.
* **Verification:** Wrote [cartPersistence.test.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/tests/services/cartPersistence.test.ts) testing stale prices and missing product edge cases.

---

### Prompt 2: Tailwind CSS v4 Integration with Vite 8
* **AI Tool / Model:** Antigravity Assistant (Gemini 3.6 Flash)
* **Prompt:** *"Configure Tailwind CSS styling in a Vite 8 + React 19 TypeScript project."*
* **AI Suggested:** Creating a legacy `tailwind.config.js` file with `@tailwind base; @tailwind components; @tailwind utilities;` directives in `src/index.css`.
* **What Was Used:** Configured `@tailwindcss/vite` plugin in `vite.config.ts`.
* **What Was Changed / Rejected:** Replaced legacy v3 directives with modern Tailwind CSS v4 `@import "tailwindcss";` in `src/index.css`.
* **Verification:** Built project with `npm run build` and verified zero CSS compilation warnings.

---

## What AI Got Wrong / What I Corrected

### 1. Stale Product Price Persistence in Cart Store
* **AI Error:** The AI generated code that saved the product `price` at the moment an item was added to the cart (`cartItem = { id, title, price: 5.99, quantity: 2 }`).
* **Correction:** Storing price snapshot creates critical stale-price bugs when catalogue prices change in `products.json`. I refactored the cart schema to persist only `{ productId, quantity }`, ensuring prices are always calculated live from `products.json` via `deriveCartSummary()`.

### 2. Async Search Race Condition Handling
* **AI Error:** The AI recommended using standard React state (`setSearchResults`) inside a simple `.then()` promise callback without cancellation or request sequencing logic.
* **Correction:** Under variable simulated network latency (200ms–1200ms), rapid typing resulted in earlier slow queries overwriting later fast queries. I introduced a monotonic `requestId` tracking mechanism in `searchApi.ts` and added stale-response guards (`if (result.requestId < maxSeenId) return;`) in `SearchPage.tsx`.
