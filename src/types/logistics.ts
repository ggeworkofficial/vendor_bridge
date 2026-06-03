export type LogisticsStatus = "processing" | "in_transit" | "out_for_delivery" | "delivered";
export type LogisticsOrder = "asc" | "desc";

export interface LogisticsUser {
  id: string;
  full_name: string;
}

export interface LogisticsOrderInfo {
  id: string;
  user: LogisticsUser;
}

export interface Logistics {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: LogisticsStatus;
  origin: string;
  destination: string;
  estimated_eta: string;
  created_at: string;
  updated_at: string;
  order: LogisticsOrderInfo;
}

export interface LogisticsQueryParams {
  page?: number;
  limit?: number;
  order_id?: string;
  status?: LogisticsStatus;
  search?: string;
  order?: LogisticsOrder;
}

export interface LogisticsListResponse {
  data: Logistics[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LogisticsCreatePayload {
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: LogisticsStatus;
  origin: string;
  destination: string;
  estimated_eta: string;
}

export interface LogisticsUpdatePayload {
  carrier?: string;
  tracking_number?: string;
  status?: LogisticsStatus;
  origin?: string;
  destination?: string;
  estimated_eta?: string;
}
