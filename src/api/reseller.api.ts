import { api } from "./client";
import type {
  ResellerApplication,
  ResellerApplicationCreatePayload,
  ResellerApplicationUpdatePayload,
  Reseller,
  ResellerShare,
  ResellerShareCreatePayload,
  ResellerPayout,
  ResellerPayoutCreatePayload,
  ResellerAnalytics,
  ResellerListResponse,
  ResellerQueryParams,
} from "@/types/reseller";

// Reseller Application
export const createResellerApplication = (data: ResellerApplicationCreatePayload) =>
  api.post<ResellerApplication>("/reseller-applications", data);

export const getResellerApplications = (params?: ResellerQueryParams) =>
  api.get<{ data: ResellerApplication[]; meta: { page: number; limit: number; total: number } }>("/reseller-applications", { params });

export const getResellerApplication = (id: string) =>
  api.get<ResellerApplication>(`/reseller-applications/${id}`);

export const updateResellerApplication = (id: string, body: ResellerApplicationUpdatePayload) =>
  api.put<ResellerApplication>(`/reseller-applications/${id}`, body);

export const getMyResellerApplication = () =>
  api.get<ResellerApplication>("/reseller-applications/my");

// Reseller Profile
export const getResellerProfile = () =>
  api.get<Reseller>("/resellers/me");

export const getResellers = (params?: ResellerQueryParams) =>
  api.get<ResellerListResponse>("/resellers", { params });

export const updateResellerProfile = (id: string, body: Partial<Reseller>) =>
  api.put<Reseller>(`/resellers/${id}`, body);

// Product Sharing
export const createResellerShare = (data: ResellerShareCreatePayload) =>
  api.post<ResellerShare>("/reseller-shares", data);

export const getResellerShares = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: ResellerShare[]; meta: { page: number; limit: number; total: number } }>("/reseller-shares", { params });

export const getResellerShare = (id: string) =>
  api.get<ResellerShare>(`/reseller-shares/${id}`);

export const deleteResellerShare = (id: string) =>
  api.delete(`/reseller-shares/${id}`);

// Analytics
export const getResellerAnalytics = () =>
  api.get<ResellerAnalytics>("/resellers/analytics");

// Payouts
export const createResellerPayout = (data: ResellerPayoutCreatePayload) =>
  api.post<ResellerPayout>("/reseller-payouts", data);

export const getResellerPayouts = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: ResellerPayout[]; meta: { page: number; limit: number; total: number } }>("/reseller-payouts", { params });

export const getResellerPayout = (id: string) =>
  api.get<ResellerPayout>(`/reseller-payouts/${id}`);

// Link Tracking
export const trackResellerClick = (shareId: string, data?: { ip_address?: string; user_agent?: string; referrer?: string }) =>
  api.post(`/reseller-shares/${shareId}/click`, data);
