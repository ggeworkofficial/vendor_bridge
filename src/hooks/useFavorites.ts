import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner'; // or whatever toast library you use

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  vendor: string;
  addedAt: string;
}

const STORAGE_KEY = 'vendorbridge_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some(item => item.id === productId);
  }, [favorites]);

  const addFavorite = useCallback((product: {
    id: string;
    name: string;
    price: number;
    image: string;
    vendor: string;
  }) => {
    setFavorites(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      toast.success(`"${product.name}" added to wishlist`);
      return [...prev, {
        ...product,
        addedAt: new Date().toISOString()
      }];
    });
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const item = prev.find(i => i.id === productId);
      if (item) toast.info(`"${item.name}" removed from wishlist`);
      return prev.filter(item => item.id !== productId);
    });
  }, []);

  const toggleFavorite = useCallback((product: {
    id: string;
    name: string;
    price: number;
    image: string;
    vendor: string;
  }) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    count: favorites.length
  };
}