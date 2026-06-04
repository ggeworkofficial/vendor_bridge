import { api } from "./client";
import type {
  Receipt,
  ReceiptListResponse,
  ReceiptQueryParams,
  ReceiptUpdatePayload,
} from "@/types/receipt";

export const getReceipts = (params?: ReceiptQueryParams) =>
  api.get<ReceiptListResponse>("/receipts", { params });

export const getReceipt = (id: string) =>
  api.get<Receipt>(`/receipts/${id}`);

export const createReceipt = (body: FormData) =>
  api.post<Receipt>("/receipts", body);

export const updateReceipt = (id: string, body: ReceiptUpdatePayload) =>
  api.put<Receipt>(`/receipts/${id}`, body);
