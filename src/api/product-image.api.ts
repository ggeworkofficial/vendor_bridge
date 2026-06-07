import { api } from "./client";
import type {
  ProductImage,
  ProductImageListResponse,
  ProductImageQueryParam,
  ProductImageUpdatePayload,
} from "@/types/product-image";

export const getProductImages = (params: ProductImageQueryParam) =>
  api.get<ProductImageListResponse>("/product-images", { params });

export const getProductImage = (id: string) =>
  api.get<ProductImage>(`/product-images/${id}`);

export const createProductImage = (body: FormData) =>
  api.post<ProductImage>("/product-images", body);

export const updateProductImage = (id: string, body: ProductImageUpdatePayload) =>
  api.put<ProductImage>(`/product-images/${id}`, body);

export const deleteProductImage = (id: string) =>
  api.delete(`/product-images/${id}`);
