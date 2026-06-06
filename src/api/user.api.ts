import axios from "axios";
import { api } from "./client";

export type UserQueryParam = {
    page?: number;
    limit?: number;
    role?: 'admin' | 'buyer' | 'contributor';
    status?: "active" | "suspended";
    search?: string;
    sort?: 'created_at' | 'full_name' | 'email';
    order?: 'asc' | 'desc';
}

export const getUser = (id: string) => api.get(`/users/${id}`);
export const getUsers = (params?: UserQueryParam) => api.get("/users", { params });
export const updateUser = (id: string, data: { full_name?: string; email?: string }) => api.put(`/users/me/${id}`, data);
export const updateUserAdmin = (id: string, data: { role?: 'admin' | 'buyer' | 'contributor'; status?: "active" | "suspended" }) => api.put(`/users/admin/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);