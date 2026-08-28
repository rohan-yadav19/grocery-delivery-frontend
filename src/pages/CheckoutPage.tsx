import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Button, EmptyState, ResilientImage } from "../components";
import {
  ForwardIcon,
  CartIcon,
  LocationIcon,
  CheckIcon,
  CreditCardIcon,
} from "../components/icons";
import { useCartStore } from "../stores/cartStore";
import { useSessionStore } from "../stores/sessionStore";
import { useOrderStore, type TrackedOrder } from "../stores/orderStore";
import { deriveCartSummary, getDeliveryFee } from "../services/cartService";
import {
  placeOrder,
  validatePromoCode,
  type PlaceOrderRequest,
} from "../services/orderService";
import { toOrderItem } from "../types";
import { formatCurrency } from "../utils/currency";

// ---------------------------------------------------------------------------
// Delivery & payment options
// ---------------------------------------------------------------------------

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "30–45 min",
    badge: "FREE",
    fee: 0,
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "15–20 min",
    badge: "$2.99",
    fee: 2.99,
  },
] as const;

const PAYMENT_OPTIONS = [
  {
    id: "cash",
    label: "Cash on Delivery",
    description: "Pay when your order arrives (Cash / UPI)",
    icon: "💵",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Secure online payment (Visa, Mastercard)",
    icon: "💳",
  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CheckoutPage() {
  const navigate = useNavigate();

  // ── Cart data ──────────────────────────────────────────────────────────
  const rawItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const summary = useMemo(() => deriveCartSummary(rawItems), [rawItems]);

  const sessionAddress = useSessionStore((s) => s.deliveryAddress);

  // ── Checkout form state ────────────────────────────────────────────────
  const [address, setAddress] = useState(
    sessionAddress || "123 Main Street, Apt 4B",
  );
  const [editingAddress, setEditingAddress] = useState(false);
  const [delivery, setDelivery] = useState("");
  const [payment, setPayment] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    label: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");

  // ── Submission state ───────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ── Expanding sections (all open by default for rich visual scan, toggleable) ─
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (id: string) =>
    setExpandedSection((prev) => (prev === id ? null : id));

  // ── Derived totals ─────────────────────────────────────────────────────
  const selectedDeliveryOption = DELIVERY_OPTIONS.find((d) => d.id === delivery);
  const deliveryFee =
    selectedDeliveryOption?.fee ?? getDeliveryFee(summary.subtotal);
  const discountAmount = appliedPromo
    ? summary.subtotal * appliedPromo.discount
    : 0;
  const total = summary.subtotal + deliveryFee - discountAmount;

  // ── Promo handler ──────────────────────────────────────────────────────
  const handleApplyPromo = useCallback(() => {
    setPromoError("");
    const trimmed = promoInput.trim();
    if (!trimmed) return;

    const result = validatePromoCode(trimmed);
    if (result) {
      setAppliedPromo({ code: trimmed.toUpperCase(), ...result });
      setPromoError("");
    } else {
      setAppliedPromo(null);
      setPromoError("Invalid promo code");
    }
  }, [promoInput]);

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: string[] = [];
    if (!address.trim()) errors.push("Delivery address is required");
    if (!delivery) errors.push("Please select a delivery method");
    if (!payment) errors.push("Please select a payment method");
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // ── Submit order ───────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setOrderError("");
    if (!validate()) return;
    if (isSubmitting) return; // prevent double-submit

    setIsSubmitting(true);

    const request: PlaceOrderRequest = {
      items: summary.items.map(toOrderItem),
      subtotal: summary.subtotal,
      deliveryFee,
      discount: discountAmount,
      total,
      deliveryMethod: delivery,
      paymentMethod: payment,
      deliveryAddress: address,
      promoCode: appliedPromo?.code ?? null,
    };

    try {
      const response = await placeOrder(request);

      const fullOrder: TrackedOrder = {
        orderId: response.orderId,
        items: summary.items.map((i) => ({
          id: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          unit: i.unit,
        })),
        subtotal: summary.subtotal,
        deliveryFee,
        discount: discountAmount,
        total,
        deliveryMethod:
          DELIVERY_OPTIONS.find((d) => d.id === delivery)?.label ?? delivery,
        paymentMethod:
          PAYMENT_OPTIONS.find((p) => p.id === payment)?.label ?? payment,
        deliveryAddress: address,
        promoCode: appliedPromo?.code ?? null,
        status: "confirmed",
        estimatedDelivery: response.estimatedDelivery,
        createdAt: new Date().toISOString(),
      };

      useOrderStore.getState().setActiveOrder(fullOrder);
      // Clear cart ONLY after confirmed success, then navigate
      clearCart();
      navigate("/order-success", {
        state: {
          orderId: response.orderId,
          estimatedDelivery: response.estimatedDelivery,
          order: fullOrder,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setOrderError(message);
      navigate("/order-failed", {
        state: { errorMessage: message },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Empty cart → redirect ──────────────────────────────────────────────
  if (summary.items.length === 0) {
    return (
      <>
        <Header title="Checkout" showBack onBack={() => navigate("/cart")} />
        <div className="checkout-page">
          <EmptyState
            icon={<CartIcon size={48} />}
            title="Your Cart is Empty"
            description="Add items to your cart before checking out."
            actionLabel="Continue Shopping"
            onAction={() => navigate("/")}
          />
        </div>
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <Header
        title="Checkout"
        showBack
        onBack={() => navigate("/cart")}
      />

      <div className="checkout-page">
        {/* ── Progress Indicator ──────────────────────────────────── */}
        <nav className="checkout-progress" aria-label="Checkout progress">
          <div className="checkout-progress-step checkout-progress-step--completed">
            <div className="checkout-progress-dot">
              <CheckIcon size={12} />
            </div>
            <span className="checkout-progress-label">Cart</span>
          </div>
          <div className="checkout-progress-line checkout-progress-line--active" />
          <div className="checkout-progress-step checkout-progress-step--active">
            <div className="checkout-progress-dot">
              <span className="checkout-progress-bullet" />
            </div>
            <span className="checkout-progress-label">Delivery</span>
          </div>
          <div className="checkout-progress-line" />
          <div className="checkout-progress-step checkout-progress-step--upcoming">
            <div className="checkout-progress-dot">
              <CreditCardIcon size={12} />
            </div>
            <span className="checkout-progress-label">Payment</span>
          </div>
        </nav>

        <div className="checkout-layout">
          {/* ── Main checkout options (Left column on desktop) ────── */}
          <div className="checkout-main">
            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="checkout-validation" role="alert">
                {validationErrors.map((e) => (
                  <p key={e} className="checkout-validation-msg">
                    {e}
                  </p>
                ))}
              </div>
            )}

            {/* Order error */}
            {orderError && (
              <div className="checkout-error" role="alert">
                <p className="checkout-error-msg">{orderError}</p>
                <button
                  type="button"
                  className="checkout-error-retry"
                  onClick={handlePlaceOrder}
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── 1. Delivery Address Card ─────────────────────────── */}
            <section className="checkout-section-card" aria-label="Delivery Address">
              <button
                type="button"
                className="checkout-row"
                onClick={() => toggleSection("address")}
                aria-expanded={expandedSection === "address"}
              >
                <div className="checkout-row-left">
                  <div className="checkout-section-icon-badge" aria-hidden="true">
                    <LocationIcon size={18} />
                  </div>
                  <div className="checkout-row-info">
                    <span className="checkout-row-label">Delivery Address</span>
                    <span className="checkout-row-value">{address || "Set address"}</span>
                  </div>
                </div>
                <ForwardIcon
                  size={18}
                  className={`checkout-row-arrow ${expandedSection === "address" ? "checkout-row-arrow-down" : ""}`}
                />
              </button>

              {expandedSection === "address" && (
                <div className="checkout-section-body">
                  {editingAddress ? (
                    <div className="checkout-address-edit">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="checkout-input"
                        placeholder="Enter delivery address"
                        aria-label="Delivery address"
                        autoFocus
                      />
                      <Button
                        variant="secondary"
                        fullWidth={false}
                        onClick={() => setEditingAddress(false)}
                      >
                        Done
                      </Button>
                    </div>
                  ) : (
                    <div className="checkout-address-display">
                      <div className="checkout-address-text">
                        <span className="font-bold block text-sm text-[var(--color-text-primary)] mb-1">
                          Home
                        </span>
                        <span>{address}</span>
                      </div>
                      <button
                        type="button"
                        className="checkout-link-btn"
                        onClick={() => setEditingAddress(true)}
                      >
                        Change →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── 2. Delivery Method Selection ─────────────────────── */}
            <section className="checkout-section-card" aria-label="Delivery Method">
              <button
                type="button"
                className="checkout-row"
                onClick={() => toggleSection("delivery")}
                aria-expanded={expandedSection === "delivery"}
              >
                <div className="checkout-row-left">
                  <div className="checkout-section-icon-badge" aria-hidden="true">
                    <CartIcon size={18} />
                  </div>
                  <div className="checkout-row-info">
                    <span className="checkout-row-label">Delivery</span>
                    <span className="checkout-row-value">
                      {selectedDeliveryOption?.label ?? "Select Method"}
                    </span>
                  </div>
                </div>
                <ForwardIcon
                  size={18}
                  className={`checkout-row-arrow ${expandedSection === "delivery" ? "checkout-row-arrow-down" : ""}`}
                />
              </button>

              {expandedSection === "delivery" && (
                <fieldset className="checkout-section-body checkout-fieldset">
                  <legend className="sr-only">Delivery method</legend>
                  <div className="checkout-options-grid">
                    {DELIVERY_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className={`checkout-option-card ${
                          delivery === opt.id ? "checkout-option-card--selected" : ""
                        }`}
                      >
                        <div className="checkout-option-left">
                          <input
                            type="radio"
                            name="delivery"
                            value={opt.id}
                            checked={delivery === opt.id}
                            onChange={() => setDelivery(opt.id)}
                            className="checkout-radio"
                          />
                          <div className="checkout-option-info">
                            <span className="checkout-option-title">{opt.label}</span>
                            <span className="checkout-option-desc">{opt.description}</span>
                          </div>
                        </div>
                        <span
                          className={`checkout-option-badge ${
                            opt.fee === 0 ? "checkout-option-badge--free" : ""
                          }`}
                        >
                          {opt.fee === 0 ? "FREE" : formatCurrency(opt.fee)}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </section>

            {/* ── 3. Payment Method Selection ──────────────────────── */}
            <section className="checkout-section-card" aria-label="Payment Method">
              <button
                type="button"
                className="checkout-row"
                onClick={() => toggleSection("payment")}
                aria-expanded={expandedSection === "payment"}
              >
                <div className="checkout-row-left">
                  <div className="checkout-section-icon-badge" aria-hidden="true">
                    <CreditCardIcon size={18} />
                  </div>
                  <div className="checkout-row-info">
                    <span className="checkout-row-label">Payment</span>
                    <span className="checkout-row-value">
                      {PAYMENT_OPTIONS.find((p) => p.id === payment)?.label ??
                        "Select Payment"}
                    </span>
                  </div>
                </div>
                <ForwardIcon
                  size={18}
                  className={`checkout-row-arrow ${expandedSection === "payment" ? "checkout-row-arrow-down" : ""}`}
                />
              </button>

              {expandedSection === "payment" && (
                <fieldset className="checkout-section-body checkout-fieldset">
                  <legend className="sr-only">Payment method</legend>
                  <div className="checkout-options-grid">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className={`checkout-option-card ${
                          payment === opt.id ? "checkout-option-card--selected" : ""
                        }`}
                      >
                        <div className="checkout-option-left">
                          <input
                            type="radio"
                            name="payment"
                            value={opt.id}
                            checked={payment === opt.id}
                            onChange={() => setPayment(opt.id)}
                            className="checkout-radio"
                          />
                          <div className="checkout-option-info">
                            <span className="checkout-option-title">
                              <span className="mr-1.5" aria-hidden="true">
                                {opt.icon}
                              </span>
                              {opt.label}
                            </span>
                            <span className="checkout-option-desc">
                              {opt.description}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </section>

            {/* ── 4. Promo Code ────────────────────────────────────── */}
            <section className="checkout-section-card" aria-label="Promo Code">
              <button
                type="button"
                className="checkout-row"
                onClick={() => toggleSection("promo")}
                aria-expanded={expandedSection === "promo"}
              >
                <div className="checkout-row-left">
                  <div className="checkout-section-icon-badge" aria-hidden="true">
                    <span className="text-sm font-bold">%</span>
                  </div>
                  <div className="checkout-row-info">
                    <span className="checkout-row-label">Promo Code</span>
                    <span className="checkout-row-value">
                      {appliedPromo
                        ? `${appliedPromo.code} (${appliedPromo.label})`
                        : "Pick discount"}
                    </span>
                  </div>
                </div>
                <ForwardIcon
                  size={18}
                  className={`checkout-row-arrow ${expandedSection === "promo" ? "checkout-row-arrow-down" : ""}`}
                />
              </button>

              {expandedSection === "promo" && (
                <div className="checkout-section-body">
                  {appliedPromo ? (
                    <div className="checkout-promo-applied">
                      <span className="checkout-promo-tag">
                        ✓ {appliedPromo.code} — {appliedPromo.label}
                      </span>
                      <button
                        type="button"
                        className="checkout-link-btn checkout-promo-remove"
                        onClick={handleRemovePromo}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="checkout-promo-form">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          setPromoError("");
                        }}
                        placeholder="Enter promo code"
                        className="checkout-input"
                        aria-label="Promo code"
                        aria-describedby={promoError ? "promo-error" : undefined}
                      />
                      <Button
                        variant="secondary"
                        fullWidth={false}
                        onClick={handleApplyPromo}
                        className="checkout-promo-apply-btn"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  {promoError && (
                    <p id="promo-error" className="checkout-promo-error" role="alert">
                      {promoError}
                    </p>
                  )}
                  <p className="checkout-promo-hint">Try: FRESH10 or SAVE5</p>
                </div>
              )}
            </section>

            {/* ── Terms ───────────────────────────────────────────── */}
            <p className="checkout-terms">
              By placing an order you agree to our{" "}
              <strong>Terms</strong> and <strong>Conditions</strong>
            </p>
          </div>

          {/* ── Order Summary Card (Right column on desktop) ──────── */}
          <aside className="checkout-summary" aria-label="Order Summary">
            <div className="checkout-summary-title-row">
              <h3 className="checkout-summary-title">Order Summary</h3>
              <span className="checkout-summary-badge">
                {summary.itemCount} {summary.itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Product items list with images */}
            <div className="checkout-summary-items" aria-label="Ordered items">
              {summary.items.map((item) => (
                <div key={item.productId} className="checkout-summary-item">
                  <div className="checkout-summary-item-img">
                    <ResilientImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="checkout-summary-item-info">
                    <h4 className="checkout-summary-item-name">{item.name}</h4>
                    <span className="checkout-summary-item-qty">
                      {item.unit} × {item.quantity}
                    </span>
                  </div>
                  <span className="checkout-summary-item-price">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-summary-divider" />

            {/* Price breakdown */}
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Delivery</span>
              <span
                className={
                  deliveryFee === 0
                    ? "text-[var(--color-brand)] font-semibold"
                    : "font-semibold"
                }
              >
                {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="checkout-summary-row checkout-discount">
                <span>Discount ({appliedPromo?.label})</span>
                <span className="text-[var(--color-brand)] font-semibold">
                  −{formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row checkout-summary-total">
              <div>
                <span className="text-base font-bold text-[var(--color-text-primary)] block">
                  Total Cost
                </span>
                <span className="block text-[11px] text-[var(--color-text-secondary)] font-normal">
                  Inclusive of all taxes
                </span>
              </div>
              <span className="text-xl font-bold text-[var(--color-text-primary)]">
                {formatCurrency(total)}
              </span>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="checkout-place-order-btn"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Placing Order…" : "Place Order"}
            </Button>
          </aside>
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;

