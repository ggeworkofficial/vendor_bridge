import { api } from "./client";
import type { OrdersListResponse, Order, OrdersQueryParams, OrderUpdatePayload, CreateOrderRequest } from "@/types/order";

export const getOrders = (params?: OrdersQueryParams) => api.get<OrdersListResponse>("/orders", { params });
export const getOrder = (id: string) => api.get<Order>(`/orders/${id}`);
export const createOrder = (body: CreateOrderRequest) => api.post("/orders", body);
export const updateOrder = (id: string, body: OrderUpdatePayload) => api.put<Order>(`/orders/${id}`, body);
