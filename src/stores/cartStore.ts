import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface CartState {
  /** Map of productId → quantity.  This is the persisted source of truth. */
  items: CartItem[];

  /** Add a product or increment its quantity by 1. */
  addItem: (productId: string) => void;

  /** Remove one unit; removes the entry entirely when quantity reaches 0. */
  decrementItem: (productId: string) => void;

  /** Remove a product from the cart completely. */
  removeItem: (productId: string) => void;

  /** Set an exact quantity for a product. Removes if quantity ≤ 0. */
  setQuantity: (productId: string, quantity: number) => void;

  /** Empty the cart. */
  clearCart: () => void;

  /** Get the quantity of a specific product in the cart (0 if absent). */
  getQuantity: (productId: string) => number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: 1 }] };
        }),

      decrementItem: (productId) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (!existing) return state;
          if (existing.quantity <= 1) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i,
            ),
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity }] };
        }),

      clearCart: () => set({ items: [] }),

      getQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: "freshcart-cart",
    },
  ),
);
