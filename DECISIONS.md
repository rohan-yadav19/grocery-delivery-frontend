# Architecture Decisions

This document records key technical decisions made during implementation,
particularly where the assignment explicitly requires documented reasoning.

---

## Persisted Cart Consistency

### Problem

The cart is persisted in `localStorage` via Zustand's `persist` middleware.
When the user returns after a session, the persisted cart data may conflict
with the current product catalogue:

1. A product in the cart may have been removed from the catalogue.
2. A product's price may have changed.
3. A persisted quantity may exceed the product's current stock.

The application must handle all three cases gracefully without displaying
stale data, broken products, or incorrect totals.

### Options Considered

#### Option A — Persist full product snapshots

Store the full product object (name, price, image, stock) alongside each
cart item. On restore, use the snapshot directly.

**Rejected** because:
- Stale prices could silently produce incorrect checkout totals.
- Deleted products would still appear in the UI.
- Requires complex migration logic when the product schema changes.

#### Option B — Persist only product IDs; validate at read time

Store only `{ productId, quantity }` pairs. On every render, look up each
product ID against the current catalogue. Resolve price, stock, and
existence from the live dataset.

**Chosen** because:
- The current product catalogue is always the source of truth.
- No stale data can leak into the UI.
- The validation logic is a pure function (`deriveCartSummary`) that is
  trivially testable.

#### Option C — Background sync on app startup

Run a one-time reconciliation effect on mount that patches the persisted
store, then render from the patched store.

**Considered** as a complement to Option B. The chosen implementation uses
Option B as the primary strategy (derive at render time) and runs a mount
effect to sync corrections back to the persisted store. This ensures the
localStorage data stays clean without adding complexity to the render path.

### Chosen Behavior

**Strategy: ID-only persistence with read-time validation.**

Implemented in `src/services/cartService.ts`:

#### Case A — Product No Longer Exists

The persisted `productId` does not match any product in `products.json`.

**Behavior:**
- The item is silently excluded from the derived `CartSummary`.
- A mount effect removes it from the persisted Zustand store.
- No broken product card is rendered.
- No NaN or undefined values appear in the UI.
- The remaining cart items are unaffected.

**Rationale:** Showing a "product unavailable" ghost card adds UI complexity
with no user value — the product cannot be purchased. Silent removal is the
cleanest approach.

#### Case B — Product Price Changed

The persisted cart does not store prices. Prices are always read from the
current `products.json` at render time via `deriveCartSummary`.

**Behavior:**
- The cart always shows the current price.
- Subtotal and total are always computed from current prices.
- There is no "stale price" scenario because the price is never persisted.

**Rationale:** Prices must be authoritative at checkout. Persisting prices
creates a class of bugs where a user sees one price and is charged another.
By never persisting the price, this bug is structurally impossible.

#### Case C — Invalid Quantity (Exceeds Stock)

A persisted quantity may exceed the product's current `stock` value.

**Behavior:**
- `resolveCartItem` clamps the quantity to `[1, product.stock]`.
- The mount effect syncs the corrected quantity back to the Zustand store.
- The UI immediately reflects the valid quantity.
- The stepper's `max` prop prevents the user from exceeding stock.
- Decrementing to 0 removes the item entirely.

**Rationale:** Clamping to stock prevents overselling. Clamping to 1
(minimum) prevents zero-quantity ghost items. This is consistent with
e-commerce best practices.

### Trade-offs

| Aspect | Benefit | Cost |
|--------|---------|------|
| ID-only persistence | Always fresh data | Extra lookup per render |
| Silent removal of deleted products | Clean UX | User may not notice a product was removed |
| Render-time validation | No stale state possible | Derived state recomputed on every render |
| Mount effect for store sync | Persisted data stays clean | One-time imperative side effect |

The render-time cost of `deriveCartSummary` is negligible for typical cart
sizes (< 50 items). The `useMemo` dependency on `rawItems` ensures it only
recomputes when the cart actually changes.

---

## When Is the Cart Cleared?

### Problem

Clearing the cart at the wrong time can cause data loss. If the cart is
cleared before `placeOrder()` confirms success, a network failure or server
error leaves the user with an empty cart and no order — the worst possible
state.

### Options Considered

#### Option A — Clear before API call

Empty the cart optimistically before sending the order request.

**Rejected** because:
- If `placeOrder()` fails (network error, server 500, payment declined),
  the user loses all cart items with no order created.
- Recovery requires re-adding every item manually.
- Violates the principle of least surprise.

#### Option B — Clear after API success

Wait for `placeOrder()` to resolve successfully, then clear the cart and
navigate to the success screen.

**Chosen** because:
- The cart is only cleared when the backend has confirmed the order.
- On failure, the cart remains intact and the user can retry immediately.
- No data loss scenario exists under normal failure modes.

#### Option C — Never clear automatically

Leave the cart intact even after a successful order and let the user clear
it manually.

**Rejected** because:
- Creates confusing UX where previously-ordered items remain in the cart.
- Users might accidentally re-order the same items.

### Chosen Behavior

**Strategy: Clear only after confirmed successful order.**

Implemented in `src/pages/CheckoutPage.tsx`, `handlePlaceOrder`:

```typescript
try {
  const response = await placeOrder(request);
  // Clear cart ONLY after confirmed success
  clearCart();
  navigate("/order-success", { state: { orderId: response.orderId } });
} catch (err) {
  // Cart is NOT cleared — user can retry
  navigate("/order-failed", { state: { errorMessage: err.message } });
}
```

#### Success Flow

1. `placeOrder()` resolves successfully
2. `clearCart()` empties the Zustand store (and `localStorage` via persist)
3. Navigate to `/order-success`
4. User sees confirmation with Track Order / Back to home actions

#### Failure Flow

1. `placeOrder()` rejects with an error
2. Cart is **not** cleared
3. Navigate to `/order-failed`
4. User sees error with "Please Try Again" → `/checkout` (cart intact)

### Trade-offs

| Aspect | Benefit | Cost |
|--------|---------|------|
| Clear after success | No data loss on failure | A successful order followed by browser crash before navigation could leave stale cart items |
| Navigate to `/order-failed` | Clean separation of concerns | Adds an extra route vs. inline error |
| Cart preserved on failure | Seamless retry experience | User must explicitly clear cart if they abandon the order |

The trade-off of a browser crash between `clearCart()` and `navigate()` is
negligible: the order was still created successfully, and the user would see
the stale cart on next visit but would not be double-charged (the order
service assigns unique IDs).
