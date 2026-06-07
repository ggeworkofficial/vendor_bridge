export interface ComplaintMessageSender {
  id: string;
  full_name: string;
  role: "admin" | "buyer" | "contributor";
}

export interface ComplaintMessage {
  id: string;
  complaint_id: string;
  sender: ComplaintMessageSender;
  message: string;
  created_at: string;
}

export interface ComplaintMessageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ComplaintMessageListResponse {
  data: ComplaintMessage[];
  meta: ComplaintMessageMeta;
}

export type ComplaintMessageQueryParam = {
  page?: number;
  limit?: number;
  complaint_id?: string;
  search?: string;
  sort?: "created_at";
  order?: "asc" | "desc";
};

export type ComplaintMessageCreatePayload = {
  complaint_id: string;
  message: string;
};
