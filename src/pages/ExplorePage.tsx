import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar, CategoryCard } from "../components";
import { getAllCategories } from "../services/productService";

/**
 * Explore / Find Products screen.
 *
 * Matches the Figma "Find Products" reference:
 * - "Find Products" heading
 * - Search bar (navigates to /search on focus)
 * - 2-column category grid (mobile), 3–4 columns (desktop)
 *
 * Rendered inside AppLayout — BottomNav is provided by the shell.
 */
function ExplorePage() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const categories = getAllCategories();

  /** Navigate to search screen on focus. */
  const handleSearchFocus = () => {
    navigate("/search");
  };

  return (
    <div className="explore-page">
      {/* Page header */}
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] text-center m-0 mb-5">
        Find Products
      </h1>

      {/* Search bar */}
      <div
        className="mb-6"
        onFocus={handleSearchFocus}
        role="search"
      >
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search Store"
        />
      </div>

      {/* Category grid */}
      <div className="explore-grid" role="list" aria-label="Product categories">
        {categories.map((category) => (
          <div key={category.id} role="listitem">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExplorePage;
