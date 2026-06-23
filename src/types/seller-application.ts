export type SellerApplicationStatus = "pending" | "approved" | "rejected";

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_type: "individual" | "company" | "cooperative";
  tax_id?: string;
  business_license?: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  description: string;
  product_categories: string[];
  social_media?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
  status: SellerApplicationStatus;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerApplicationCreatePayload {
  business_name: string;
  business_type: "individual" | "company" | "cooperative";
  tax_id?: string;
  business_license?: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  description: string;
  product_categories: string[];
  social_media?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
}

export interface SellerApplicationUpdatePayload {
  status?: SellerApplicationStatus;
  rejection_reason?: string;
  admin_notes?: string;
}

export interface SellerApplicationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SellerApplicationListResponse {
  data: SellerApplication[];
  meta: SellerApplicationMeta;
}

export type SellerApplicationQueryParams = {
  page?: number;
  limit?: number;
  status?: SellerApplicationStatus;
  search?: string;
  sort?: "created_at" | "updated_at" | "business_name";
  order?: "asc" | "desc";
};
