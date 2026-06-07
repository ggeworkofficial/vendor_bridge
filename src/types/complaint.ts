export type ComplaintStatus = "open" | "investigating" | "resolved";
export type ComplaintPriority = "low" | "medium" | "high";

export interface ComplaintUser {
  id: string;
  full_name: string;
}

export interface ComplaintOrder {
  id: string;
}

export interface Complaint {
  id: string;
  user: ComplaintUser;
  order: ComplaintOrder;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  created_at: string;
  updated_at: string;
}

export interface ComplaintMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ComplaintListResponse {
  data: Complaint[];
  meta: ComplaintMeta;
}

export type ComplaintQueryParam = {
  page?: number;
  limit?: number;
  order_id?: string;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  search?: string;
  sort?: "created_at" | "updated_at";
  order?: "asc" | "desc";
};

export type ComplaintCreatePayload = {
  order_id: string;
  subject: string;
  description: string;
};

export type ComplaintUpdatePayload = {
  subject?: string;
  description?: string;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
};
