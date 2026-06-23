import { api } from "./client";
import type {
  BulkListing,
  BulkListingCreatePayload,
  BulkListingUpdatePayload,
  RFQ,
  RFQCreatePayload,
  RFQUpdatePayload,
  RFQQuote,
  RFQQuoteCreatePayload,
  RFQQuoteUpdatePayload,
  BulkOrder,
  BulkOrderCreatePayload,
  BusinessVerification,
  BusinessVerificationCreatePayload,
  BusinessVerificationUpdatePayload,
  BulkListingListResponse,
  RFQListResponse,
  BulkOrderListResponse,
  BulkListingQueryParams,
  RFQQueryParams,
  BulkOrderQueryParams,
} from "@/types/bulk";

// Bulk Listings
export const createBulkListing = (data: BulkListingCreatePayload) =>
  api.post<BulkListing>("/bulk-listings", data);

export const getBulkListings = (params?: BulkListingQueryParams) =>
  api.get<BulkListingListResponse>("/bulk-listings", { params });

export const getBulkListing = (id: string) =>
  api.get<BulkListing>(`/bulk-listings/${id}`);

export const updateBulkListing = (id: string, body: BulkListingUpdatePayload) =>
  api.put<BulkListing>(`/bulk-listings/${id}`, body);

export const deleteBulkListing = (id: string) =>
  api.delete(`/bulk-listings/${id}`);

export const getMyBulkListings = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: BulkListing[]; meta: { page: number; limit: number; total: number } }>("/bulk-listings/my", { params });

// RFQ (Request for Quote)
export const createRFQ = (data: RFQCreatePayload) =>
  api.post<RFQ>("/rfq", data);

export const getRFQs = (params?: RFQQueryParams) =>
  api.get<RFQListResponse>("/rfq", { params });

export const getRFQ = (id: string) =>
  api.get<RFQ>(`/rfq/${id}`);

export const updateRFQ = (id: string, body: RFQUpdatePayload) =>
  api.put<RFQ>(`/rfq/${id}`, body);

export const deleteRFQ = (id: string) =>
  api.delete(`/rfq/${id}`);

export const getMyRFQs = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: RFQ[]; meta: { page: number; limit: number; total: number } }>("/rfq/my", { params });

// RFQ Quotes
export const createRFQQuote = (data: RFQQuoteCreatePayload) =>
  api.post<RFQQuote>("/rfq-quotes", data);

export const getRFQQuotes = (params?: { page?: number; limit?: number; rfq_id?: string; seller_id?: string }) =>
  api.get<{ data: RFQQuote[]; meta: { page: number; limit: number; total: number } }>("/rfq-quotes", { params });

export const getRFQQuote = (id: string) =>
  api.get<RFQQuote>(`/rfq-quotes/${id}`);

export const updateRFQQuote = (id: string, body: RFQQuoteUpdatePayload) =>
  api.put<RFQQuote>(`/rfq-quotes/${id}`, body);

export const getMyRFQQuotes = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: RFQQuote[]; meta: { page: number; limit: number; total: number } }>("/rfq-quotes/my", { params });

// Bulk Orders
export const createBulkOrder = (data: BulkOrderCreatePayload) =>
  api.post<BulkOrder>("/bulk-orders", data);

export const getBulkOrders = (params?: BulkOrderQueryParams) =>
  api.get<BulkOrderListResponse>("/bulk-orders", { params });

export const getBulkOrder = (id: string) =>
  api.get<BulkOrder>(`/bulk-orders/${id}`);

export const updateBulkOrder = (id: string, body: { status?: string; payment_status?: string }) =>
  api.put<BulkOrder>(`/bulk-orders/${id}`, body);

export const getMyBulkOrders = (params?: { page?: number; limit?: number }) =>
  api.get<{ data: BulkOrder[]; meta: { page: number; limit: number; total: number } }>("/bulk-orders/my", { params });

// Business Verification
export const createBusinessVerification = (data: BusinessVerificationCreatePayload) =>
  api.post<BusinessVerification>("/business-verification", data);

export const getBusinessVerifications = (params?: { page?: number; limit?: number; status?: string }) =>
  api.get<{ data: BusinessVerification[]; meta: { page: number; limit: number; total: number } }>("/business-verification", { params });

export const getBusinessVerification = (id: string) =>
  api.get<BusinessVerification>(`/business-verification/${id}`);

export const updateBusinessVerification = (id: string, body: BusinessVerificationUpdatePayload) =>
  api.put<BusinessVerification>(`/business-verification/${id}`, body);

export const getMyBusinessVerification = () =>
  api.get<BusinessVerification>("/business-verification/my");
