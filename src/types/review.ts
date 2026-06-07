export interface Review {
  id: string;
  product: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ReviewListResponse {
  data: Review[];
  meta: ReviewMeta;
}

export type ReviewQueryParam = {
  page?: number;
  limit?: number;
  product_id: string;
  include_empty_comments?: boolean;
  search?: string;
  sort?: "rating" | "created_at";
  order?: "asc" | "desc";
};

export type ReviewCreatePayload = {
  product_id: string;
  rating: number;
  comment?: string;
};
