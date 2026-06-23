import { create } from "zustand";
import type { ServiceProvider, Service, ServiceRequest, ServiceProposal, ServiceProject, ServiceReview } from "@/types/service";

type ServiceState = {
  provider: ServiceProvider | null;
  services: Service[];
  requests: ServiceRequest[];
  proposals: ServiceProposal[];
  projects: ServiceProject[];
  reviews: ServiceReview[];
  setProvider: (provider: ServiceProvider | null) => void;
  setServices: (services: Service[]) => void;
  setRequests: (requests: ServiceRequest[]) => void;
  setProposals: (proposals: ServiceProposal[]) => void;
  setProjects: (projects: ServiceProject[]) => void;
  setReviews: (reviews: ServiceReview[]) => void;
  addService: (service: Service) => void;
  updateService: (service: Partial<Service> & { id: string }) => void;
  deleteService: (id: string) => void;
  addRequest: (request: ServiceRequest) => void;
  updateRequest: (request: Partial<ServiceRequest> & { id: string }) => void;
  addProposal: (proposal: ServiceProposal) => void;
  updateProposal: (proposal: Partial<ServiceProposal> & { id: string }) => void;
  updateProject: (project: Partial<ServiceProject> & { id: string }) => void;
  addReview: (review: ServiceReview) => void;
  clearServiceData: () => void;
};

export const useServiceStore = create<ServiceState>((set, get) => ({
  provider: null,
  services: [],
  requests: [],
  proposals: [],
  projects: [],
  reviews: [],
  setProvider: (provider) => set({ provider }),
  setServices: (services) => set({ services }),
  setRequests: (requests) => set({ requests }),
  setProposals: (proposals) => set({ proposals }),
  setProjects: (projects) => set({ projects }),
  setReviews: (reviews) => set({ reviews }),
  addService: (service) => set((state) => ({ services: [service, ...state.services] })),
  updateService: (service) =>
    set((state) => ({
      services: state.services.map((s) => (s.id === service.id ? { ...s, ...service } : s)),
    })),
  deleteService: (id) =>
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
    })),
  addRequest: (request) => set((state) => ({ requests: [request, ...state.requests] })),
  updateRequest: (request) =>
    set((state) => ({
      requests: state.requests.map((r) => (r.id === request.id ? { ...r, ...request } : r)),
    })),
  addProposal: (proposal) => set((state) => ({ proposals: [proposal, ...state.proposals] })),
  updateProposal: (proposal) =>
    set((state) => ({
      proposals: state.proposals.map((p) => (p.id === proposal.id ? { ...p, ...proposal } : p)),
    })),
  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? { ...p, ...project } : p)),
    })),
  addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),
  clearServiceData: () => set({
    provider: null,
    services: [],
    requests: [],
    proposals: [],
    projects: [],
    reviews: [],
  }),
}));
