import { api } from "./client";
import type { LogisticsListResponse, Logistics, LogisticsQueryParams, LogisticsCreatePayload, LogisticsUpdatePayload } from "@/types/logistics";

export const getLogistics = (params?: LogisticsQueryParams) =>
  api.get<LogisticsListResponse>("/logistics", { params });

export const getLogisticsItem = (id: string) =>
  api.get<Logistics>(`/logistics/${id}`);

export const createLogistics = (body: LogisticsCreatePayload) =>
  api.post<Logistics>("/logistics", body);

export const updateLogistics = (id: string, body: LogisticsUpdatePayload) =>
  api.put<Logistics>(`/logistics/${id}`, body);
