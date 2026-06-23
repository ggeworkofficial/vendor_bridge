export type ResellerStatus = "pending" | "approved" | "rejected" | "suspended";

export interface ResellerApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  social_media_accounts: {
    platform: string;
    username: string;
    url: string;
  }[];
  marketing_experience: string;
  preferred_categories: string[];
  status: ResellerStatus;
  rejection_reason?: string;
  admin_notes?: string;
  commission_rate: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface ResellerApplicationCreatePayload {
  full_name: string;
  email: string;
  phone: string;
  social_media_accounts: {
    platform: string;
    username: string;
    url: string;
  }[];
  marketing_experience: string;
  preferred_categories: string[];
}

export interface ResellerApplicationUpdatePayload {
  status?: ResellerStatus;
  rejection_reason?: string;
  admin_notes?: string;
  commission_rate?: number;
}

export interface Reseller {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  commission_rate: number;
  total_earnings: number;
  available_balance: number;
  total_clicks: number;
  total_conversions: number;
  status: ResellerStatus;
  created_at: string;
  updated_at: string;
}

export interface ResellerShare {
  id: string;
  reseller_id: string;
  product_id: string;
  caption: string;
  generated_link: string;
  total_clicks: number;
  total_conversions: number;
  created_at: string;
}

export interface ResellerShareCreatePayload {
  product_id: string;
  caption: string;
}

export interface ResellerClick {
  id: string;
  reseller_share_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  converted: boolean;
  created_at: string;
}

export interface ResellerPayout {
  id: string;
  reseller_id: string;
  amount: number;
  status: "pending" | "processing" | "paid" | "rejected";
  payment_method: string;
  payment_details: string;
  requested_at: string;
  processed_at?: string;
  rejection_reason?: string;
}

export interface ResellerPayoutCreatePayload {
  amount: number;
  payment_method: string;
  payment_details: string;
}

export interface ResellerAnalytics {
  total_earnings: number;
  available_balance: number;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  top_products: {
    product_id: string;
    product_name: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }[];
  recent_shares: ResellerShare[];
  payout_history: ResellerPayout[];
}

export interface ResellerMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ResellerListResponse {
  data: Reseller[];
  meta: ResellerMeta;
}

export type ResellerQueryParams = {
  page?: number;
  limit?: number;
  status?: ResellerStatus;
  search?: string;
  sort?: "created_at" | "total_earnings" | "total_conversions";
  order?: "asc" | "desc";
};
