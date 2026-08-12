import { api } from "@/lib/api";

export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

export interface AdminUserData {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  status: "active" | "pending_verification" | "suspended" | "inactive";
  targetExam?: string;
  bio?: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminUserApi = {
  getAllUsers: async () => {
    const res = await api.get<ApiResponse<AdminUserData[]>>("/auth/users");
    return res.data;
  },

  updateUserStatus: async (userId: string, status: "active" | "pending_verification" | "suspended" | "inactive") => {
    const res = await api.put<ApiResponse<AdminUserData>>(`/auth/users/${userId}/status`, { status });
    return res.data;
  },

  deleteUser: async (userId: string) => {
    const res = await api.delete<ApiResponse<any>>(`/auth/users/${userId}`);
    return res.data;
  },

  createUser: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleName?: string;
    targetExam?: string;
  }) => {
    const res = await api.post<ApiResponse<AdminUserData>>("/auth/users", payload);
    return res.data;
  },
};
