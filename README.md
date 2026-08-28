# FreshCart — Grocery Delivery App

A responsive, mobile-first grocery delivery application built as a Frontend Developer Intern assignment.

## Purpose

FreshCart lets users browse grocery categories, view products, manage a shopping cart, and place orders — all from a clean, modern mobile interface. The app runs entirely in the browser with mock data (no backend required).

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 |
| **Build tool** | Vite 8 |
| **Language** | TypeScript 6 (strict mode, zero `any`) |
| **Styling** | Tailwind CSS 4 |
| **State management** | Zustand 5 (persisted via `localStorage`) |
| **Routing** | React Router 7 |
| **Testing** | Vitest + React Testing Library |

### Constraints

- No UI component libraries
- No Redux / MobX / Context API for global state
- No backend — all data is mock JSON

## Architecture

```
src/
├── components/        # Reusable UI components
├── pages/             # Page-level route components
├── stores/            # Zustand global state stores
│   ├── cartStore      # Cart items (productId + quantity only)
│   ├── favoriteStore  # Favorited product IDs
│   └── sessionStore   # Ephemeral session state (address, location)
├── services/          # Data-access layer
│   └── productService # Typed functions to query mock product/category data
├── data/              # Mock JSON datasets
│   ├── products.json  # 13 grocery products
│   └── categories.json# 8 categories
├── types/             # TypeScript domain types
│   ├── product        # Product, ProductRating
│   ├── category       # Category
│   ├── cart           # CartItem, CartLineItem, CartSummary
│   └── order          # Order, OrderItem, OrderStatus
├── hooks/             # Custom React hooks
└── utils/             # Shared utilities
    └── currency       # Centralized USD currency formatter
```

### Key Design Decisions

1. **Cart stores IDs, not objects** — The cart persists only `{ productId, quantity }`. Current price, stock, and product existence are always resolved from the live dataset at read time. This prevents stale-price bugs and makes future cart reconciliation straightforward.

2. **Typed service layer** — Components never import JSON directly. All data access goes through `productService.ts`, which exposes typed query functions and O(1) lookup maps.

3. **Centralized formatting** — Currency display uses a single `formatCurrency()` utility backed by `Intl.NumberFormat` to guarantee consistent `$X.XX` formatting everywhere.

4. **Persistence strategy** — Cart and favorites are persisted to `localStorage` via Zustand's `persist` middleware. Session state (delivery address) is intentionally ephemeral.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type checking only |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Getting Started

```bash
npm install
npm run dev
```
