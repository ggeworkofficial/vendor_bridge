import { create } from "zustand";
import type { Logistics } from "@/types/logistics";

type LogisticsState = {
  logistics: Logistics[];
  selectedLogistics: Logistics | null;
  setLogistics: (logistics: Logistics[]) => void;
  setSelectedLogistics: (logistics: Logistics | null) => void;
  getLogistics: (id: string) => Logistics | null;
  addLogistics: (logistics: Logistics) => void;
  updateLogistics: (logistics: Partial<Logistics> & { id: string }) => void;
  clearLogistics: () => void;
};

export const useLogisticsStore = create<LogisticsState>((set, get) => ({
  logistics: [],
  selectedLogistics: null,
  setLogistics: (logistics) => set({ logistics }),
  setSelectedLogistics: (logistics) => set({ selectedLogistics: logistics }),
  getLogistics: (id) => get().logistics.find((l) => l.id === id) || null,
  addLogistics: (logistics) =>
    set((state) => ({
      logistics: [logistics, ...state.logistics],
    })),
  updateLogistics: (logistics) =>
    set((state) => ({
      logistics: state.logistics.map((l) =>
        l.id === logistics.id ? { ...l, ...logistics } : l
      ),
      selectedLogistics:
        state.selectedLogistics?.id === logistics.id
          ? { ...state.selectedLogistics, ...logistics }
          : state.selectedLogistics,
    })),
  clearLogistics: () => set({ logistics: [] }),
}));
