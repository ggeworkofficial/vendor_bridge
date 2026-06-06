export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryMeta {
  page: number;
  limit: number;
  total: number;
}

export interface CategoryListResponse {
  data: Category[];
  meta: CategoryMeta;
}

export type CategoryQueryParam = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "name" | "created_at";
  order?: "asc" | "desc";
};

export type CategoryCreatePayload = {
  name: string;
};

export type CategoryUpdatePayload = {
  name: string;
};
