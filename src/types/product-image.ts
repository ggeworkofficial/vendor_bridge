export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  image_name: string;
}

export interface ProductImageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ProductImageListResponse {
  data: ProductImage[];
  meta: ProductImageMeta;
}

export type ProductImageQueryParam = {
  page?: number;
  limit?: number;
  product_id: string;
  search?: string;
  sort?: "created_at" | "updated_at";
  order?: "asc" | "desc";
};

export type ProductImageCreatePayload = {
  product_id: string;
  is_primary?: boolean;
};

export type ProductImageUpdatePayload = {
  is_primary?: boolean;
};
