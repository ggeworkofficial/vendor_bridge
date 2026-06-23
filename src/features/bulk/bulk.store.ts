import { create } from "zustand";
import type { BulkListing, RFQ, RFQQuote, BulkOrder, BusinessVerification } from "@/types/bulk";

type BulkState = {
  listings: BulkListing[];
  rfqs: RFQ[];
  quotes: RFQQuote[];
  orders: BulkOrder[];
  verification: BusinessVerification | null;
  setListings: (listings: BulkListing[]) => void;
  setRFQs: (rfqs: RFQ[]) => void;
  setQuotes: (quotes: RFQQuote[]) => void;
  setOrders: (orders: BulkOrder[]) => void;
  setVerification: (verification: BusinessVerification | null) => void;
  addListing: (listing: BulkListing) => void;
  updateListing: (listing: Partial<BulkListing> & { id: string }) => void;
  deleteListing: (id: string) => void;
  addRFQ: (rfq: RFQ) => void;
  updateRFQ: (rfq: Partial<RFQ> & { id: string }) => void;
  deleteRFQ: (id: string) => void;
  addQuote: (quote: RFQQuote) => void;
  updateQuote: (quote: Partial<RFQQuote> & { id: string }) => void;
  addOrder: (order: BulkOrder) => void;
  updateOrder: (order: Partial<BulkOrder> & { id: string }) => void;
  clearBulkData: () => void;
};

export const useBulkStore = create<BulkState>((set, get) => ({
  listings: [],
  rfqs: [],
  quotes: [],
  orders: [],
  verification: null,
  setListings: (listings) => set({ listings }),
  setRFQs: (rfqs) => set({ rfqs }),
  setQuotes: (quotes) => set({ quotes }),
  setOrders: (orders) => set({ orders }),
  setVerification: (verification) => set({ verification }),
  addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),
  updateListing: (listing) =>
    set((state) => ({
      listings: state.listings.map((l) => (l.id === listing.id ? { ...l, ...listing } : l)),
    })),
  deleteListing: (id) =>
    set((state) => ({
      listings: state.listings.filter((l) => l.id !== id),
    })),
  addRFQ: (rfq) => set((state) => ({ rfqs: [rfq, ...state.rfqs] })),
  updateRFQ: (rfq) =>
    set((state) => ({
      rfqs: state.rfqs.map((r) => (r.id === rfq.id ? { ...r, ...rfq } : r)),
    })),
  deleteRFQ: (id) =>
    set((state) => ({
      rfqs: state.rfqs.filter((r) => r.id !== id),
    })),
  addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
  updateQuote: (quote) =>
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === quote.id ? { ...q, ...quote } : q)),
    })),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === order.id ? { ...o, ...order } : o)),
    })),
  clearBulkData: () => set({
    listings: [],
    rfqs: [],
    quotes: [],
    orders: [],
    verification: null,
  }),
}));
