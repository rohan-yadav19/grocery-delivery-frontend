/**
 * Category visual styling configuration.
 *
 * Keeps presentation-only colors (pastel borders, background tints)
 * out of the domain model. The Category type's optional `color` field
 * from Step 2 is used as the background; this map provides the
 * corresponding border colors from the Figma design.
 *
 * If a category ID is not found here, components fall back to the
 * default border color.
 */

interface CategoryStyle {
  readonly background: string;
  readonly border: string;
}

const categoryStyles: Readonly<Record<string, CategoryStyle>> = {
  "cat-fruits-vegetables": { background: "#EEF7F1", border: "rgba(83, 177, 117, 0.5)" },
  "cat-cooking-oil":       { background: "#FDF6E7", border: "rgba(248, 164, 76, 0.5)" },
  "cat-meat-fish":         { background: "#FDE8E4", border: "#F7A593" },
  "cat-bakery-snacks":     { background: "#F4EBF7", border: "#D3B0E0" },
  "cat-dairy-eggs":        { background: "#FFF8E5", border: "#FDE598" },
  "cat-beverages":         { background: "#EDF7FC", border: "#B7DFF5" },
  "cat-pulses":            { background: "#FFF3E0", border: "rgba(248, 164, 76, 0.5)" },
  "cat-rice":              { background: "#F1F8E9", border: "rgba(83, 177, 117, 0.5)" },
};

const defaultStyle: CategoryStyle = {
  background: "#F2F3F2",
  border: "#E2E2E2",
};

/** Get the visual style for a category. Falls back to neutral defaults. */
export function getCategoryStyle(categoryId: string): CategoryStyle {
  return categoryStyles[categoryId] ?? defaultStyle;
}
