import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface FavoriteState {
  /** Set of product IDs the user has favorited. */
  favoriteIds: string[];

  /** Toggle a product's favorite status. */
  toggleFavorite: (productId: string) => void;

  /** Check whether a product is favorited. */
  isFavorite: (productId: string) => boolean;

  /** Clear all favorites. */
  clearFavorites: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (productId) =>
        set((state) => {
          const exists = state.favoriteIds.includes(productId);
          return {
            favoriteIds: exists
              ? state.favoriteIds.filter((id) => id !== productId)
              : [...state.favoriteIds, productId],
          };
        }),

      isFavorite: (productId) => get().favoriteIds.includes(productId),

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: "freshcart-favorites",
    },
  ),
);
