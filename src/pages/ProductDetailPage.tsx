import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResilientImage } from "../components/ResilientImage";
import { Accordion, QuantityStepper, RatingStars, Button, ErrorState } from "../components";
import { BackIcon, ShareIcon, HeartIcon } from "../components/icons";
import { getProductById } from "../services/productService";
import { useCartStore } from "../stores/cartStore";
import { useFavoriteStore } from "../stores/favoriteStore";
import { formatCurrency } from "../utils/currency";

/**
 * Product Detail page matching the Figma reference.
 *
 * Sections:
 * 1. Hero image area with back + share actions
 * 2. Product name + favorite toggle
 * 3. Unit info
 * 4. Quantity stepper + price
 * 5. "Product Detail" accordion (description)
 * 6. "Nutritions" accordion
 * 7. "Review" accordion with star rating
 * 8. "Add To Basket" CTA
 *
 * Desktop: two-column layout (image | info)
 * Mobile: stacked with sticky bottom CTA
 */
function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────────────────

  const product = useMemo(
    () => (productId ? getProductById(productId) : undefined),
    [productId],
  );

  // ── Local state ───────────────────────────────────────────────────────────

  const [quantity, setQuantity] = useState(1);

  // ── Stores ────────────────────────────────────────────────────────────────


  const setCartQuantity = useCartStore((s) => s.setQuantity);
  const isFavorite = useFavoriteStore((s) => (product ? s.isFavorite(product.id) : false));
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToBasket = () => {
    if (!product) return;
    setCartQuantity(product.id, quantity);
    // Brief visual feedback could be added here in a future step
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ── Invalid product ───────────────────────────────────────────────────────

  if (!productId || !product) {
    return (
      <div className="pdp-shell">
        <header className="pdp-top-bar">
          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="pdp-icon-btn"
            aria-label="Go back"
          >
            <BackIcon size={24} />
          </button>
          <div className="w-10" />
        </header>
        <ErrorState
          title="Product Not Found"
          description="The product you're looking for doesn't exist or may have been removed."
          retryLabel="Browse Products"
          onRetry={() => navigate("/explore")}
          secondaryLabel="Back to Home"
          onSecondary={() => navigate("/")}
        />
      </div>
    );
  }

  // ── Valid product ─────────────────────────────────────────────────────────

  return (
    <div className="pdp-shell">
      <div className="pdp-layout">
        {/* ── Left column: Image hero ──────────────────────────────── */}
        <div className="pdp-image-section">
          {/* Top bar: back + share */}
          <header className="pdp-top-bar">
            <button
              type="button"
              onClick={handleBack}
              className="pdp-icon-btn"
              aria-label="Go back"
            >
              <BackIcon size={24} />
            </button>
            <button
              type="button"
              className="pdp-icon-btn"
              aria-label="Share product"
            >
              <ShareIcon size={22} />
            </button>
          </header>

          {/* Product image */}
          <div className="pdp-image-container">
            <ResilientImage
              src={product.image}
              alt={product.name}
              className="pdp-image"
              loading="eager"
            />
          </div>
        </div>

        {/* ── Right column: Product info ───────────────────────────── */}
        <div className="pdp-info-section">
          {/* Name + favorite */}
          <div className="pdp-name-row">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] m-0 flex-1">
              {product.name}
            </h1>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className="pdp-icon-btn shrink-0"
              aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
              aria-pressed={isFavorite}
            >
              <HeartIcon
                size={24}
                className={isFavorite ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]"}
                style={isFavorite ? { fill: "var(--color-error)" } : undefined}
              />
            </button>
          </div>

          {/* Unit / weight */}
          <p className="text-sm text-[var(--color-text-secondary)] m-0 mt-1">
            {product.unit}
            {product.brand && `, ${product.brand}`}
          </p>

          {/* Quantity + Price */}
          <div className="pdp-qty-price-row">
            <QuantityStepper
              value={quantity}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              min={1}
              max={product.stock}
            />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {formatCurrency(product.price * quantity)}
            </span>
          </div>

          {/* ── Accordion sections ─────────────────────────────────── */}
          <div className="pdp-accordions">
            {/* Product Detail */}
            <Accordion title="Product Detail" defaultExpanded>
              <p className="m-0">{product.description}</p>
            </Accordion>

            {/* Nutritions */}
            <Accordion
              title="Nutritions"
              headerRight={
                <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-input-bg)] px-2 py-1 rounded">
                  {product.unit}
                </span>
              }
            >
              <p className="m-0">
                Nutritional information for {product.name}. Values per serving based on {product.unit}.
              </p>
            </Accordion>

            {/* Review */}
            <Accordion
              title="Review"
              headerRight={
                product.rating ? (
                  <RatingStars rating={product.rating.average} size={18} />
                ) : undefined
              }
            >
              {product.rating ? (
                <div>
                  <p className="m-0 mb-2">
                    Average rating: <strong>{product.rating.average.toFixed(1)}</strong> / 5
                  </p>
                  <p className="m-0 text-xs text-[var(--color-text-secondary)]">
                    Based on {product.rating.count} reviews
                  </p>
                </div>
              ) : (
                <p className="m-0">No reviews yet.</p>
              )}
            </Accordion>
          </div>

          {/* ── Add to Basket (desktop: inline) ────────────────────── */}
          <div className="pdp-add-desktop">
            <Button onClick={handleAddToBasket}>
              Add To Basket
            </Button>
          </div>
        </div>
      </div>

      {/* ── Add to Basket (mobile: sticky bottom) ──────────────────── */}
      <div className="pdp-add-mobile">
        <Button onClick={handleAddToBasket}>
          Add To Basket
        </Button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
