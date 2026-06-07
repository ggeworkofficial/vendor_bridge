import { create } from "zustand";
import type { ComplaintMessage } from "@/types/complaint-message";

type ComplaintMessageState = {
  complaintMessages: ComplaintMessage[];
  selectedComplaintMessage: ComplaintMessage | null;
  setComplaintMessages: (messages: ComplaintMessage[]) => void;
  setSelectedComplaintMessage: (message: ComplaintMessage | null) => void;
  addComplaintMessage: (message: ComplaintMessage) => void;
  getComplaintMessage: (id: string) => ComplaintMessage | null;
  clearComplaintMessages: () => void;
};

export const useComplaintMessageStore = create<ComplaintMessageState>((set, get) => ({
  complaintMessages: [],
  selectedComplaintMessage: null,
  setComplaintMessages: (messages) => set({ complaintMessages: messages }),
  setSelectedComplaintMessage: (message) => set({ selectedComplaintMessage: message }),
  addComplaintMessage: (message) => set((state) => ({ complaintMessages: [message, ...state.complaintMessages] })),
  getComplaintMessage: (id) => get().complaintMessages.find((m) => m.id === id) || null,
  clearComplaintMessages: () => set({ complaintMessages: [] }),
}));
