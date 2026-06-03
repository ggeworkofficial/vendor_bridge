import { create } from "zustand";


export type User = {
  id: string;
  full_name: string;
  email: string;
  role: "buyer" | "contributor" | "admin";
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));