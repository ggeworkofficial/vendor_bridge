import { create } from "zustand";
import type { SellerApplication } from "@/types/seller-application";

type SellerApplicationState = {
  application: SellerApplication | null;
  applications: SellerApplication[];
  setApplication: (application: SellerApplication | null) => void;
  setApplications: (applications: SellerApplication[]) => void;
  addApplication: (application: SellerApplication) => void;
  updateApplication: (application: Partial<SellerApplication> & { id: string }) => void;
  deleteApplication: (id: string) => void;
  clearApplications: () => void;
};

export const useSellerApplicationStore = create<SellerApplicationState>((set, get) => ({
  application: null,
  applications: [],
  setApplication: (application) => set({ application }),
  setApplications: (applications) => set({ applications }),
  addApplication: (application) =>
    set((state) => ({ applications: [application, ...state.applications] })),
  updateApplication: (application) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === application.id ? { ...app, ...application } : app
      ),
      application:
        state.application?.id === application.id
          ? { ...state.application, ...application }
          : state.application,
    })),
  deleteApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
      application: state.application?.id === id ? null : state.application,
    })),
  clearApplications: () => set({ applications: [], application: null }),
}));
