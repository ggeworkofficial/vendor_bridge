import { create } from "zustand";
import type { PaymentAccount } from "@/types/payment-account";

type PaymentAccountState = {
  paymentAccounts: PaymentAccount[];
  selectedPaymentAccount: PaymentAccount | null;
  setPaymentAccounts: (accounts: PaymentAccount[]) => void;
  setSelectedPaymentAccount: (account: PaymentAccount | null) => void;
  addPaymentAccount: (account: PaymentAccount) => void;
  updatePaymentAccount: (account: Partial<PaymentAccount> & { id: string }) => void;
  removePaymentAccount: (id: string) => void;
  clearPaymentAccounts: () => void;
};

export const usePaymentAccountStore = create<PaymentAccountState>((set, get) => ({
  paymentAccounts: [],
  selectedPaymentAccount: null,
  setPaymentAccounts: (paymentAccounts) => set({ paymentAccounts }),
  setSelectedPaymentAccount: (selectedPaymentAccount) => set({ selectedPaymentAccount }),
  addPaymentAccount: (paymentAccount) =>
    set((state) => ({ paymentAccounts: [paymentAccount, ...state.paymentAccounts] })),
  updatePaymentAccount: (paymentAccount) =>
    set((state) => ({
      paymentAccounts: state.paymentAccounts.map((account) =>
        account.id === paymentAccount.id ? { ...account, ...paymentAccount } : account
      ),
      selectedPaymentAccount:
        state.selectedPaymentAccount?.id === paymentAccount.id
          ? { ...state.selectedPaymentAccount, ...paymentAccount }
          : state.selectedPaymentAccount,
    })),
  removePaymentAccount: (id) =>
    set((state) => ({
      paymentAccounts: state.paymentAccounts.filter((account) => account.id !== id),
      selectedPaymentAccount:
        state.selectedPaymentAccount?.id === id ? null : state.selectedPaymentAccount,
    })),
  clearPaymentAccounts: () => set({ paymentAccounts: [] }),
}));
