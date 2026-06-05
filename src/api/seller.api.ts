import { api } from "./client";
import type { Seller, SellerListResponse, GetSellerParams, CreateSellerBody, UpdateSellerBody } from "@/types/seller";

export const getSellers = (params?: GetSellerParams) =>
  api.get<SellerListResponse>("/sellers", { params });

export const getSeller = (id: string) => api.get<Seller>(`/sellers/${id}`);

export const createSeller = (body: CreateSellerBody) =>
  api.post<Seller>("/sellers", body);

export const updateSeller = (id: string, body: UpdateSellerBody) =>
  api.put<Seller>(`/sellers/${id}`, body);

export const deleteSeller = (id: string) => api.delete(`/sellers/${id}`);
