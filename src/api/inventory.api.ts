import { api } from "./client";
import type { InventoryListResponse, InventoryProduct, InventoryQueryParam, InventoryUpdatePayload } from "@/types/inventory";

type CreateInventoryPayload = Omit<InventoryProduct, "id" | "category" | "seller" | "images" | "rating"  | "reviewCount" |  "created_at" | "updated_at"> & {
  category_id: string;
  seller_id: string;
};

export const createInventory = (data: FormData) =>
  api.post<InventoryProduct>("/inventory", data);

export const getInventory = (params?: InventoryQueryParam) =>
  api.get<InventoryListResponse>("/inventory", { params });

export const getInventoryItem = (id: string) =>
  api.get<InventoryProduct>(`/inventory/${id}`);

export const updateInventory = (id: string, body: InventoryUpdatePayload) =>
  api.put<InventoryProduct>(`/inventory/${id}`, body);

export const deleteInventory = (id: string) =>
  api.delete(`/inventory/${id}`);
