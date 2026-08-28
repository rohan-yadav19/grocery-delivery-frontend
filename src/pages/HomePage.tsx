import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar, ProductCard, LoadingSkeleton, ResilientImage } from "../components";
import { PromoBanner } from "../components/PromoBanner";
import { LocationIcon, ChevronDownIcon, CarrotIcon } from "../components/icons";
import { getAllProducts, getAllCategories } from "../services/productService";
import { useSessionStore } from "../stores/sessionStore";
import type { Product, Category } from "../types";

// ── Data helpers ─────────────────────────────────────────────────────────────

/** Products for the "Exclusive Offer" section (fruits & vegetables, 8 items). */
function getExclusiveOffers(products: readonly Product[]): readonly Product[] {
  return products.filter((p) => p.categoryId === "cat-fruits-vegetables").slice(0, 8);
}

/** Products for the "Best Selling" section (popular multi-category, 8 items). */
function getBestSelling(products: readonly Product[]): readonly Product[] {
  return [...products]
    .filter((p) => p.categoryId !== "cat-fruits-vegetables")
    .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
    .slice(0, 8);
}

/** Groceries section: show Pulses, Rice, and Cooking Oil categories as filter shortcuts. */
function getGroceryCategories(categories: readonly Category[]): readonly Category[] {
  return categories.filter(
    (c) => c.id === "cat-pulses" || c.id === "cat-rice" || c.id === "cat-cooking-oil",
  );
}

/** Products for the default "Groceries" section (meat, seafood & dairy staples, 8 items). */
function getGroceryProducts(products: readonly Product[]): readonly Product[] {
  return products
    .filter((p) => p.categoryId === "cat-meat-fish" || p.categoryId === "cat-dairy-eggs")
    .slice(0, 8);
}

// ── Section components ───────────────────────────────────────────────────────

/** Section heading with optional "See all" link. */
function SectionHeader({
  title,
  seeAllTo,
}: {
  title: string;
  seeAllTo?: string;
}) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {seeAllTo && (
        <Link to={seeAllTo} aria-label={`See all ${title}`}>
          See all
        </Link>
      )}
    </div>
  );
}

/** Horizontally scrollable product carousel. */
function ProductCarousel({
  products,
  label,
}: {
  products: readonly Product[];
  label: string;
}) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        No products available.
      </p>
    );
  }

  return (
    <div className="product-carousel" role="list" aria-label={label}>
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

/** Category filter chips for the Groceries section. */
function GroceryCategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: readonly Category[];
  selectedCategory: string | null;
  onSelectCategory: (catId: string) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="category-shortcut-row" role="group" aria-label="Grocery category filters">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`grocery-category-card grocery-chip ${isSelected ? "grocery-chip--active" : ""}`}
            style={{ backgroundColor: cat.color ?? "#F2F3F2" }}
            aria-pressed={isSelected}
            aria-label={`Filter by ${cat.name}`}
          >
            <div className="grocery-category-card__image-container" aria-hidden="true">
              <ResilientImage
                src={cat.image}
                alt=""
                className="grocery-category-card__img"
              />
            </div>
            <div className="grocery-category-card__text">
              <span className="grocery-category-card__name">
                {cat.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Loading skeleton for a product carousel section. */
function CarouselSkeleton() {
  return (
    <div className="product-carousel" aria-busy="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="w-full">
          <LoadingSkeleton variant="card" />
        </div>
      ))}
    </div>
  );
}

// ── Home page ────────────────────────────────────────────────────────────────

/**
 * Home / Shop screen.
 *
 * Sections:
 * 1. Header with FreshCart logo + Indian location (Koramangala, Bengaluru)
 * 2. Search bar (navigates to /search on focus)
 * 3. Promotional banner sliding carousel with real assets
 * 4. "Exclusive Offer" horizontal product scroll
 * 5. "Best Selling" horizontal product scroll
 * 6. "Groceries" category shortcuts + products
 */
function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedGroceryCat, setSelectedGroceryCat] = useState<string | null>(null);
  const navigate = useNavigate();

  const zone = useSessionStore((s) => s.zone);
  const area = useSessionStore((s) => s.area);

  // Derive location string, defaulting cleanly to Koramangala, Bengaluru
  const locationDisplay = useMemo(() => {
    if (area && zone) {
      const zoneClean = zone.split(",")[0]?.trim() || "Bengaluru";
      if (area.toLowerCase().includes("koramangala") && zoneClean.toLowerCase().includes("bengaluru")) {
        return "Koramangala, Bengaluru";
      }
      return `${area}, ${zoneClean}`;
    }
    return "Koramangala, Bengaluru";
  }, [zone, area]);

  // Load data synchronously from the static JSON service
  const allProducts = useMemo(() => getAllProducts(), []);
  const allCategories = useMemo(() => getAllCategories(), []);

  // Derive sections
  const exclusiveOffers = useMemo(() => getExclusiveOffers(allProducts), [allProducts]);
  const bestSelling = useMemo(() => getBestSelling(allProducts), [allProducts]);
  const groceryCategories = useMemo(() => getGroceryCategories(allCategories), [allCategories]);
  
  const displayedGroceryProducts = useMemo(() => {
    if (selectedGroceryCat) {
      return allProducts.filter((p) => p.categoryId === selectedGroceryCat);
    }
    return getGroceryProducts(allProducts);
  }, [allProducts, selectedGroceryCat]);

  const isLoading = false;
  const hasError = false;

  const handleToggleGroceryCat = (catId: string) => {
    setSelectedGroceryCat((prev) => (prev === catId ? null : catId));
  };

  /** Navigate to search on focus. */
  const handleSearchFocus = () => {
    navigate("/search");
  };

  const grocerySeeAllTo = selectedGroceryCat
    ? `/category/${selectedGroceryCat}`
    : "/explore";

  return (
    <div className="home-page pb-6">
      {/* ── 1. Header: logo + location (mobile only) ────────────── */}
      <header className="home-header md:hidden pt-3 pb-1 flex flex-col items-center">
        {/* FreshCart logo icon */}
        <div className="flex justify-center mb-1.5" aria-hidden="true">
          <CarrotIcon size={30} />
        </div>

        {/* Location selector button */}
        <button
          type="button"
          onClick={() => navigate("/select-location")}
          className="flex items-center justify-center gap-1.5 py-1 px-3 bg-transparent border-none cursor-pointer rounded-full hover:bg-[var(--color-input-bg)] text-[var(--color-text-primary)] transition-colors"
          aria-label={`Change location. Current location: ${locationDisplay}`}
        >
          <LocationIcon size={18} className="text-[var(--color-text-primary)]" />
          <span className="text-base font-bold text-[var(--color-text-primary)]">
            {locationDisplay}
          </span>
          <ChevronDownIcon size={16} className="text-[var(--color-text-secondary)] mt-0.5" />
        </button>
      </header>

      {/* ── 2. Search bar & Desktop Location ──────────────────────── */}
      <section className="home-section mt-2" aria-label="Search">
        {/* Desktop location bar */}
        <div className="hidden md:flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={() => navigate("/select-location")}
            className="flex items-center gap-2 py-1 px-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-full cursor-pointer hover:border-[var(--color-brand)] transition-colors"
            aria-label={`Change location: ${locationDisplay}`}
          >
            <LocationIcon size={16} className="text-[var(--color-brand)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              Delivering to: <span className="font-bold">{locationDisplay}</span>
            </span>
            <ChevronDownIcon size={14} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <div
          onFocus={handleSearchFocus}
          role="search"
        >
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search Store"
          />
        </div>
      </section>

      {/* ── 3. Promotional banner sliding carousel ──────────────── */}
      <section className="home-section my-4" aria-label="Featured promotions">
        <PromoBanner />
      </section>

      {/* ── Loading / Error states ───────────────────────────────── */}
      {hasError && (
        <section className="home-section">
          <div className="text-center py-8">
            <p className="text-[var(--color-error)] font-semibold">
              Something went wrong loading products.
            </p>
            <button
              type="button"
              className="btn-secondary mt-4"
              style={{ width: "auto", padding: "10px 24px" }}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </section>
      )}

      {!hasError && (
        <>
          {/* ── 4. Exclusive Offer ───────────────────────────────── */}
          <section className="home-section my-4" aria-label="Exclusive Offer">
            <SectionHeader title="Exclusive Offer" seeAllTo="/category/cat-fruits-vegetables" />
            {isLoading ? (
              <CarouselSkeleton />
            ) : (
              <ProductCarousel products={exclusiveOffers} label="Exclusive offer products" />
            )}
          </section>

          {/* ── 5. Best Selling ──────────────────────────────────── */}
          <section className="home-section my-4" aria-label="Best Selling">
            <SectionHeader title="Best Selling" seeAllTo="/explore" />
            {isLoading ? (
              <CarouselSkeleton />
            ) : (
              <ProductCarousel products={bestSelling} label="Best selling products" />
            )}
          </section>

          {/* ── 6. Groceries ────────────────────────────────────── */}
          <section className="home-section my-4" aria-label="Groceries">
            <SectionHeader title="Groceries" seeAllTo={grocerySeeAllTo} />
            <GroceryCategoryChips
              categories={groceryCategories}
              selectedCategory={selectedGroceryCat}
              onSelectCategory={handleToggleGroceryCat}
            />
            {isLoading ? (
              <CarouselSkeleton />
            ) : (
              <ProductCarousel products={displayedGroceryProducts} label="Grocery products" />
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default HomePage;
