import { SearchIcon, CloseIcon } from "./icons";

interface SearchBarProps {
  /** Current search value. */
  value: string;
  /** Called when the input value changes. */
  onChange: (value: string) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Auto-focus the input on mount. */
  autoFocus?: boolean;
}

/**
 * Rounded search input matching the Figma `#F2F3F2` background style.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search Store",
  autoFocus = false,
}: SearchBarProps) {
  return (
    <div className="search-input-container">
      <SearchIcon size={20} className="shrink-0 text-[var(--color-text-secondary)]" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 bg-transparent border-none cursor-pointer p-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Clear search"
        >
          <CloseIcon size={18} />
        </button>
      )}
    </div>
  );
}
