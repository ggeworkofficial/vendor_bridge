import { api } from "./client";
import type {
  ServiceProvider,
  ServiceProviderCreatePayload,
  ServiceProviderUpdatePayload,
  Service,
  ServiceCreatePayload,
  ServiceUpdatePayload,
  ServiceRequest,
  ServiceRequestCreatePayload,
  ServiceProposal,
  ServiceProposalCreatePayload,
  ServiceProject,
  ServiceReview,
  ServiceReviewCreatePayload,
  ServiceListResponse,
  ServiceQueryParams,
} from "@/types/service";

// Service Provider
export const createServiceProvider = (data: ServiceProviderCreatePayload) =>
  api.post<ServiceProvider>("/service-providers", data);

export const getServiceProvider = (id: string) =>
  api.get<ServiceProvider>(`/service-providers/${id}`);

export const getMyServiceProvider = () =>
  api.get<ServiceProvider>("/service-providers/me");

export const updateServiceProvider = (id: string, body: ServiceProviderUpdatePayload) =>
  api.put<ServiceProvider>(`/service-providers/${id}`, body);

export const getServiceProviders = (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
  api.get<{ data: ServiceProvider[]; meta: { page: number; limit: number; total: number } }>("/service-providers", { params });

// Services
export const createService = (data: ServiceCreatePayload) =>
  api.post<Service>("/services", data);

export const getServices = (params?: ServiceQueryParams) =>
  api.get<ServiceListResponse>("/services", { params });

export const getService = (id: string) =>
  api.get<Service>(`/services/${id}`);

export const updateService = (id: string, body: ServiceUpdatePayload) =>
  api.put<Service>(`/services/${id}`, body);

export const deleteService = (id: string) =>
  api.delete(`/services/${id}`);

export const getMyServices = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: Service[]; meta: { page: number; limit: number; total: number } }>("/services/my", { params });

// Service Requests
export const createServiceRequest = (data: ServiceRequestCreatePayload) =>
  api.post<ServiceRequest>("/service-requests", data);

export const getServiceRequests = (params?: { page?: number; limit?: number; service_id?: string; client_id?: string }) =>
  api.get<{ data: ServiceRequest[]; meta: { page: number; limit: number; total: number } }>("/service-requests", { params });

export const getServiceRequest = (id: string) =>
  api.get<ServiceRequest>(`/service-requests/${id}`);

export const getMyServiceRequests = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: ServiceRequest[]; meta: { page: number; limit: number; total: number } }>("/service-requests/my", { params });

// Service Proposals
export const createServiceProposal = (data: ServiceProposalCreatePayload) =>
  api.post<ServiceProposal>("/service-proposals", data);

export const getServiceProposals = (params?: { page?: number; limit?: number; request_id?: string; provider_id?: string }) =>
  api.get<{ data: ServiceProposal[]; meta: { page: number; limit: number; total: number } }>("/service-proposals", { params });

export const getServiceProposal = (id: string) =>
  api.get<ServiceProposal>(`/service-proposals/${id}`);

export const updateServiceProposal = (id: string, body: { status?: "pending" | "accepted" | "rejected" }) =>
  api.put<ServiceProposal>(`/service-proposals/${id}`, body);

export const getMyServiceProposals = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: ServiceProposal[]; meta: { page: number; limit: number; total: number } }>("/service-proposals/my", { params });

// Service Projects
export const getServiceProjects = (params?: { page?: number; limit?: number; client_id?: string; provider_id?: string }) =>
  api.get<{ data: ServiceProject[]; meta: { page: number; limit: number; total: number } }>("/service-projects", { params });

export const getServiceProject = (id: string) =>
  api.get<ServiceProject>(`/service-projects/${id}`);

export const updateServiceProject = (id: string, body: { status?: string; milestones?: any[] }) =>
  api.put<ServiceProject>(`/service-projects/${id}`, body);

export const getMyServiceProjects = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: ServiceProject[]; meta: { page: number; limit: number; total: number } }>("/service-projects/my", { params });

// Service Reviews
export const createServiceReview = (data: ServiceReviewCreatePayload) =>
  api.post<ServiceReview>("/service-reviews", data);

export const getServiceReviews = (params?: { page?: number; limit?: number; service_id?: string; project_id?: string }) =>
  api.get<{ data: ServiceReview[]; meta: { page: number; limit: number; total: number } }>("/service-reviews", { params });

export const getServiceReview = (id: string) =>
  api.get<ServiceReview>(`/service-reviews/${id}`);
