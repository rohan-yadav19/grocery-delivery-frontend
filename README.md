# FreshCart — Grocery Delivery Web Application

A responsive, mobile-first grocery delivery application built as a Frontend Developer assignment. FreshCart lets users browse grocery categories, view products, manage a persistent shopping cart, select delivery locations, complete checkouts, and track live order progress—all in a clean, high-performance interface.

---

## Features

- **Product Discovery & Categories**: Browse 8 grocery categories, featured banners, and 13 detailed grocery items.
- **Debounced Search & Filtering**: Fast product search with filter sheets for category, price range, and minimum rating.
- **Persisted Shopping Cart**: Cart state stored securely in `localStorage` via Zustand 5; prices and stock derived live at render time.
- **Interactive Checkout & Address Selector**: Select or edit delivery locations, choose payment methods, and review itemized order summaries.
- **Order Tracking Timeline**: Real-time status simulation tracking order placement, packing, out-of-delivery, and completed stages.
- **Favorites & Wishlist**: Save favorite items and add all items to cart with a single click.
- **Comprehensive Test Suite**: 26 Vitest test suites with 262 passing unit and component integration tests.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (`react` & `react-dom` v19.2.8) |
| **Build Tool** | Vite 8 (`vite` v8.2.2) |
| **Language** | TypeScript 6 (strict mode, zero `any`) |
| **Styling** | Tailwind CSS 4 (`@tailwindcss/vite`) |
| **State Management** | Zustand 5 (persisted via `localStorage`) |
| **Routing** | React Router 7 |
| **Testing** | Vitest 4 + React Testing Library + jsdom |

---

## Setup & Local Run Instructions

### Prerequisites
- Node.js 18+ and npm installed

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/rohan-yadav19/grocery-delivery-frontend.git
cd grocery-delivery-frontend

# 2. Install dependencies
npm install

# 3. Ensure binary execution permissions (if needed)
chmod +x node_modules/.bin/*

# 4. Start development server
npm run dev

# 5. Run tests & typecheck
npm run typecheck
npm run test
```

The application runs locally at `http://localhost:5173/` (or next available port).

---

## Architecture Summary

```
src/
├── components/        # Reusable UI components (BottomNav, BottomSheet, ProductCard, etc.)
├── pages/             # Page components (HomePage, SearchPage, CartPage, CheckoutPage, etc.)
├── stores/            # Zustand global state stores (cartStore, favoriteStore, sessionStore)
├── services/          # Data access layer (productService, searchApi, cartService, orderService)
├── data/              # Mock JSON datasets (products.json, categories.json)
├── types/             # TypeScript domain definitions (Product, Cart, Order, Category)
├── utils/             # Shared helpers (formatCurrency)
└── index.css          # Tailwind CSS v4 root stylesheet
```

---

## Important Implementation Details

1. **Persisted Cart Read-Time Validation**:
   The cart persists only `{ productId, quantity }` pairs in `localStorage`. Prices, stock validation, and totals are computed dynamically from live `products.json` via `deriveCartSummary()`. This structurally prevents stale pricing or ghost items.

2. **Async Search Stale-Response Protection**:
   Asynchronous search requests in `searchApi.ts` use a monotonic `requestId` sequence. `SearchPage.tsx` rejects out-of-order responses (`requestId < maxAcceptedId`), eliminating race conditions under variable network latency.

3. **Responsive Mobile-First Ergonomics**:
   Fixed navigation ([BottomNav.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/BottomNav.tsx)) and bottom drawers ([BottomSheet.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/BottomSheet.tsx)) scale dynamically to centered modal presentations on desktop viewports (`≥640px`).

---

## Known Limitations

- **Mock Data Only**: Operating without a live backend API; order submission and search latency are simulated asynchronously in browser memory.
- **Local Storage Scope**: Cart and favorites persist strictly per browser instance.

---

## What Could Be Improved with Another Day

1. **Service Worker & Offline Support**: Cache product assets with PWA support for offline browsing.
2. **E2E Testing Suite**: Add Playwright test coverage for complete user purchase flows across Chrome and WebKit mobile viewports.
3. **Advanced Accessibility (a11y)**: Add keyboard navigation shortcuts for bottom sheets and screen reader announcements for quantity changes.
