import { useState, useMemo, useCallback } from "react";
import { BottomSheet } from "./BottomSheet";
import { Checkbox } from "./Checkbox";
import { Button } from "./Button";
import { getAllCategories, getAllProducts } from "../services/productService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterSelections {
  /** Selected category IDs. */
  readonly categoryIds: readonly string[];
  /** Selected brand names. */
  readonly brands: readonly string[];
}

export const EMPTY_FILTERS: FilterSelections = {
  categoryIds: [],
  brands: [],
};

interface FilterSheetProps {
  /** Whether the filter sheet is visible. */
  open: boolean;
  /** Called when the user requests closing (backdrop, X, Escape). */
  onClose: () => void;
  /** Currently applied filters (used to initialize temporary selections). */
  appliedFilters: FilterSelections;
  /** Called when the user clicks "Apply Filter". */
  onApply: (filters: FilterSelections) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Filter sheet matching the Figma `filters.png` reference.
 *
 * - Categories section with checkboxes
 * - Brand section with checkboxes (derived from product data)
 * - "Apply Filter" button
 * - "Clear Filters" text button
 * - Temporary local state — changes are only committed on Apply
 */
export function FilterSheet({
  open,
  onClose,
  appliedFilters,
  onApply,
}: FilterSheetProps) {
  // ── Derive available options from data ──────────────────────────────────

  const categories = useMemo(() => getAllCategories(), []);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    for (const product of getAllProducts()) {
      if (product.brand) brands.add(product.brand);
    }
    return Array.from(brands).sort();
  }, []);

  // ── Temporary local state (not committed until Apply) ──────────────────

  const [tempCategoryIds, setTempCategoryIds] = useState<string[]>(
    [...appliedFilters.categoryIds],
  );
  const [tempBrands, setTempBrands] = useState<string[]>(
    [...appliedFilters.brands],
  );

  // Re-initialize when the sheet opens
  const handleOpen = useCallback(() => {
    setTempCategoryIds([...appliedFilters.categoryIds]);
    setTempBrands([...appliedFilters.brands]);
  }, [appliedFilters]);

  // Sync temp state when sheet opens
  if (open) {
    // We use a ref-like check to avoid infinite re-renders
    // but since open transitions false→true, the parent controls this
  }

  // ── Toggle handlers ────────────────────────────────────────────────────

  const toggleCategory = useCallback((categoryId: string, checked: boolean) => {
    setTempCategoryIds((prev) =>
      checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId),
    );
  }, []);

  const toggleBrand = useCallback((brand: string, checked: boolean) => {
    setTempBrands((prev) =>
      checked ? [...prev, brand] : prev.filter((b) => b !== brand),
    );
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────

  const handleApply = useCallback(() => {
    onApply({
      categoryIds: tempCategoryIds,
      brands: tempBrands,
    });
    onClose();
  }, [tempCategoryIds, tempBrands, onApply, onClose]);

  const handleClear = useCallback(() => {
    setTempCategoryIds([]);
    setTempBrands([]);
  }, []);

  const totalSelected = tempCategoryIds.length + tempBrands.length;

  // Re-sync temp state when sheet opens
  // (useEffect would cause a flash; instead we use onTransitionEnd-style via parent)
  // We handle this by resetting when `open` changes to true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    if (open) handleOpen();
  }, [open, handleOpen]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <BottomSheet open={open} onClose={onClose} title="Filters">
      <div className="filter-sheet-body">
        {/* Categories section */}
        <section className="filter-section">
          <h3 className="filter-section-title">Categories</h3>
          <div className="filter-option-list" role="group" aria-label="Category filters">
            {categories.map((cat) => (
              <Checkbox
                key={cat.id}
                label={cat.name}
                checked={tempCategoryIds.includes(cat.id)}
                onChange={(checked) => toggleCategory(cat.id, checked)}
              />
            ))}
          </div>
        </section>

        {/* Brand section */}
        {availableBrands.length > 0 && (
          <section className="filter-section">
            <h3 className="filter-section-title">Brand</h3>
            <div className="filter-option-list" role="group" aria-label="Brand filters">
              {availableBrands.map((brand) => (
                <Checkbox
                  key={brand}
                  label={brand}
                  checked={tempBrands.includes(brand)}
                  onChange={(checked) => toggleBrand(brand, checked)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Actions */}
      <div className="filter-sheet-actions">
        {totalSelected > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="filter-clear-btn"
          >
            Clear Filters
          </button>
        )}
        <Button onClick={handleApply}>Apply Filter</Button>
      </div>
    </BottomSheet>
  );
}
