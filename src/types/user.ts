export type User = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "buyer" | "contributor";
  status: "active" | "suspended";
  created_at: string;
  updated_at: string;
};