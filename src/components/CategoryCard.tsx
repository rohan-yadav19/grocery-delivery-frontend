import { Link } from "react-router-dom";
import { ResilientImage } from "./ResilientImage";
import { getCategoryStyle } from "../config/categoryStyles";
import type { Category } from "../types";

interface CategoryCardProps {
  category: Category;
}

/**
 * Colorful category tile matching the Figma Explore grid.
 *
 * Visual styling (pastel backgrounds, borders) comes from the
 * UI config layer, NOT the domain model.
 */
export function CategoryCard({ category }: CategoryCardProps) {
  const style = getCategoryStyle(category.id);

  return (
    <Link
      to={`/category/${category.id}`}
      className="no-underline block rounded-[var(--radius-card)] p-4 text-center transition-shadow hover:shadow-md"
      style={{
        backgroundColor: style.background,
        border: `1px solid ${style.border}`,
      }}
    >
      <div className="w-full aspect-square flex items-center justify-center mb-3 overflow-hidden">
        <ResilientImage
          src={category.image}
          alt={category.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <h3 className="text-base font-bold text-[var(--color-text-primary)] m-0">
        {category.name}
      </h3>
    </Link>
  );
}

