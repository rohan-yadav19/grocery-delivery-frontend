import type { Product, Category } from "../types";
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";

// ---------------------------------------------------------------------------
// Data source — cast the untyped JSON imports to our domain types.
// The JSON files are authored to match the Product / Category shapes.
// ---------------------------------------------------------------------------

const products: readonly Product[] = productsData as readonly Product[];
const categories: readonly Category[] = categoriesData as readonly Category[];

// ---------------------------------------------------------------------------
// Lookup maps (built once, O(1) access)
// ---------------------------------------------------------------------------

const productMap = new Map<string, Product>(
  products.map((p) => [p.id, p]),
);

const categoryMap = new Map<string, Category>(
  categories.map((c) => [c.id, c]),
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return every product. */
export function getAllProducts(): readonly Product[] {
  return products;
}

/** Return a single product by ID, or `undefined` if not found. */
export function getProductById(id: string): Product | undefined {
  return productMap.get(id);
}

/** Return all products belonging to a category. */
export function getProductsByCategory(categoryId: string): readonly Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

/** Return every category. */
export function getAllCategories(): readonly Category[] {
  return categories;
}

/** Return a single category by ID, or `undefined` if not found. */
export function getCategoryById(id: string): Category | undefined {
  return categoryMap.get(id);
}

/** Simple keyword search across product name and description (case-insensitive). */
export function searchProducts(query: string): readonly Product[] {
  const q = query.toLowerCase().trim();
  if (q.length === 0) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}
