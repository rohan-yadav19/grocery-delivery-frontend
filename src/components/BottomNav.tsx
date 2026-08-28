import { NavLink } from "react-router-dom";
import { StoreIcon, SearchIcon, CartIcon, HeartIcon, UserIcon } from "./icons";
import { useCartStore } from "../stores/cartStore";

const navItems = [
  { to: "/",          label: "Shop",      icon: StoreIcon  },
  { to: "/explore",   label: "Explore",   icon: SearchIcon },
  { to: "/cart",      label: "Cart",      icon: CartIcon   },
  { to: "/favorites", label: "Favourite", icon: HeartIcon  },
  { to: "/account",   label: "Account",   icon: UserIcon   },
] as const;

/**
 * Fixed bottom navigation bar with 5 tabs.
 *
 * Active tab: #53B175 (brand green).
 * Inactive tab: #181725 (text primary).
 * Hidden on desktop (md:hidden) — the AppLayout renders a
 * desktop nav header instead.
 */
export function BottomNav() {
  const cartItemCount = useCartStore((s) => s.items.length);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-surface)] border-t border-[var(--color-border)] md:hidden"
      style={{ height: "var(--spacing-nav-height)" }}
      aria-label="Main navigation"
    >
      <ul className="flex items-center justify-around h-full m-0 p-0 list-none px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 no-underline text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-[var(--color-brand)]"
                    : "text-[var(--color-text-primary)]"
                }`
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon
                      size={22}
                      className={
                        isActive
                          ? "text-[var(--color-brand)]"
                          : "text-[var(--color-text-primary)]"
                      }
                    />
                    {label === "Cart" && cartItemCount > 0 && (
                      <span
                        key={cartItemCount}
                        className="badge-pop absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--color-brand)] text-white text-[10px] font-bold leading-none px-1"
                        aria-label={`${cartItemCount} items in cart`}
                      >
                        {cartItemCount}
                      </span>
                    )}
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
