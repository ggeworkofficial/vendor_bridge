import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  vendor: string;
  category?: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addView: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  removeView: (id: string) => void;
  clearHistory: () => void;
  getRecent: (limit?: number) => RecentlyViewedItem[];
}

const MAX_ITEMS = 50;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addView: (item) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== item.id);
          const newItem = { ...item, viewedAt: Date.now() };
          return {
            items: [newItem, ...filtered].slice(0, MAX_ITEMS),
          };
        }),

      removeView: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearHistory: () => set({ items: [] }),

      getRecent: (limit) => {
        const { items } = get();
        return limit ? items.slice(0, limit) : items;
      },
    }),
    {
      name: "vendorbridge-recently-viewed",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
