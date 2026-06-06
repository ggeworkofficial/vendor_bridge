import { create } from "zustand";
import type { Seller } from "@/types/seller";

type SellerState = {
  sellers: Seller[];
  selectedSeller: Seller | null;
  setSellers: (sellers: Seller[]) => void;
  setSelectedSeller: (seller: Seller | null) => void;
  addSeller: (seller: Seller) => void;
  updateSeller: (seller: Partial<Seller> & { id: string }) => void;
  removeSeller: (id: string) => void;
  clearSellers: () => void;
};

export const useSellerStore = create<SellerState>((set, get) => ({
  sellers: [],
  selectedSeller: null,
  setSellers: (sellers) => set({ sellers }),
  setSelectedSeller: (selectedSeller) => set({ selectedSeller }),
  addSeller: (seller) =>
    set((state) => ({ sellers: [seller, ...state.sellers] })),
  updateSeller: (seller) =>
    set((state) => ({
      sellers: state.sellers.map((item) =>
        item.id === seller.id ? { ...item, ...seller } : item
      ),
      selectedSeller:
        state.selectedSeller?.id === seller.id
          ? { ...state.selectedSeller, ...seller }
          : state.selectedSeller,
    })),
  removeSeller: (id) =>
    set((state) => ({
      sellers: state.sellers.filter((item) => item.id !== id),
      selectedSeller:
        state.selectedSeller?.id === id ? null : state.selectedSeller,
    })),
  clearSellers: () => set({ sellers: [] }),
}));
