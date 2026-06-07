import { api } from "./client";
import type {
  ComplaintMessage,
  ComplaintMessageListResponse,
  ComplaintMessageQueryParam,
  ComplaintMessageCreatePayload,
} from "@/types/complaint-message";

export const getComplaintMessages = (params?: ComplaintMessageQueryParam) =>
  api.get<ComplaintMessageListResponse>("/complaints/messages", { params });

export const getComplaintMessage = (id: string) =>
  api.get<ComplaintMessage>(`/complaints/messages/${id}`);

export const createComplaintMessage = (body: ComplaintMessageCreatePayload) =>
  api.post<ComplaintMessage>("/complaints/messages", body);
