import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  QuantityStepper,
  Button,
  EmptyState,
  ResilientImage,
} from "../components";
import { CartIcon, CloseIcon } from "../components/icons";
import { useCartStore } from "../stores/cartStore";
import { deriveCartSummary, getDeliveryFee } from "../services/cartService";
import { formatCurrency } from "../utils/currency";

/**
 * Cart page matching My Cart.png.
 *
 * Uses `deriveCartSummary` to validate persisted cart items against
 * current product data on every render:
 * - Missing products → filtered out
 * - Prices → always from current dataset
 * - Quantities → clamped to current stock
 */
function CartPage() {
  const navigate = useNavigate();

  // ── Raw Zustand state ─────────────────────────────────────────────────────

  const rawItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  // ── Derived validated summary ─────────────────────────────────────────────

  const summary = useMemo(() => deriveCartSummary(rawItems), [rawItems]);
  const deliveryFee = getDeliveryFee(summary.subtotal);
  const total = summary.subtotal + deliveryFee;

  // ── Sync corrections back to the store ────────────────────────────────────
  // If any items were dropped (product deleted) or quantities clamped,
  // update the persisted store to keep it consistent.

  useEffect(() => {
    const validIds = new Set(summary.items.map((li) => li.productId));

    for (const raw of rawItems) {
      // Remove products that no longer exist
      if (!validIds.has(raw.productId)) {
        removeItem(raw.productId);
        continue;
      }
      // Clamp persisted quantities that exceed stock
      const resolved = summary.items.find((li) => li.productId === raw.productId);
      if (resolved && resolved.quantity !== raw.quantity) {
        setQuantity(raw.productId, resolved.quantity);
      }
    }
    // Only run once on mount (or when rawItems changes structurally)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Empty cart ────────────────────────────────────────────────────────────

  if (summary.items.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page-title">My Cart</h1>
        <EmptyState
          icon={<CartIcon size={48} />}
          title="Your Cart is Empty"
          description="Looks like you haven't added anything yet. Start shopping and add items to your cart."
          actionLabel="Continue Shopping"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  // ── Cart with items ───────────────────────────────────────────────────────

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">My Cart</h1>

      <div className="cart-layout">
        {/* ── Item list ─────────────────────────────────────────────────── */}
        <div className="cart-items" role="list" aria-label="Cart items">
          {summary.items.map((item) => (
            <div key={item.productId} className="cart-item" role="listitem">
              {/* Product image */}
              <div className="cart-item-image">
                <ResilientImage
                  src={item.image}
                  alt={item.name}
                />
              </div>

              {/* Info + controls */}
              <div className="cart-item-body">
                <div className="cart-item-header">
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-unit">{item.unit}</p>
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>

                <div className="cart-item-controls">
                  <QuantityStepper
                    value={item.quantity}
                    min={0}
                    max={item.stock}
                    onIncrement={() => addItem(item.productId)}
                    onDecrement={() => decrementItem(item.productId)}
                  />
                  <span className="cart-item-price">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary ─────────────────────────────────────────────── */}
        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
          </div>
          <div className="cart-summary-divider" />
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Button onClick={() => navigate("/checkout")} className="cart-checkout-btn">
            Go to Checkout
            <span className="cart-checkout-total">{formatCurrency(total)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
