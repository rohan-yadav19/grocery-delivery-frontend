# FreshCart — Design System & Mobile-to-Desktop Design Specification

Executive design documentation outlining the design system, mobile-first responsive architecture, component specifications, and accessibility standards implemented in **FreshCart**.

---

## 1. Executive Summary & Design Vision

**FreshCart** is designed around a mobile-first, content-forward UX philosophy tailored for fast, intuitive grocery shopping. The user interface balances high-density product discovery with clean aesthetic hierarchy, rich micro-interactions, and accessible touch ergonomics.

### Core Design Principles
- **Clarity First**: Bold product typography, high-contrast price tags, and clear visual indicators for stock and active states.
- **Thumb-Driven Ergonomics**: Primary action targets (navigation, add-to-cart steppers, filter sheet triggers) positioned within natural one-handed mobile reach zones.
- **Fluid Desktop Adaptation**: Mobile-first components dynamically adapt to desktop displays without breaking layout proportions or interaction patterns.
- **Zero-Friction Feedback**: Instant optimistic feedback on add-to-cart actions, quantity changes, wishlist toggles, and filter updates.

---

## 2. Mobile-to-Desktop Responsive Strategy

The application implements three primary responsive design architectural strategies to bridge mobile touch experiences with desktop pointer interactions.

---

### Decision 1: Mobile-First Fixed Bottom Navigation with Viewport Boundaries

#### Context & Product Need
In mobile e-commerce, primary navigation (Shop, Explore, Cart, Favorites, Account) must sit comfortably within the user's lower thumb reach zone. However, expanding a fixed bottom bar continuously across 1920px widescreen desktop monitors creates visually awkward, stretched layouts and poor ergonomics.

#### Architectural Implementation
- **Component File**: [BottomNav.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/BottomNav.tsx)
- **CSS Strategy**:
  ```css
  /* Mobile: Fixed bottom bar spanning full screen width */
  fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100

  /* Desktop (≥640px): Centered container constraint with exact 430px bounds */
  sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md sm:rounded-t-2xl sm:shadow-lg
  ```
- **User Experience Result**: Mobile users experience native bottom navigation with safe-area padding. Desktop users see a phone-proportioned, elevated navigation bar centered cleanly within the desktop shell, maintaining ergonomic alignment with the page content container.

---

### Decision 2: Adaptive Bottom Sheet Filter Drawer vs. Centered Modal Presentation

#### Context & Product Need
Complex interaction overlays—such as category filtering (`FilterSheet`), location drawers (`SelectLocationPage`), and address editor dialogs (`AccountPage`)—require distinct UX treatments on touch screens versus pointer-driven desktop displays.

#### Architectural Implementation
- **Component Files**: [BottomSheet.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/BottomSheet.tsx) & [FilterSheet.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/pages/FilterSheet.tsx)
- **Responsive Layout Specs**:
  * **Mobile (`<640px`)**: Slide-up drawer anchored to the bottom screen edge (`rounded-t-[30px]`), featuring a touch drag handle, full-width touch actions, and backdrop tap-to-dismiss.
  * **Desktop (`≥640px`)**: Smoothly transitions into a centered dialog popup (`max-w-lg rounded-2xl shadow-2xl`), featuring a backdrop blur (`backdrop-blur-sm`) and top-right close button.
- **User Experience Result**: Touch users get native sheet gestures, while desktop users get desktop-standard centered modal dialogs without duplicating component state logic.

---

### Decision 3: Responsive Fluid Product Grid & Dynamic Aspect Ratios

#### Context & Product Need
Product listings (in [HomePage.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/pages/HomePage.tsx), [CategoryPage.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/pages/CategoryPage.tsx), and [SearchPage.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/pages/SearchPage.tsx)) must balance product density with legible product images and touch-friendly CTA buttons across all viewport widths.

#### Architectural Implementation
- **Component File**: [ProductCard.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/ProductCard.tsx)
- **Grid Layout Rules**:
  ```html
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
    <!-- Product Cards -->
  </div>
  ```
- **Card Aspect & Bounds Specs**:
  * **Product Thumbnail Container**: Fixed `aspect-square` container with `object-contain` scaling and fallback loading skeletons ([ResilientImage.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/ResilientImage.tsx)).
  * **Quick Add Button Target**: Minimum `45px × 45px` hit target on mobile screens, preserving minimum WCAG touch target recommendations.

---

## 3. Design System Tokens & Foundations

### 3.1 Color System Matrix

| Token Name | Hex Code | HSL Value | Purpose & Usage |
|---|---|---|---|
| **Primary Brand Green** | `#53B175` | `hsl(142, 38%, 51%)` | Primary CTAs, active tab icons, checkmarks, badges |
| **Primary Hover / Active** | `#489E67` | `hsl(142, 38%, 45%)` | Pressed and hovered state on primary buttons |
| **Primary Light Surface** | `#EEF7F1` | `hsl(142, 38%, 95%)` | Soft green background tints for categories & tags |
| **Text Primary (Charcoal)** | `#181725` | `hsl(244, 22%, 12%)` | Headings, product titles, total price values |
| **Text Secondary (Muted)** | `#7C7C7C` | `hsl(0, 0%, 49%)` | Product unit labels, subtitles, timestamps |
| **Border Neutral** | `#E2E2E2` | `hsl(0, 0%, 88%)` | Product card borders, input borders, list dividers |
| **Input Background** | `#F2F3F2` | `hsl(120, 3%, 95%)` | Search input container background, pill backgrounds |
| **Error / Alert Red** | `#F3603F` | `hsl(11, 88%, 60%)` | Out-of-stock badges, error states, remove buttons |
| **Rating Gold** | `#F8A44C` | `hsl(32, 92%, 63%)` | Product review star icons |

#### Category Card Tint Palette
- **Fresh Fruits & Veg**: Background `#EEF7F1` | Border `#53B17580`
- **Cooking Oil & Ghee**: Background `#FDF6E7` | Border `#F8A44C80`
- **Meat & Fish**: Background `#FDE8E4` | Border `#F7A593`
- **Bakery & Snacks**: Background `#F4EBF7` | Border `#D3B0E0`
- **Dairy & Eggs**: Background `#FFF8E5` | Border `#FDE598`
- **Beverages**: Background `#EDF7FC` | Border `#B7DFF5`

---

### 3.2 Typography Hierarchy Table

| Scale Role | Font Size | Line Height | Weight | Tailwind Class | Usage Location |
|---|---|---|---|---|---|
| **Display Hero** | `26px / 1.625rem` | `32px` | Bold (700) | `text-2xl font-bold` | Onboarding headings, welcome screen |
| **Page Title** | `20px / 1.25rem` | `26px` | Bold (700) | `text-xl font-bold` | Header titles, category page headings |
| **Section Heading** | `18px / 1.125rem` | `24px` | SemiBold (600) | `text-lg font-semibold` | Home feed section headers ("Exclusive Offer") |
| **Product Title** | `16px / 1rem` | `20px` | Bold (700) | `text-base font-bold` | Product card titles, cart item names |
| **Body Regular** | `14px / 0.875rem` | `20px` | Regular (400) | `text-sm font-normal` | Product descriptions, address details |
| **Caption / Subtitle** | `13px / 0.8125rem` | `18px` | Regular (400) | `text-xs text-gray-500` | Unit weights (`1kg, Price`), rating counts |
| **Button Text** | `18px / 1.125rem` | `24px` | SemiBold (600) | `text-lg font-semibold` | Primary green CTA buttons |

---

### 3.3 Elevation, Shadows & Corner Geometry

| Element | Border Radius | Box Shadow | Purpose |
|---|---|---|---|
| **Product Cards** | `rounded-[18px]` | `shadow-sm hover:shadow-md` | Interactive product tiles |
| **Category Cards** | `rounded-[18px]` | `none` | Colored category grid tiles |
| **Primary Buttons** | `rounded-[19px]` | `shadow-md hover:shadow-lg` | Full-width action CTA buttons |
| **Search Input** | `rounded-[15px]` | `none` | Store search input field |
| **Action Stepper** | `rounded-[14px]` | `none` | Quantity `- 1 +` stepper control |
| **Bottom Navigation** | `rounded-t-2xl` (desktop) | `shadow-[0_-4px_20px_rgba(0,0,0,0.06)]` | Fixed bottom bar shell |
| **Bottom Sheet** | `rounded-t-[30px]` | `shadow-2xl` | Overlay drawers and filter sheets |

---

## 4. Key Component Specifications

### 4.1 `ProductCard` ([ProductCard.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/ProductCard.tsx))
- **Container**: White background, `1px solid #E2E2E2` border, `rounded-[18px]`, `p-3.5`.
- **Top Bar**: Wishlist heart button ([IconButton.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/IconButton.tsx)) anchored top-right with `hover:scale-110` micro-animation.
- **Image Area**: `aspect-square` container with `object-contain` center alignment.
- **Content Row**:
  * Title: `16px` bold (`#181725`), truncated at 1 line (`truncate`).
  * Subtitle: `13px` regular (`#7C7C7C`), e.g., `"7pcs, Price"`.
- **Footer Row**:
  * Price: `18px` bold (`#181725`), formatted with `$X.XX` ([currency.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/utils/currency.ts)).
  * Action: `45px × 45px` square button (`rounded-[17px]`), green background (`#53B175`), white `+` icon, active click compression scale (`active:scale-95`).

---

### 4.2 `QuantityStepper` ([QuantityStepper.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/QuantityStepper.tsx))
- **Structure**: Horizontal flex row containing minus button, quantity count, and plus button.
- **Buttons**: `36px × 36px` rounded border buttons (`border border-gray-200 rounded-14px`), disabled state (`opacity-40 cursor-not-allowed`) when quantity equals minimum (1) or maximum available stock.
- **Feedback**: Instant state mutation in `cartStore` with immediate subtotal recalculation.

---

### 4.3 `BottomNav` ([BottomNav.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/BottomNav.tsx))
- **Tabs**: 5 navigation destinations (`Shop`, `Explore`, `Cart`, `Favorites`, `Account`).
- **Active State**: Green icon `#53B175` + green text label.
- **Inactive State**: Charcoal icon `#181725` + gray text label.
- **Cart Badge**: Red notification badge on Cart tab displaying total active item count.

---

## 5. Micro-Interactions & Animation Specs

- **Button Press Feedback**: `transition-transform active:scale-[0.98]` applied to primary CTAs.
- **Sheet Slide Animation**:
  * Entrance: `slide-up 250ms cubic-bezier(0.16, 1, 0.3, 1)`.
  * Backdrop: Fade-in opacity `transition-opacity duration-200 ease-out`.
- **Toast Notifications**: Slide in from top-right corner with 3000ms auto-dismiss countdown ([ToastContext.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/ToastContext.tsx)).

---

## 6. Accessibility & WCAG 2.1 AA Compliance Matrix

| Area | Requirement | Implementation Detail |
|---|---|---|
| **Color Contrast** | Minimum 4.5:1 ratio | Primary green `#53B175` and dark charcoal `#181725` meet WCAG AA contrast standards against white backgrounds. |
| **Touch Targets** | Minimum 44×44px hit box | All interactive buttons, nav items, and steppers enforce minimum 44px hit target padding on mobile. |
| **Focus States** | Visible focus ring | Interactive inputs and buttons utilize `focus-visible:ring-2 focus-visible:ring-emerald-500` for keyboard navigation. |
| **Semantic Markup** | HTML5 landmark elements | Standard `<header>`, `<nav>`, `<main>`, `<section>`, and `<button>` elements used throughout. |
| **Alt Text & Media** | Resilient images | Product images include descriptive `alt` attributes and fallback loading graphics ([ResilientImage.tsx](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/components/ResilientImage.tsx)). |
