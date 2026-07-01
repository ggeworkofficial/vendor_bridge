import { useState, useEffect, useCallback } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  vendor: string;
  addedAt: string;
}

const STORAGE_KEY = 'vendorbridge_wishlist';

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const addToWishlist = useCallback((product: {
    id: string;
    name: string;
    price: number;
    image: string;
    vendor: string;
  }) => {
    setItems(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product: {
    id: string;
    name: string;
    price: number;
    image: string;
    vendor: string;
  }) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  return {
    items,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    count: items.length
  };
}