import { create } from "zustand";
import type { Receipt } from "@/types/receipt";

type ReceiptState = {
  receipts: Receipt[];
  selectedReceipt: Receipt | null;
  setReceipts: (receipts: Receipt[]) => void;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  addReceipt: (receipt: Receipt) => void;
  updateReceipt: (receipt: Partial<Receipt> & { id: string }) => void;
  clearReceipts: () => void;
};

export const useReceiptStore = create<ReceiptState>((set, get) => ({
  receipts: [],
  selectedReceipt: null,
  setReceipts: (receipts) => set({ receipts }),
  setSelectedReceipt: (selectedReceipt) => set({ selectedReceipt }),
  addReceipt: (receipt) =>
    set((state) => ({ receipts: [receipt, ...state.receipts] })),
  updateReceipt: (receipt) =>
    set((state) => ({
      receipts: state.receipts.map((item) =>
        item.id === receipt.id ? { ...item, ...receipt } : item
      ),
      selectedReceipt:
        state.selectedReceipt?.id === receipt.id
          ? { ...state.selectedReceipt, ...receipt }
          : state.selectedReceipt,
    })),
  clearReceipts: () => set({ receipts: [] }),
}));
