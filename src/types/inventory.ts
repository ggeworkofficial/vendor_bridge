export type InventoryQualityLabel = "high" | "medium" | "low";
export type InventorySortField = "name" | "quantity" | "price" | "verified" | "created_at";
export type InventoryOrder = "asc" | "desc";
export type PostedBy = "vendorbridge" | "vendor";
export type ProductApprovalStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface InventoryImage {
  image_url: string;
  image_name: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
}

export interface InventorySeller {
  id: string;
  name: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  verified: boolean;
  quality_label: InventoryQualityLabel;
  images: InventoryImage[];
  category: InventoryCategory;
  seller: InventorySeller;
  location: string;
  rating: number;
  reviewCount: number;
  posted_by: PostedBy;
  approval_status: ProductApprovalStatus;
  listing_type?: "retail" | "bulk" | "both";
  created_at: string;
  updated_at: string;
}

export interface InventoryMeta {
  page: number;
  limit: number;
  total: number;
}

export interface InventoryListResponse {
  data: InventoryProduct[];
  meta: InventoryMeta;
}

export type InventoryQueryParam = {
  page?: number;
  limit?: number;
  quality_label?: InventoryQualityLabel;
  verified?: "true" | "false";
  search?: string;
  sort?: InventorySortField;
  order?: InventoryOrder;
  posted_by?: PostedBy;
  approval_status?: ProductApprovalStatus;
  listing_type?: "retail" | "bulk" | "both";
};

export type InventoryUpdatePayload = Partial<
  Pick<
    InventoryProduct,
    "name" | "description" | "price" | "quantity" | "quality_label" | "verified" | "location" | "approval_status"
  >
>;
