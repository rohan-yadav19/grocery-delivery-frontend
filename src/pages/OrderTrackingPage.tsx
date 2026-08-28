import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header, Button, ResilientImage, EmptyState } from "../components";
import {
  CheckIcon,
  LocationIcon,
  BagIcon,
  CartIcon,
  CreditCardIcon,
} from "../components/icons";
import {
  useOrderStore,
  type TrackedOrder,
  type OrderStatus,
} from "../stores/orderStore";
import { formatCurrency } from "../utils/currency";

// ---------------------------------------------------------------------------
// Timeline step definitions
// ---------------------------------------------------------------------------

interface TimelineStep {
  readonly key: OrderStatus;
  readonly title: string;
  readonly description: string;
}

const TIMELINE_STEPS: readonly TimelineStep[] = [
  {
    key: "placed",
    title: "Order Placed",
    description: "Your order has been received",
  },
  {
    key: "confirmed",
    title: "Order Confirmed",
    description: "Your order is verified & confirmed",
  },
  {
    key: "preparing",
    title: "Preparing Order",
    description: "Items are being picked and packed",
  },
  {
    key: "out_for_delivery",
    title: "Out for Delivery",
    description: "Courier is on the way to your address",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "Order delivered successfully",
  },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  placed: 0,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4,
};

// ---------------------------------------------------------------------------
// Helper: Hero data by status
// ---------------------------------------------------------------------------

function getStatusHeroData(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return {
        icon: <CheckIcon size={28} />,
        title: "Order Delivered",
        subtitle: "Delivered successfully. Enjoy your fresh groceries!",
      };
    case "out_for_delivery":
      return {
        icon: <span className="text-2xl" role="img" aria-label="truck">🚚</span>,
        title: "Out for Delivery",
        subtitle: "Courier is on the way to your address.",
      };
    case "preparing":
      return {
        icon: <span className="text-2xl" role="img" aria-label="package">📦</span>,
        title: "Preparing Your Order",
        subtitle: "Items are being carefully picked and packed.",
      };
    case "confirmed":
      return {
        icon: <CheckIcon size={24} />,
        title: "Order Confirmed",
        subtitle: "Your order has been verified and confirmed.",
      };
    case "placed":
    default:
      return {
        icon: <BagIcon size={24} />,
        title: "Order Placed",
        subtitle: "Your order has been received.",
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OrderTrackingLocationState {
  orderId?: string;
  order?: TrackedOrder;
  estimatedDelivery?: string;
}

function OrderTrackingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as OrderTrackingLocationState | null) ?? {};

  const activeOrder = useOrderStore((s) => s.activeOrder);
  const orderHistory = useOrderStore((s) => s.orderHistory);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);

  const [copied, setCopied] = useState(false);

  // Resolve target order: location state -> orderStore activeOrder -> orderHistory lookup -> fallback stub if orderId provided
  const initialOrder = useMemo<TrackedOrder | null>(() => {
    if (state.order) return state.order;
    if (state.orderId) {
      const match =
        orderHistory.find((o) => o.orderId === state.orderId) ??
        (activeOrder?.orderId === state.orderId ? activeOrder : null);
      if (match) return match;

      return {
        orderId: state.orderId,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        deliveryMethod: "Standard Delivery",
        paymentMethod: "Card",
        deliveryAddress: "Delivery Address",
        promoCode: null,
        status: "confirmed",
        estimatedDelivery: state.estimatedDelivery || "30–45 min",
        createdAt: new Date().toISOString(),
      };
    }
    return activeOrder;
  }, [state.order, state.orderId, state.estimatedDelivery, activeOrder, orderHistory]);

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    initialOrder?.status ?? "confirmed",
  );

  // Keep internal status synced if initialOrder updates
  useEffect(() => {
    if (initialOrder?.status) {
      setCurrentStatus(initialOrder.status);
    }
  }, [initialOrder?.status]);

  // Mock progressive status simulation for demonstration
  useEffect(() => {
    if (!initialOrder) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (currentStatus === "placed") {
      timer = setTimeout(() => {
        setCurrentStatus("confirmed");
        updateOrderStatus(initialOrder.orderId, "confirmed");
      }, 2000);
    } else if (currentStatus === "confirmed") {
      timer = setTimeout(() => {
        setCurrentStatus("preparing");
        updateOrderStatus(initialOrder.orderId, "preparing");
      }, 3000);
    } else if (currentStatus === "preparing") {
      timer = setTimeout(() => {
        setCurrentStatus("out_for_delivery");
        updateOrderStatus(initialOrder.orderId, "out_for_delivery");
      }, 3500);
    } else if (currentStatus === "out_for_delivery") {
      timer = setTimeout(() => {
        setCurrentStatus("delivered");
        updateOrderStatus(initialOrder.orderId, "delivered");
      }, 3500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStatus, initialOrder, updateOrderStatus]);

  const handleCopyOrderId = () => {
    if (initialOrder?.orderId) {
      navigator.clipboard?.writeText(initialOrder.orderId).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If no order is available, render empty state
  if (!initialOrder) {
    return (
      <div className="order-tracking-page min-h-screen bg-[var(--color-surface-alt)] flex flex-col">
        <Header title="Track Order" showBack onBack={() => navigate("/")} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
          <EmptyState
            title="Order Not Found"
            description="We couldn't find an active order to track. Please check your order history or start a new order."
            actionLabel="Back to Home"
            onAction={() => navigate("/")}
            icon={
              <span className="text-5xl" aria-hidden="true">
                📦
              </span>
            }
          />
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_ORDER[currentStatus] ?? 1;
  const heroData = getStatusHeroData(currentStatus);

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)] pb-12">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <Header
        title="Track Order"
        showBack
        onBack={() => navigate("/")}
      />

      <main className="order-tracking-page">
        {/* ── Order Reference & Status Pill Subheader ────────────────────────── */}
        <div className="tracking-header-badge-row">
          <div className="flex items-center gap-3">
            <h1
              id="order-info-heading"
              className="text-lg font-bold text-[var(--color-text-primary)] m-0 flex items-center gap-2"
            >
              <span>#{initialOrder.orderId}</span>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="tracking-copy-btn"
                aria-label="Copy Order ID"
                title="Copy Order ID"
              >
                {copied ? "Copied!" : "📋 Copy"}
              </button>
            </h1>
          </div>

          <div className="tracking-status-pill">
            <span
              className={`tracking-status-dot ${
                currentStatus !== "delivered" ? "animate-pulse" : ""
              }`}
              aria-hidden="true"
            />
            <span className="capitalize">
              {TIMELINE_STEPS.find((s) => s.key === currentStatus)?.title ??
                currentStatus}
            </span>
          </div>
        </div>

        {/* ── Responsive Layout Grid ────────────────────────────────────────── */}
        <div className="tracking-layout">
          {/* ── Left Column ─────────────────────────────────────────────────── */}
          <div className="tracking-main">
            {/* 1. Status Hero Card */}
            <section
              className="tracking-hero-card"
              aria-labelledby="hero-status-heading"
            >
              <div
                className="tracking-hero-icon-container"
                aria-hidden="true"
              >
                {heroData.icon}
              </div>
              <h2
                id="hero-status-heading"
                className="tracking-hero-title"
              >
                {heroData.title}
              </h2>
              <p className="tracking-hero-subtitle">{heroData.subtitle}</p>

              <div className="tracking-hero-estimate-badge">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Estimated Delivery:
                </span>
                <span>{initialOrder.estimatedDelivery || "30–45 min"}</span>
              </div>
            </section>

            {/* 2. Visual Progress Timeline */}
            <section
              className="tracking-card"
              aria-labelledby="timeline-heading"
            >
              <div className="tracking-card-header">
                <h2
                  id="timeline-heading"
                  className="tracking-card-title"
                >
                  Delivery Progress
                </h2>
                <span className="text-xs font-semibold text-[var(--color-brand)] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                  Live Updates
                </span>
              </div>

              <div
                className="tracking-timeline"
                role="list"
                aria-label="Order status timeline"
              >
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isUpcoming = idx > currentStepIndex;
                  const isLast = idx === TIMELINE_STEPS.length - 1;

                  return (
                    <div
                      key={step.key}
                      className="tracking-timeline-step"
                      role="listitem"
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {/* Connecting vertical line */}
                      {!isLast && (
                        <div
                          className={`tracking-timeline-line ${
                            idx < currentStepIndex
                              ? "tracking-timeline-line--active"
                              : ""
                          }`}
                          aria-hidden="true"
                        />
                      )}

                      {/* Step Circle Indicator */}
                      <div
                        className={`tracking-timeline-dot ${
                          isCompleted
                            ? "tracking-timeline-dot--completed"
                            : isCurrent
                              ? "tracking-timeline-dot--current"
                              : "tracking-timeline-dot--upcoming"
                        }`}
                        aria-label={`Step ${idx + 1}: ${step.title} (${
                          isCompleted
                            ? "Completed"
                            : isCurrent
                              ? "Current step"
                              : "Pending"
                        })`}
                      >
                        {isCompleted ? (
                          <CheckIcon size={16} />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="tracking-timeline-content">
                        <div className="tracking-timeline-title-row">
                          <h3
                            className={`tracking-timeline-step-title ${
                              isCurrent
                                ? "tracking-timeline-step-title--current"
                                : isUpcoming
                                  ? "tracking-timeline-step-title--upcoming"
                                  : ""
                            }`}
                          >
                            {step.title}
                          </h3>
                          {isCurrent && (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#E8F5E9] text-[var(--color-brand)] rounded-full">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="tracking-timeline-step-desc">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Delivery & Payment Details Card */}
            <section
              className="tracking-card"
              aria-labelledby="delivery-heading"
            >
              <h2
                id="delivery-heading"
                className="tracking-card-title mb-4"
              >
                Delivery & Payment Details
              </h2>

              <div className="tracking-details-list">
                {/* Delivery address */}
                <div className="tracking-detail-row">
                  <div className="tracking-detail-icon-badge" aria-hidden="true">
                    <LocationIcon size={18} />
                  </div>
                  <div className="tracking-detail-info">
                    <span className="tracking-detail-label">
                      Delivery Address
                    </span>
                    <span className="tracking-detail-value">
                      {initialOrder.deliveryAddress}
                    </span>
                  </div>
                </div>

                {/* Delivery method */}
                <div className="tracking-detail-row">
                  <div className="tracking-detail-icon-badge" aria-hidden="true">
                    <CartIcon size={18} />
                  </div>
                  <div className="tracking-detail-info">
                    <span className="tracking-detail-label">
                      Delivery Method
                    </span>
                    <span className="tracking-detail-value">
                      {initialOrder.deliveryMethod}
                    </span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="tracking-detail-row">
                  <div className="tracking-detail-icon-badge" aria-hidden="true">
                    <CreditCardIcon size={18} />
                  </div>
                  <div className="tracking-detail-info">
                    <span className="tracking-detail-label">
                      Payment Method
                    </span>
                    <span className="tracking-detail-value">
                      {initialOrder.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── Right Column (Sidebar on Desktop) ───────────────────────────── */}
          <div className="tracking-sidebar">
            {/* 4. Order Items Card */}
            <section
              className="tracking-card"
              aria-labelledby="items-heading"
            >
              <div className="tracking-card-header">
                <h2
                  id="items-heading"
                  className="tracking-card-title"
                >
                  <BagIcon size={18} />
                  <span>Items in Order</span>
                </h2>
                <span className="text-xs font-bold text-[var(--color-brand)] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                  {initialOrder.items.length}{" "}
                  {initialOrder.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div
                className="tracking-items-list"
                role="list"
                aria-label="Ordered products"
              >
                {initialOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="tracking-item-row"
                    role="listitem"
                  >
                    <div className="tracking-item-left">
                      <div className="tracking-item-img">
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="tracking-item-info">
                        <h3 className="tracking-item-name">
                          {item.name}
                        </h3>
                        <p className="tracking-item-meta">
                          {item.unit} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <span className="tracking-item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Price Breakdown Summary Card */}
            <section
              className="tracking-card"
              aria-label="Order Price Summary"
            >
              <h2 className="tracking-card-title mb-4">Price Summary</h2>

              <div className="tracking-price-rows">
                <div className="tracking-price-row">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formatCurrency(initialOrder.subtotal)}
                  </span>
                </div>
                <div className="tracking-price-row">
                  <span>Delivery Fee</span>
                  <span
                    className={
                      initialOrder.deliveryFee === 0
                        ? "text-[var(--color-brand)] font-semibold"
                        : "font-semibold text-[var(--color-text-primary)]"
                    }
                  >
                    {initialOrder.deliveryFee === 0
                      ? "Free"
                      : formatCurrency(initialOrder.deliveryFee)}
                  </span>
                </div>
                {initialOrder.discount > 0 && (
                  <div className="tracking-price-row text-[var(--color-brand)] font-semibold">
                    <span>Discount {initialOrder.promoCode ? `(${initialOrder.promoCode})` : ""}</span>
                    <span>-{formatCurrency(initialOrder.discount)}</span>
                  </div>
                )}

                <div className="tracking-price-row tracking-price-row--total">
                  <span>Total Paid</span>
                  <span className="tracking-price-total-val">
                    {formatCurrency(initialOrder.total)}
                  </span>
                </div>
              </div>
            </section>

            {/* 6. Action Buttons */}
            <div className="tracking-actions">
              <Button
                onClick={() => navigate("/")}
                className="w-full py-4 text-base font-bold rounded-[var(--radius-button)]"
                aria-label="Back to Home"
              >
                Back to Home
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate("/explore")}
                className="w-full py-4 text-base font-bold rounded-[var(--radius-button)]"
                aria-label="Continue Shopping"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderTrackingPage;

