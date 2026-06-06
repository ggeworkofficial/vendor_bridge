export type ReceiptStatus = "pending_review" | "approved" | "rejected";
export type ReceiptPaymentMethod = "full" | "advance" | "cod";

export interface ReceiptUser {
  id: string;
  full_name: string;
}

export interface ReceiptOrder {
  id: string;
  user: ReceiptUser;
}

export interface Receipt {
  id: string;
  amount: string;
  payment_method: ReceiptPaymentMethod;
  account: string;
  file_name: string;
  file_url: string;
  status: ReceiptStatus;
  note: string;
  created_at: string;
  updated_at: string;
  order: ReceiptOrder;
}

export interface ReceiptQueryParams {
  page?: number;
  limit?: number;
  payment_method?: ReceiptPaymentMethod;
  status?: ReceiptStatus;
  search?: string;
  sort?: "amount" | "created_at";
  order?: "asc" | "desc";
}

export interface ReceiptListResponse {
  data: Receipt[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ReceiptCreatePayload {
  order_id: string;
  account: string;
  note?: string;
}

export interface ReceiptUpdatePayload {
  status?: ReceiptStatus;
  note?: string;
}
