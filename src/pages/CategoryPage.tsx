import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Header,
  ProductCard,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  FilterSheet,
  EMPTY_FILTERS,
} from "../components";
import type { FilterSelections } from "../components";
import { FilterIcon } from "../components/icons";
import {
  getCategoryById,
  getProductsByCategory,
  getAllProducts,
} from "../services/productService";

/**
 * Category product listing page with filter support.
 *
 * When navigated to via `/category/:categoryId`, shows products for that
 * category. Filters allow further refinement by category and brand.
 *
 * Filter behaviour:
 * - Category filters: OR within the category group
 * - Brand filters: OR within the brand group
 * - Between groups: AND
 */
function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  // ── Filter state ──────────────────────────────────────────────────────────

  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterSelections>(EMPTY_FILTERS);

  const category = useMemo(
    () => (categoryId ? getCategoryById(categoryId) : undefined),
    [categoryId],
  );

  // ── Base products (from URL category) ─────────────────────────────────────

  const baseProducts = useMemo(
    () => (categoryId ? getProductsByCategory(categoryId) : []),
    [categoryId],
  );

  // ── Filtered products ─────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    // If category filters are active, show products from selected categories
    // instead of the URL category
    let products =
      appliedFilters.categoryIds.length > 0
        ? getAllProducts().filter((p) =>
            appliedFilters.categoryIds.includes(p.categoryId),
          )
        : baseProducts;

    // Brand filter (AND with category, OR within brands)
    if (appliedFilters.brands.length > 0) {
      products = products.filter(
        (p) => p.brand !== undefined && appliedFilters.brands.includes(p.brand),
      );
    }

    return products;
  }, [baseProducts, appliedFilters]);

  const activeFilterCount =
    appliedFilters.categoryIds.length + appliedFilters.brands.length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleApplyFilters = useCallback((filters: FilterSelections) => {
    setAppliedFilters(filters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setAppliedFilters(EMPTY_FILTERS);
  }, []);

  // Structured for future async data loading
  const isLoading = false;

  // ── Invalid category ─────────────────────────────────────────────────────

  if (!categoryId || !category) {
    return (
      <div className="category-page-shell">
        <Header
          title="Category"
          showBack
          onBack={() => navigate("/explore")}
        />
        <ErrorState
          title="Category Not Found"
          description="The category you're looking for doesn't exist or may have been removed."
          retryLabel="Browse Categories"
          onRetry={() => navigate("/explore")}
          secondaryLabel="Back to Home"
          onSecondary={() => navigate("/")}
        />
      </div>
    );
  }

  // ── Valid category ───────────────────────────────────────────────────────

  return (
    <div className="category-page-shell">
      <Header
        title={category.name}
        showBack
        rightAction={
          <button
            type="button"
            className={`filter-trigger-btn${activeFilterCount > 0 ? " filter-active" : ""}`}
            aria-label={`Filter products${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
            onClick={() => setFilterOpen(true)}
          >
            <FilterIcon size={20} />
            {activeFilterCount > 0 && (
              <span className="filter-badge" aria-hidden>
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      <div className="category-page-content">
        {/* Loading state */}
        {isLoading && (
          <div className="category-product-grid" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <LoadingSkeleton key={i} variant="card" height="240px" />
            ))}
          </div>
        )}

        {/* Empty state — filtered */}
        {!isLoading && filteredProducts.length === 0 && activeFilterCount > 0 && (
          <EmptyState
            title="No Matching Products"
            description="No products match the selected filters. Try adjusting your filters."
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
          />
        )}

        {/* Empty state — no products in category */}
        {!isLoading && filteredProducts.length === 0 && activeFilterCount === 0 && (
          <EmptyState
            title="No Products Found"
            description={`There are no products in ${category.name} yet. Check back soon!`}
            actionLabel="Explore Categories"
            onAction={() => navigate("/explore")}
          />
        )}

        {/* Product grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div
            className="category-product-grid"
            role="list"
            aria-label={`${category.name} products`}
          >
            {filteredProducts.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter sheet */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        appliedFilters={appliedFilters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}

export default CategoryPage;
