export interface SellerUser {
  id: string;
  name: string;
}

export interface Seller {
  id: string;
  name: string;
  location: string;
  contact: string;
  products: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
  user: SellerUser;
}

export interface SellerMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SellerListResponse {
  data: Seller[];
  meta: SellerMeta;
}

export type GetSellerParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "name" | "created_at";
  order?: "asc" | "desc";
};

export type CreateSellerBody = {
  user_id: string;
  name: string;
  location: string;
  contact: string;
  verified: boolean;
};

export type UpdateSellerBody = {
  user_id: string;
  name: string;
  location: string;
  contact: string;
  verified: boolean;
};
