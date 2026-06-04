export type PaymentAccountType = "bank" | "telebirr" | "cbe_birr";

export interface PaymentAccount {
  id: string;
  type: PaymentAccountType;
  label: string;
  account_name: string;
  account_number: string;
  details: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentAccountQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  order?: "asc" | "desc";
}

export interface PaymentAccountListResponse {
  data: PaymentAccount[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaymentAccountCreatePayload {
  type: PaymentAccountType;
  label: string;
  account_name: string;
  account_number: string;
  details?: string;
}

export interface PaymentAccountUpdatePayload {
  type?: PaymentAccountType;
  label?: string;
  account_name?: string;
  account_number?: string;
  details?: string;
}
