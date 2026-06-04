import { api } from "./client";
import type {
  PaymentAccount,
  PaymentAccountListResponse,
  PaymentAccountQueryParams,
  PaymentAccountCreatePayload,
  PaymentAccountUpdatePayload,
} from "@/types/payment-account";

export const getPaymentAccounts = (params?: PaymentAccountQueryParams) =>
  api.get<PaymentAccountListResponse>("/payment-accounts", { params });

export const getPaymentAccount = (id: string) =>
  api.get<PaymentAccount>(`/payment-accounts/${id}`);

export const createPaymentAccount = (body: PaymentAccountCreatePayload) =>
  api.post<PaymentAccount>("/payment-accounts", body);

export const updatePaymentAccount = (id: string, body: PaymentAccountUpdatePayload) =>
  api.put<PaymentAccount>(`/payment-accounts/${id}`, body);

export const deletePaymentAccount = (id: string) =>
  api.delete(`/payment-accounts/${id}`);
