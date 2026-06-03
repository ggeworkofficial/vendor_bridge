import { create } from "zustand";
import { User } from "@/features/auth/auth.store";
import { UserQueryParam } from "@/api/user.api";

type UserType =  User & {
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
}

type UserState = {
    users: UserType[];
    selectedUser: UserType | null;
    setSelectedUser: (user: UserType | null) => void;
    setUsers: (users: UserType[]) => void;
    setUser: (user: Omit<UserType, 'created_at' | 'updated_at'>) => void;
    getUser: (id: string) => UserType | null;
    getUsers: (params?: UserQueryParam) => UserType[];
    updateUser: (user: Partial<Omit<UserType, 'created_at' | 'updated_at'>>) => void;
    deleteUser: (id: string) => void;
    clearUsers: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
  setUsers: (users) => set({ users }),

  setUser: (user) =>
    set((state) => ({
      users: [
        ...state.users,
        {
          ...user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserType,
      ],
    })),

  getUser: (id) => {
    return get().users.find((u) => u.id === id) || null;
  },

  getUsers: () => {
    return get().users;
  },



  updateUser: (user) =>
    set((state) => ({
        users: state.users.map((u) =>
        u.id === user.id
            ? {
                ...u,
                role: user.role ?? u.role,
                status: user.status ?? u.status,
                updated_at: new Date().toISOString(),
            }
            : u
        ),
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),

  clearUsers: () => set({ users: [] }),
}));