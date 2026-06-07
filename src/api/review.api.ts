import { api } from "./client";
import type {
  Review,
  ReviewListResponse,
  ReviewQueryParam,
  ReviewCreatePayload,
} from "@/types/review";

export const getReviews = (params: ReviewQueryParam) =>
  api.get<ReviewListResponse>("/reviews", { params });

export const getReview = (id: string) =>
  api.get<Review>(`/reviews/${id}`);

export const createReview = (body: ReviewCreatePayload) =>
  api.post<Review>("/reviews", body);

export const deleteReview = (id: string) =>
  api.delete(`/reviews/${id}`);
