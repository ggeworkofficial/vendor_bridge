import { create } from "zustand";
import type { Order } from "@/types/order";

type OrderState = {
  orders: Order[];
  selectedOrder: Order | null;
  setOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  getOrder: (id: string) => Order | null;
  updateOrder: (order: Partial<Order> & { id: string }) => void;
  clearOrders: () => void;
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  getOrder: (id) => get().orders.find((o) => o.id === id) || null,
  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === order.id ? { ...o, ...order } : o)),
      selectedOrder: state.selectedOrder?.id === order.id ? { ...state.selectedOrder, ...order } : state.selectedOrder,
    })),
  clearOrders: () => set({ orders: [] }),
}));
