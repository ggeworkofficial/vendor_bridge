import { create } from "zustand";
import type { Complaint } from "@/types/complaint";

type ComplaintState = {
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  setComplaints: (complaints: Complaint[]) => void;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  addComplaint: (complaint: Complaint) => void;
  getComplaint: (id: string) => Complaint | null;
  updateComplaint: (complaint: Partial<Complaint> & { id: string }) => void;
  removeComplaint: (id: string) => void;
  clearComplaints: () => void;
};

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  selectedComplaint: null,
  setComplaints: (complaints) => set({ complaints }),
  setSelectedComplaint: (complaint) => set({ selectedComplaint: complaint }),
  addComplaint: (complaint) => set((state) => ({ complaints: [complaint, ...state.complaints] })),
  getComplaint: (id) => get().complaints.find((c) => c.id === id) || null,
  updateComplaint: (complaint) =>
    set((state) => ({
      complaints: state.complaints.map((c) => (c.id === complaint.id ? { ...c, ...complaint } : c)),
      selectedComplaint: state.selectedComplaint?.id === complaint.id ? { ...state.selectedComplaint, ...complaint } : state.selectedComplaint,
    })),
  removeComplaint: (id) =>
    set((state) => ({
      complaints: state.complaints.filter((c) => c.id !== id),
      selectedComplaint: state.selectedComplaint?.id === id ? null : state.selectedComplaint,
    })),
  clearComplaints: () => set({ complaints: [] }),
}));
