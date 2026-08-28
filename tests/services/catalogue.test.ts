import { describe, it, expect } from "vitest";
import productsData from "../../src/data/products.json";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getAllCategories,
  searchProducts,
} from "../../src/services/productService";
import type { Product, Category } from "../../src/types";

describe("Product Catalogue & Category Curation (Step 18.6)", () => {
  const products: readonly Product[] = getAllProducts();
  const categories: readonly Category[] = getAllCategories();

  it("contains expanded catalogue of at least 45 products (currently 58)", () => {
    expect(products.length).toBeGreaterThanOrEqual(45);
    expect(productsData.length).toBe(products.length);
  });

  it("ensures every product has a unique ID", () => {
    const idSet = new Set<string>();
    products.forEach((p) => {
      expect(idSet.has(p.id)).toBe(false);
      idSet.add(p.id);
    });
    expect(idSet.size).toBe(products.length);
  });

  it("ensures every product has valid required schema fields", () => {
    products.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(typeof p.id).toBe("string");

      expect(p.name).toBeTruthy();
      expect(typeof p.name).toBe("string");

      expect(p.categoryId).toBeTruthy();
      expect(typeof p.categoryId).toBe("string");

      expect(p.price).toBeGreaterThan(0);
      expect(typeof p.price).toBe("number");

      expect(p.unit).toBeTruthy();
      expect(typeof p.unit).toBe("string");

      expect(p.image).toBeTruthy();
      expect(typeof p.image).toBe("string");

      expect(p.stock).toBeGreaterThanOrEqual(1);
      expect(typeof p.stock).toBe("number");
    });
  });

  it("ensures every product references a valid category in categories.json", () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    products.forEach((p) => {
      expect(categoryIds.has(p.categoryId)).toBe(true);
    });
  });

  it("ensures all 8 categories contain at least 6 products", () => {
    expect(categories.length).toBe(8);
    categories.forEach((cat) => {
      const categoryProducts = getProductsByCategory(cat.id);
      expect(categoryProducts.length).toBeGreaterThanOrEqual(6);
    });
  });

  it("retrieves product by ID for newly added items", () => {
    const moongDal = getProductById("prod-moong-dal");
    expect(moongDal).toBeDefined();
    expect(moongDal?.name).toBe("Moong Dal");
    expect(moongDal?.categoryId).toBe("cat-pulses");

    const oliveOil = getProductById("prod-olive-oil");
    expect(oliveOil).toBeDefined();
    expect(oliveOil?.name).toBe("Extra Virgin Olive Oil");

    const salmon = getProductById("prod-salmon");
    expect(salmon).toBeDefined();
    expect(salmon?.name).toBe("Fresh Atlantic Salmon");

    const paneer = getProductById("prod-paneer");
    expect(paneer).toBeDefined();
    expect(paneer?.name).toBe("Fresh Paneer");
  });

  it("finds newly added products via searchProducts query", () => {
    // Search rice
    const riceResults = searchProducts("rice");
    expect(riceResults.length).toBeGreaterThanOrEqual(5);

    // Search oil
    const oilResults = searchProducts("oil");
    expect(oilResults.length).toBeGreaterThanOrEqual(5);

    // Search chicken
    const chickenResults = searchProducts("chicken");
    expect(chickenResults.length).toBeGreaterThanOrEqual(3);

    // Search dal
    const dalResults = searchProducts("dal");
    expect(dalResults.length).toBeGreaterThanOrEqual(5);
  });
});
