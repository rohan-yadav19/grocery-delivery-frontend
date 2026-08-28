import { describe, it, expect } from "vitest";
import products from "../src/data/products.json";
import categories from "../src/data/categories.json";

describe("Asset Verification", () => {
  const productImages = import.meta.glob("/public/assets/products/*.png", {
    eager: true,
  });
  const categoryImages = import.meta.glob("/public/assets/categories/*.png", {
    eager: true,
  });
  const bannerImages = import.meta.glob("/public/assets/banners/*.png", {
    eager: true,
  });
  const illustrationImages = import.meta.glob("/public/assets/illustrations/*.png", {
    eager: true,
  });

  it("has image files for every product in products.json", () => {
    for (const product of products) {
      const globKey = `/public${product.image}`;
      expect(
        productImages[globKey],
        `Product image missing: ${product.image} for ${product.name}`,
      ).toBeDefined();
    }
  });

  it("has image files for every category in categories.json", () => {
    for (const category of categories) {
      const globKey = `/public${category.image}`;
      expect(
        categoryImages[globKey],
        `Category image missing: ${category.image} for ${category.name}`,
      ).toBeDefined();
    }
  });

  it("has banner and illustration assets", () => {
    expect(
      bannerImages["/public/assets/banners/fresh-vegetables-banner.png"],
    ).toBeDefined();
    expect(
      illustrationImages["/public/assets/illustrations/onboarding.png"],
    ).toBeDefined();
    expect(
      illustrationImages["/public/assets/illustrations/order-success.png"],
    ).toBeDefined();
    expect(
      illustrationImages["/public/assets/illustrations/order-failed.png"],
    ).toBeDefined();
  });
});
