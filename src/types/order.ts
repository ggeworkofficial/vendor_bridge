export type OrderStatus = "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled" | "rejected";
export type PaymentStatus = "paid" | "unpaid" | "pending_review" | "rejected";
export type PaymentMethod = "full" | "advance" | "cod";

export interface OrderProduct {
  id: string;
  quantity: number;
  price: string;
}

export interface OrderUser {
  id: string;
  full_name: string;
}

export interface Order {
  id: string;
  user: OrderUser;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  total_amount: string;
  address: string;
  products: OrderProduct[];
  created_at: string;
  updated_at: string;
}

export interface OrdersMeta {
  page: number;
  limit: number;
  total: number;
}

export interface OrdersListResponse {
  data: Order[];
  meta: OrdersMeta;
}

export type OrdersQueryParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  sort?: "total_amount" | "created_at";
  order?: "asc" | "desc";
};

export type OrderUpdatePayload = {
  status: OrderStatus;
};
