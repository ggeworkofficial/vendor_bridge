import { api } from "./client";
import type {
  SellerApplication,
  SellerApplicationCreatePayload,
  SellerApplicationUpdatePayload,
  SellerApplicationListResponse,
  SellerApplicationQueryParams,
} from "@/types/seller-application";

export const createSellerApplication = (data: SellerApplicationCreatePayload) =>
  api.post<SellerApplication>("/seller-applications", data);

export const getSellerApplications = (params?: SellerApplicationQueryParams) =>
  api.get<SellerApplicationListResponse>("/seller-applications", { params });

export const getSellerApplication = (id: string) =>
  api.get<SellerApplication>(`/seller-applications/${id}`);

export const updateSellerApplication = (id: string, body: SellerApplicationUpdatePayload) =>
  api.put<SellerApplication>(`/seller-applications/${id}`, body);

export const deleteSellerApplication = (id: string) =>
  api.delete(`/seller-applications/${id}`);

export const getMySellerApplication = () =>
  api.get<SellerApplication>("/seller-applications/my");
