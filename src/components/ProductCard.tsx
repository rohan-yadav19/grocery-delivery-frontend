import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, CheckIcon } from "./icons";
import { ResilientImage } from "./ResilientImage";
import { useCartStore } from "../stores/cartStore";
import { useToast } from "./ToastContext";
import { formatCurrency } from "../utils/currency";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

/**
 * Vertical product card matching the Figma spec.
 *
 * - White card with #E2E2E2 border, rounded-[18px]
 * - Product image, name (2-line clamp), unit, price
 * - Discount badge + strikethrough original price when `originalPrice` is set
 * - Green "+" add-to-cart action button with immediate checkmark feedback
 * - Links to /product/:id
 */
export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const getQuantity = useCartStore((s) => s.getQuantity);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    const currentQty = getQuantity(product.id);
    if (product.stock != null && currentQty >= product.stock) {
      showToast({
        productName: product.name,
        message: "has reached maximum available stock",
        type: "warning",
        actionText: "View Cart",
        actionTo: "/cart",
      });
      return;
    }

    addItem(product.id);

    // Immediate button & card feedback
    setIsAdded(true);
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    resetTimeoutRef.current = setTimeout(() => {
      setIsAdded(false);
    }, 1200);

    showToast({
      productName: product.name,
      message: "added to cart",
      type: "success",
      actionText: "View Cart",
      actionTo: "/cart",
    });
  };

  // Compute discount percentage when originalPrice exists
  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100,
      )
    : 0;

  return (
    <article
      className={`product-card ${isAdded ? "product-card--added" : ""}`}
      data-testid={`product-card-${product.id}`}
    >
      {/* Product image container */}
      <Link
        to={`/product/${product.id}`}
        className="product-card__image-wrap"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="product-card__image">
          <ResilientImage
            src={product.image}
            alt={product.name}
            className="product-card__img"
          />
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="product-card__discount-badge" aria-label={`${discountPercent}% off`}>
            {discountPercent}% OFF
          </span>
        )}
      </Link>

      {/* Product info */}
      <div className="product-card__content">
        <Link
          to={`/product/${product.id}`}
          className="product-card__title-link"
        >
          <h3 className="product-card__name">
            {product.name}
          </h3>
          <p className="product-card__unit">
            {product.unit}
          </p>
        </Link>

        {/* Bottom row: Price + Add button */}
        <div className="product-card__bottom">
          <div className="product-card__price-group">
            <span className={`product-card__price ${hasDiscount ? "product-card__price--sale" : ""}`}>
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="product-card__original-price">
                {formatCurrency(product.originalPrice!)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`product-card__add-btn ${
              isAdded ? "product-card__add-btn--success" : ""
            }`}
            aria-label={
              isAdded
                ? `${product.name} added to cart`
                : `Add ${product.name} to cart`
            }
          >
            {isAdded ? (
              <CheckIcon size={18} />
            ) : (
              <PlusIcon size={18} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
