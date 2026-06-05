import { api } from "./client";
import type {
  Category,
  CategoryListResponse,
  CategoryQueryParam,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from "@/types/category";

export const getCategories = (params?: CategoryQueryParam) =>
  api.get<CategoryListResponse>("/categories", { params });

export const getCategory = (id: string) =>
  api.get<Category>(`/categories/${id}`);

export const createCategory = (body: CategoryCreatePayload) =>
  api.post<Category>("/categories", body);

export const updateCategory = (id: string, body: CategoryUpdatePayload) =>
  api.put<Category>(`/categories/${id}`, body);

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`);
