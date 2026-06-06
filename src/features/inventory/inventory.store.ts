import { create } from "zustand";
import type { InventoryProduct } from "@/types/inventory";

type InventoryState = {
  inventory: InventoryProduct[];
  selectedProduct: InventoryProduct | null;
  setInventory: (inventory: InventoryProduct[]) => void;
  setSelectedProduct: (product: InventoryProduct | null) => void;
  getProduct: (id: string) => InventoryProduct | null;
  updateProduct: (product: Partial<InventoryProduct> & { id: string }) => void;
  deleteProduct: (id: string) => void;
  clearInventory: () => void;
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [],
  selectedProduct: null,
  setInventory: (inventory) => set({ inventory }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  getProduct: (id) => get().inventory.find((product) => product.id === id) || null,
  updateProduct: (product) =>
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === product.id ? { ...item, ...product } : item
      ),
      selectedProduct:
        state.selectedProduct?.id === product.id
          ? { ...state.selectedProduct, ...product }
          : state.selectedProduct,
    })),
  deleteProduct: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((item) => item.id !== id),
      selectedProduct:
        state.selectedProduct?.id === id ? null : state.selectedProduct,
    })),
  clearInventory: () => set({ inventory: [] }),
}));
