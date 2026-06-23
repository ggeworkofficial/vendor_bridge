import { create } from "zustand";
import type { Reseller, ResellerShare, ResellerPayout, ResellerAnalytics } from "@/types/reseller";

type ResellerState = {
  profile: Reseller | null;
  shares: ResellerShare[];
  payouts: ResellerPayout[];
  analytics: ResellerAnalytics | null;
  setProfile: (profile: Reseller | null) => void;
  setShares: (shares: ResellerShare[]) => void;
  setPayouts: (payouts: ResellerPayout[]) => void;
  setAnalytics: (analytics: ResellerAnalytics | null) => void;
  addShare: (share: ResellerShare) => void;
  updateShare: (share: Partial<ResellerShare> & { id: string }) => void;
  deleteShare: (id: string) => void;
  addPayout: (payout: ResellerPayout) => void;
  updatePayout: (payout: Partial<ResellerPayout> & { id: string }) => void;
  clearResellerData: () => void;
};

export const useResellerStore = create<ResellerState>((set, get) => ({
  profile: null,
  shares: [],
  payouts: [],
  analytics: null,
  setProfile: (profile) => set({ profile }),
  setShares: (shares) => set({ shares }),
  setPayouts: (payouts) => set({ payouts }),
  setAnalytics: (analytics) => set({ analytics }),
  addShare: (share) => set((state) => ({ shares: [share, ...state.shares] })),
  updateShare: (share) =>
    set((state) => ({
      shares: state.shares.map((s) => (s.id === share.id ? { ...s, ...share } : s)),
    })),
  deleteShare: (id) =>
    set((state) => ({
      shares: state.shares.filter((s) => s.id !== id),
    })),
  addPayout: (payout) => set((state) => ({ payouts: [payout, ...state.payouts] })),
  updatePayout: (payout) =>
    set((state) => ({
      payouts: state.payouts.map((p) => (p.id === payout.id ? { ...p, ...payout } : p)),
    })),
  clearResellerData: () => set({ profile: null, shares: [], payouts: [], analytics: null }),
}));
