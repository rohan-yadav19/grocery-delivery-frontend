# Asset Infrastructure — Final Status

> **Last updated**: Step 5 — Asset Preparation and Verification

## Summary

All product, category, banner, illustration, and branding assets referenced by
the application data files are embedded within composite Figma screenshots in
`public/design-reference/`. None of these assets can be reliably extracted as
clean, isolated image files from the composite screenshots without significant
quality loss (background artifacts, card borders, text overlays, shadow bleed).

**No fake or generated replacement images have been created.**

---

## 1. Product Images Required

All paths referenced from `src/data/products.json`:

| # | Expected Path | Product | Source Screenshot | Status |
|---|--------------|---------|-------------------|--------|
| 1 | `/assets/products/organic-bananas.png` | Organic Bananas | `Home Screen.png`, `My Cart.png` | ❌ Requires original asset |
| 2 | `/assets/products/red-apple.png` | Red Apple | `Home Screen.png`, `Product Detail.png` | ❌ Requires original asset |
| 3 | `/assets/products/bell-pepper-red.png` | Bell Pepper Red | `Home Screen.png`, `My Cart.png`, `Checkout.png` | ❌ Requires original asset |
| 4 | `/assets/products/ginger.png` | Ginger | `Home Screen.png`, `My Cart.png` | ❌ Requires original asset |
| 5 | `/assets/products/beef-bone.png` | Beef Bone | `Home Screen.png` | ❌ Requires original asset |
| 6 | `/assets/products/broiler-chicken.png` | Broiler Chicken | `Home Screen.png` | ❌ Requires original asset |
| 7 | `/assets/products/egg-chicken-red.png` | Egg Chicken Red | `Search.png`, `My Cart.png`, `Checkout.png` | ❌ Requires original asset |
| 8 | `/assets/products/diet-coke.png` | Diet Coke | `Beverages.png`, `Favorites.png` | ❌ Requires original asset |
| 9 | `/assets/products/sprite-can.png` | Sprite Can | `Beverages.png`, `Favorites.png` | ❌ Requires original asset |
| 10 | `/assets/products/apple-grape-juice.png` | Apple & Grape Juice | `Beverages.png`, `Favorites.png` | ❌ Requires original asset |
| 11 | `/assets/products/orange-juice.png` | Orange Juice | `Beverages.png` | ❌ Requires original asset |
| 12 | `/assets/products/coca-cola-can.png` | Coca Cola Can | `Beverages.png`, `Favorites.png` | ❌ Requires original asset |
| 13 | `/assets/products/pepsi-can.png` | Pepsi Can | `Beverages.png`, `Favorites.png` | ❌ Requires original asset |

**Total: 13 product images — all require external/original assets**

### Why extraction is not reliable

Product images appear inside rounded-corner cards with:
- White card backgrounds that bleed into image edges
- Text labels overlapping or adjacent to the image area
- Card border/shadow artifacts
- Small rendering size (~100–160px in the source screenshot)

Cropping these would produce images with visible white backgrounds, jagged edges
from card corners, and sub-optimal resolution (~100px). This falls below the
quality threshold for production assets.

---

## 2. Category Images Required

All paths referenced from `src/data/categories.json`:

| # | Expected Path | Category | Source Screenshot | Status |
|---|--------------|----------|-------------------|--------|
| 1 | `/assets/categories/fruits-vegetables.png` | Fresh Fruits & Vegetable | `Explore.png` | ❌ Requires original asset |
| 2 | `/assets/categories/cooking-oil.png` | Cooking Oil & Ghee | `Explore.png` | ❌ Requires original asset |
| 3 | `/assets/categories/meat-fish.png` | Meat & Fish | `Explore.png` | ❌ Requires original asset |
| 4 | `/assets/categories/bakery-snacks.png` | Bakery & Snacks | `Explore.png` | ❌ Requires original asset |
| 5 | `/assets/categories/dairy-eggs.png` | Dairy & Eggs | `Explore.png` | ❌ Requires original asset |
| 6 | `/assets/categories/beverages.png` | Beverages | `Explore.png` | ❌ Requires original asset |
| 7 | `/assets/categories/pulses.png` | Pulses | `Home Screen.png` | ❌ Requires original asset |
| 8 | `/assets/categories/rice.png` | Rice | `Home Screen.png` | ❌ Requires original asset |

**Total: 8 category images — all require external/original assets**

### Why extraction is not reliable

Category images appear inside colored tiles (~300×240px display) with:
- Colored backgrounds (green, orange, pink, purple, yellow, blue) baked into the tile
- Rounded corners that would clip the extraction area
- Text labels at the bottom of each tile
- Adjacent tile edges without clear isolation gaps

The intended original category images are likely transparent-background PNGs
placed atop colored backgrounds. Extracting from the composite would include the
solid color fill as part of the image.

---

## 3. Banner Images Required

| # | Expected Path | Usage | Source Screenshot | Status |
|---|--------------|-------|-------------------|--------|
| 1 | `/assets/banners/fresh-vegetables-banner.png` | Home hero carousel | `Home Screen.png` | ❌ Requires original asset |

**Total: 1 banner image — requires external/original asset**

### Why extraction is not reliable

The banner image in `Home Screen.png` has overlaid text ("Fresh Vegetables",
"Get Up To 40% OFF") and navigation dots composited on top of the image.
Cropping would include text and UI chrome as part of the banner.

---

## 4. Illustration Images Required

| # | Expected Path | Usage | Source Screenshot | Status |
|---|--------------|-------|-------------------|--------|
| 1 | `/assets/illustrations/order-success.png` | Order accepted screen | `order accepted.png` | ❌ Requires original asset |
| 2 | `/assets/illustrations/order-failure.png` | Order failed modal | `error.png` | ❌ Requires original asset |
| 3 | `/assets/illustrations/onboarding.png` | Welcome page background | `onbording .png` | ❌ Requires original asset |
| 4 | `/assets/illustrations/location-pin.png` | Select location page | `select location.png` | ❌ Requires original asset |

**Total: 4 illustrations — all require external/original assets**

### Why extraction is not reliable

- **Order success** (`order accepted.png`): The green checkmark circle with
  confetti is composited with a gradient background and scattered decorative
  elements. Isolating the illustration cleanly is not possible.

- **Order failure** (`error.png`): The grocery bag illustration is inside a
  modal dialog with dimmed background. The dialog overlay, close button, and
  text are composited.

- **Onboarding** (`onbording .png`): The background is a full-bleed photograph
  of a delivery person with text overlaid at the bottom. This is a hero photo
  asset, not an illustration crop.

- **Location pin** (`select location.png`): A stylized map + pin illustration
  is composited with the page background and form fields.

---

## 5. Logo / Brand Assets Required

| # | Expected Path | Usage | Source Screenshot | Status |
|---|--------------|-------|-------------------|--------|
| 1 | `/assets/icons/logo-carrot.svg` | Header logo, splash, auth | `splash Screen.png`, `Home Screen.png`, `log in.png` | ❌ Requires original asset |

**Total: 1 logo asset — requires external/original asset**

### Why extraction is not reliable

The carrot logo appears on a green (#53B175) background in the splash screen
and as a small icon on white/gradient backgrounds in other screens. The logo is
too small and composited to extract as a clean vector or high-resolution raster.
The original should be sourced as an SVG from Figma.

---

## 6. Complete Asset File Tree (Target)

Once all assets are sourced, the directory should contain:

```
public/assets/
├── products/
│   ├── organic-bananas.png
│   ├── red-apple.png
│   ├── bell-pepper-red.png
│   ├── ginger.png
│   ├── beef-bone.png
│   ├── broiler-chicken.png
│   ├── egg-chicken-red.png
│   ├── diet-coke.png
│   ├── sprite-can.png
│   ├── apple-grape-juice.png
│   ├── orange-juice.png
│   ├── coca-cola-can.png
│   └── pepsi-can.png
├── categories/
│   ├── fruits-vegetables.png
│   ├── cooking-oil.png
│   ├── meat-fish.png
│   ├── bakery-snacks.png
│   ├── dairy-eggs.png
│   ├── beverages.png
│   ├── pulses.png
│   └── rice.png
├── banners/
│   └── fresh-vegetables-banner.png
├── icons/
│   └── logo-carrot.svg
└── illustrations/
    ├── order-success.png
    ├── order-failure.png
    ├── onboarding.png
    └── location-pin.png
```

**Total files needed: 27**
- 13 product images
- 8 category images
- 1 banner image
- 1 logo/icon
- 4 illustrations

**Currently available: 0 of 27**

---

## 7. Recommended Next Steps

1. **Export from Figma**: Export each asset from the original Figma project
   with transparent backgrounds at 2x or 3x resolution.

2. **Product images**: Export as PNG, recommended 400×400px or larger,
   with transparent backgrounds.

3. **Category images**: Export the illustration portion only (without the
   colored background fill), as PNG with transparent backgrounds.

4. **Banner**: Export the full banner artwork without the text overlay,
   or as a complete composited banner at 750×200px or wider.

5. **Illustrations**: Export as PNG at 2x resolution with transparent
   backgrounds.

6. **Logo**: Export the carrot icon as an SVG for scalability.

7. Place all files at the exact paths listed above — the application
   data files (`products.json`, `categories.json`) are already configured
   with matching paths.

---

## 8. Data–Filename Alignment Verification

| Data File | Image Field Paths | Matching Expected Files | Mismatches |
|-----------|-------------------|------------------------|------------|
| `products.json` (13 entries) | All reference `/assets/products/<slug>.png` | ✅ All 13 filenames are correct | None |
| `categories.json` (8 entries) | All reference `/assets/categories/<slug>.png` | ✅ All 8 filenames are correct | None |

No data modifications are needed. The JSON data and expected file paths are
in perfect alignment.
