export type QualityLabel = "high" | "medium" | "low";
export type OrderStatus = "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type UserRole = "buyer" | "contributor" | "admin";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  qualityLabel: QualityLabel;
  verified: boolean;
  images: string[];
  category: string;
  location: string;
  lastUpdated: string;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  address: string;
  createdAt: string;
  estimatedDelivery: string;
}
