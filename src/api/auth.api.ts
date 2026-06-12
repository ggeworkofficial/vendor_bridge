import { api } from "./client";

export const login = (data: { email: string; password: string }) => api.post("/auth/login", data);

export const register = (data: { full_name: string; email: string; password: string }) => api.post("/auth/register", data);

export const logout = () => api.delete("/auth/logout");

export const getCurrentUser = () => api.get("/auth/me");