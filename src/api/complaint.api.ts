import { api } from "./client";
import type {
  Complaint,
  ComplaintListResponse,
  ComplaintQueryParam,
  ComplaintCreatePayload,
  ComplaintUpdatePayload,
} from "@/types/complaint";

export const getComplaints = (params?: ComplaintQueryParam) =>
  api.get<ComplaintListResponse>("/complaints", { params });

export const getComplaint = (id: string) =>
  api.get<Complaint>(`/complaints/${id}`);

export const createComplaint = (body: ComplaintCreatePayload) =>
  api.post<Complaint>("/complaints", body);

export const updateComplaint = (id: string, body: ComplaintUpdatePayload) =>
  api.put<Complaint>(`/complaints/${id}`, body);
