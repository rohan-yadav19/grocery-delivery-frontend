import { useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, EmptyState, ResilientImage } from "../components";
import { HeartIcon, ForwardIcon, CartIcon } from "../components/icons";
import { useFavoriteStore } from "../stores/favoriteStore";
import { useCartStore } from "../stores/cartStore";
import { getAllProducts } from "../services/productService";
import { formatCurrency } from "../utils/currency";
import type { Product } from "../types";

/**
 * Favourites screen matching Favorites.png from Figma UI kit.
 *
 * - Renders list of saved favourite products with image, name, unit, price, and navigation.
 * - Allows removing / toggling individual favourites.
 * - Supports bulk "Add All To Cart".
 * - Graceful empty state when no items are favorited.
 * - Resilient cleanup of any persisted product IDs no longer in catalogue.
 */
function FavoritesPage() {
  const navigate = useNavigate();
  const [addedNotice, setAddedNotice] = useState(false);

  // ── Stores ────────────────────────────────────────────────────────────────
  const favoriteIds = useFavoriteStore((s) => s.favoriteIds);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const addItem = useCartStore((s) => s.addItem);

  // ── Resolve products against catalogue ────────────────────────────────────
  const allProducts = useMemo(() => getAllProducts(), []);
  const productMap = useMemo(
    () => new Map<string, Product>(allProducts.map((p) => [p.id, p])),
    [allProducts],
  );

  const favoriteProducts = useMemo(() => {
    return favoriteIds
      .map((id) => productMap.get(id))
      .filter((p): p is Product => p !== undefined);
  }, [favoriteIds, productMap]);

  // ── Clean up missing products from store ──────────────────────────────────
  useEffect(() => {
    for (const id of favoriteIds) {
      if (!productMap.has(id)) {
        toggleFavorite(id);
      }
    }
  }, [favoriteIds, productMap, toggleFavorite]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    for (const product of favoriteProducts) {
      addItem(product.id);
    }
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      navigate("/cart");
    }, 400);
  };

  // ── Empty State ───────────────────────────────────────────────────────────
  if (favoriteProducts.length === 0) {
    return (
      <div className="favorites-page">
        <h1 className="favorites-page-title">Favourites</h1>
        <EmptyState
          icon={<HeartIcon size={48} />}
          title="No Favourites Yet"
          description="Looks like you haven't saved any favourite items yet. Tap the heart icon on any product to save it here."
          actionLabel="Explore Products"
          onAction={() => navigate("/explore")}
        />
      </div>
    );
  }

  // ── Populated Favourites ──────────────────────────────────────────────────
  return (
    <div className="favorites-page">
      <h1 className="favorites-page-title">Favourites</h1>

      <div className="favorites-list" role="list" aria-label="Favourite products">
        {favoriteProducts.map((product) => (
          <div
            key={product.id}
            className="favorites-item"
            role="listitem"
          >
            {/* Product image */}
            <Link
              to={`/product/${product.id}`}
              className="favorites-item-image"
              aria-label={`View ${product.name}`}
            >
              <ResilientImage
                src={product.image}
                alt={product.name}
              />
            </Link>

            {/* Product info */}
            <div className="favorites-item-body">
              <Link
                to={`/product/${product.id}`}
                className="favorites-item-name"
              >
                {product.name}
              </Link>
              <p className="favorites-item-unit">{product.unit}</p>
            </div>

            {/* Price, Favorite toggle & navigation arrow */}
            <div className="favorites-item-right">
              <span className="favorites-item-price">
                {formatCurrency(product.price)}
              </span>

              {/* Heart toggle button to remove */}
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className="favorites-item-heart-btn"
                aria-label={`Remove ${product.name} from favourites`}
                title="Remove from favourites"
              >
                <HeartIcon size={20} fill="currentColor" />
              </button>

              {/* Detail link */}
              <Link
                to={`/product/${product.id}`}
                className="favorites-item-arrow"
                aria-label={`Open ${product.name} details`}
              >
                <ForwardIcon size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sticky / bottom "Add All To Cart" CTA ──────────────────────────── */}
      <div className="favorites-cta-container">
        <Button
          onClick={handleAddAllToCart}
          className="favorites-add-all-btn"
          aria-label="Add all favourites to cart"
        >
          <CartIcon size={20} />
          {addedNotice ? "Added to Cart!" : "Add All To Cart"}
        </Button>
      </div>
    </div>
  );
}

export default FavoritesPage;
