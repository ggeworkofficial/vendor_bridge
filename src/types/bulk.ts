export type ListingType = "retail" | "bulk" | "both";

export interface BulkListing {
  id: string;
  product_id: string;
  listing_type: ListingType;
  min_order_quantity: number;
  tiered_pricing: {
    min_quantity: number;
    price_per_unit: number;
  }[];
  available_quantity: number;
  location: string;
  incoterms: string; // e.g., FOB, CIF, EXW
  lead_time: number; // in days
  sample_available: boolean;
  sample_price?: number;
  created_at: string;
  updated_at: string;
}

export interface BulkListingCreatePayload {
  product_id: string;
  listing_type: ListingType;
  min_order_quantity: number;
  tiered_pricing: {
    min_quantity: number;
    price_per_unit: number;
  }[];
  available_quantity: number;
  location: string;
  incoterms: string;
  lead_time: number;
  sample_available: boolean;
  sample_price?: number;
}

export interface BulkListingUpdatePayload {
  listing_type?: ListingType;
  min_order_quantity?: number;
  tiered_pricing?: {
    min_quantity: number;
    price_per_unit: number;
  }[];
  available_quantity?: number;
  location?: string;
  incoterms?: string;
  lead_time?: number;
  sample_available?: boolean;
  sample_price?: number;
}

export type RFQStatus = "open" | "quoted" | "negotiating" | "accepted" | "rejected" | "expired";

export interface RFQ {
  id: string;
  buyer_id: string;
  buyer_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  budget?: number;
  delivery_deadline?: string;
  delivery_location: string;
  specifications: string;
  status: RFQStatus;
  quotes: RFQQuote[];
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface RFQCreatePayload {
  product_id: string;
  quantity: number;
  budget?: number;
  delivery_deadline?: string;
  delivery_location: string;
  specifications: string;
}

export interface RFQUpdatePayload {
  status?: RFQStatus;
  expires_at?: string;
}

export interface RFQQuote {
  id: string;
  rfq_id: string;
  seller_id: string;
  seller_name: string;
  unit_price: number;
  total_price: number;
  delivery_time: number;
  payment_terms: string;
  valid_until: string;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface RFQQuoteCreatePayload {
  rfq_id: string;
  unit_price: number;
  total_price: number;
  delivery_time: number;
  payment_terms: string;
  valid_until: string;
  notes?: string;
}

export interface RFQQuoteUpdatePayload {
  status?: "pending" | "accepted" | "rejected";
}

export type BulkOrderStatus = "pending" | "confirmed" | "partial_shipment" | " Shipped" | "delivered" | "cancelled";

export interface BulkOrder {
  id: string;
  rfq_id?: string;
  quote_id?: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: BulkOrderStatus;
  payment_status: "unpaid" | "partial" | "paid";
  delivery_address: string;
  shipments: BulkShipment[];
  created_at: string;
  updated_at: string;
}

export interface BulkOrderCreatePayload {
  rfq_id?: string;
  quote_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  delivery_address: string;
}

export interface BulkShipment {
  id: string;
  bulk_order_id: string;
  tracking_number: string;
  carrier: string;
  quantity: number;
  shipped_date: string;
  estimated_delivery: string;
  actual_delivery?: string;
  status: "pending" | "in_transit" | "delivered";
}

export interface BusinessVerification {
  id: string;
  user_id: string;
  business_name: string;
  business_type: "importer" | "manufacturer" | "wholesaler" | "cooperative";
  business_license: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  documents: string[];
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessVerificationCreatePayload {
  business_name: string;
  business_type: "importer" | "manufacturer" | "wholesaler" | "cooperative";
  business_license: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  documents: string[];
}

export interface BusinessVerificationUpdatePayload {
  status?: "pending" | "approved" | "rejected";
  rejection_reason?: string;
}

export interface BulkMeta {
  page: number;
  limit: number;
  total: number;
}

export interface BulkListingListResponse {
  data: BulkListing[];
  meta: BulkMeta;
}

export interface RFQListResponse {
  data: RFQ[];
  meta: BulkMeta;
}

export interface BulkOrderListResponse {
  data: BulkOrder[];
  meta: BulkMeta;
}

export type BulkListingQueryParams = {
  page?: number;
  limit?: number;
  listing_type?: ListingType;
  product_id?: string;
  search?: string;
  sort?: "price" | "quantity" | "created_at";
  order?: "asc" | "desc";
};

export type RFQQueryParams = {
  page?: number;
  limit?: number;
  buyer_id?: string;
  status?: RFQStatus;
  search?: string;
  sort?: "created_at" | "expires_at";
  order?: "asc" | "desc";
};

export type BulkOrderQueryParams = {
  page?: number;
  limit?: number;
  buyer_id?: string;
  seller_id?: string;
  status?: BulkOrderStatus;
  search?: string;
  sort?: "created_at" | "total_amount";
  order?: "asc" | "desc";
};
