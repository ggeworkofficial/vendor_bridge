export type ServiceStatus = "active" | "inactive" | "pending_review" | "rejected";

export type ServiceCategory =
  | "creative"
  | "technical"
  | "marketing"
  | "professional"
  | "local";

export interface ServiceProvider {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  skills: string[];
  certifications: string[];
  hourly_rate: number;
  rating: number;
  review_count: number;
  total_completed_projects: number;
  response_time: number; // in hours
  availability: "available" | "busy" | "offline";
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceProviderCreatePayload {
  full_name: string;
  bio: string;
  skills: string[];
  certifications?: string[];
  hourly_rate: number;
}

export interface ServiceProviderUpdatePayload {
  full_name?: string;
  bio?: string;
  skills?: string[];
  certifications?: string[];
  hourly_rate?: number;
  availability?: "available" | "busy" | "offline";
}

export interface Service {
  id: string;
  provider_id: string;
  provider: ServiceProvider;
  title: string;
  description: string;
  category: ServiceCategory;
  pricing_type: "hourly" | "project" | "package";
  price: number;
  delivery_time: number; // in days
  revisions: number;
  requirements: string[];
  portfolio_images: string[];
  status: ServiceStatus;
  views: number;
  orders: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreatePayload {
  title: string;
  description: string;
  category: ServiceCategory;
  pricing_type: "hourly" | "project" | "package";
  price: number;
  delivery_time: number;
  revisions: number;
  requirements: string[];
}

export interface ServiceUpdatePayload {
  title?: string;
  description?: string;
  category?: ServiceCategory;
  pricing_type?: "hourly" | "project" | "package";
  price?: number;
  delivery_time?: number;
  revisions?: number;
  requirements?: string[];
  status?: ServiceStatus;
}

export interface ServiceRequest {
  id: string;
  service_id: string;
  service: Service;
  client_id: string;
  client_name: string;
  description: string;
  budget?: number;
  deadline?: string;
  status: "open" | "in_review" | "accepted" | "rejected" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestCreatePayload {
  service_id: string;
  description: string;
  budget?: number;
  deadline?: string;
}

export interface ServiceProposal {
  id: string;
  request_id: string;
  provider_id: string;
  provider: ServiceProvider;
  proposed_price: number;
  proposed_delivery: string;
  cover_letter: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface ServiceProposalCreatePayload {
  request_id: string;
  proposed_price: number;
  proposed_delivery: string;
  cover_letter: string;
}

export interface ServiceProject {
  id: string;
  service_id: string;
  service: Service;
  request_id?: string;
  proposal_id?: string;
  client_id: string;
  client_name: string;
  provider_id: string;
  provider: ServiceProvider;
  status: "pending" | "in_progress" | "in_review" | "completed" | "cancelled";
  agreed_price: number;
  escrow_amount: number;
  milestones: {
    id: string;
    title: string;
    description: string;
    amount: number;
    status: "pending" | "completed" | "approved";
    due_date: string;
  }[];
  start_date: string;
  deadline: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceReview {
  id: string;
  project_id: string;
  service_id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ServiceReviewCreatePayload {
  project_id: string;
  service_id: string;
  rating: number;
  comment?: string;
}

export interface ServiceMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ServiceListResponse {
  data: Service[];
  meta: ServiceMeta;
}

export type ServiceQueryParams = {
  page?: number;
  limit?: number;
  category?: ServiceCategory;
  status?: ServiceStatus;
  provider_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  pricing_type?: "hourly" | "project" | "package";
  sort?: "price" | "rating" | "orders" | "created_at";
  order?: "asc" | "desc";
};
