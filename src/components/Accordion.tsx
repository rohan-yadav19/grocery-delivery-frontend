import { useState, useId, type ReactNode } from "react";
import { ChevronDownIcon } from "./icons";

interface AccordionProps {
  /** Header title text. */
  title: string;
  /** Whether the accordion starts expanded. */
  defaultExpanded?: boolean;
  /** Optional element rendered on the right side of the header (e.g. rating). */
  headerRight?: ReactNode;
  /** Accordion panel content. */
  children: ReactNode;
}

/**
 * Expandable disclosure panel matching the Product Detail
 * accordion sections (Product Detail, Nutrition, Reviews).
 */
export function Accordion({
  title,
  defaultExpanded = false,
  headerRight,
  children,
}: AccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();
  const headerId = useId();

  return (
    <div className="border-b border-[var(--color-border)]">
      <button
        type="button"
        id={headerId}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="flex items-center justify-between w-full py-4 px-0 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="text-base font-semibold text-[var(--color-text-primary)]">
          {title}
        </span>
        <span className="flex items-center gap-2">
          {headerRight}
          <ChevronDownIcon
            size={20}
            className={`text-[var(--color-text-primary)] transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${
          expanded ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
