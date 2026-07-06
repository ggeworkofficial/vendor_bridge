import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  vendor: string;
  category?: string;
  addedAt: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (product: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: Omit<FavoriteItem, 'addedAt'>) => void;
  isFavorite: (productId: string) => boolean;
  count: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (product) => set((state) => {
        if (state.favorites.some(item => item.id === product.id)) return state;
        return {
          favorites: [...state.favorites, { ...product, addedAt: new Date().toISOString() }]
        };
      }),
      
      removeFavorite: (productId) => set((state) => ({
        favorites: state.favorites.filter(item => item.id !== productId)
      })),
      
      toggleFavorite: (product) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(product.id)) {
          removeFavorite(product.id);
        } else {
          addFavorite(product);
        }
      },
      
      isFavorite: (productId) => get().favorites.some(item => item.id === productId),
      count: () => get().favorites.length,
    }),
    {
      name: 'vendorbridge_favorites',
    }
  )
);