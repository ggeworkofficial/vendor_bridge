import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  vendor: string;
  category?: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  addToWishlist: (product: Omit<WishlistItem, "addedAt">) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Omit<WishlistItem, "addedAt">) => void;
  isInWishlist: (productId: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (product) =>
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) return state;
          return {
            items: [
              ...state.items,
              { ...product, addedAt: new Date().toISOString() },
            ],
          };
        }),

      removeFromWishlist: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      toggleWishlist: (product) => {
        const { isInWishlist, addToWishlist, removeFromWishlist } = get();
        if (isInWishlist(product.id)) {
          removeFromWishlist(product.id);
        } else {
          addToWishlist(product);
        }
      },

      isInWishlist: (productId) =>
        get().items.some((item) => item.id === productId),
      count: () => get().items.length,
    }),
    {
      name: "vendorbridge_wishlist",
    },
  ),
);
