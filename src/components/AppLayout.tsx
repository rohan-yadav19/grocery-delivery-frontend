import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { StoreIcon, SearchIcon, CartIcon, HeartIcon, UserIcon } from "./icons";
import { useCartStore } from "../stores/cartStore";

const desktopNavItems = [
  { to: "/",          label: "Shop",      icon: StoreIcon  },
  { to: "/explore",   label: "Explore",   icon: SearchIcon },
  { to: "/cart",      label: "Cart",      icon: CartIcon   },
  { to: "/favorites", label: "Favourite", icon: HeartIcon  },
  { to: "/account",   label: "Account",   icon: UserIcon   },
] as const;

interface AppLayoutProps {
  /** If provided, renders children instead of <Outlet />. */
  children?: ReactNode;
}

/**
 * Responsive application shell.
 *
 * Mobile:  full-width content + fixed BottomNav.
 * Desktop: centered max-w-5xl container + top navigation header.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const cartItemCount = useCartStore((s) => s.items.length);

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* ── Desktop top navigation (hidden on mobile) ─────────────── */}
      <nav
        className="hidden md:block sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
        aria-label="Main navigation"
      >
        <div className="app-container flex items-center justify-between h-16">
          <span className="text-xl font-bold text-[var(--color-brand)]">
            🥕 FreshCart
          </span>
          <ul className="flex items-center gap-2 m-0 p-0 list-none">
            {desktopNavItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 no-underline px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[var(--color-brand)] text-white"
                        : "text-[var(--color-text-primary)] hover:bg-[var(--color-input-bg)]"
                    }`
                  }
                >
                  <span className="relative">
                    <Icon size={18} />
                    {label === "Cart" && cartItemCount > 0 && (
                      <span
                        key={cartItemCount}
                        className="badge-pop absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[var(--color-brand)] text-white text-[9px] font-bold leading-none px-0.5"
                        aria-label={`${cartItemCount} items in cart`}
                      >
                        {cartItemCount}
                      </span>
                    )}
                  </span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Main content area ─────────────────────────────────────── */}
      <main className="w-full bg-[var(--color-surface)] min-h-screen md:min-h-0">
        <div className="app-container pb-[var(--spacing-nav-height)] md:pb-0">
          {children ?? <Outlet />}
        </div>
      </main>

      {/* ── Mobile bottom navigation ──────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
