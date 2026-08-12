import { api } from "@/lib/api";

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  targetExam?: string;
  bio?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminSettingsApi = {
  getProfile: async () => {
    const res = await api.get<ApiResponse<any>>("/auth/me");
    return res.data;
  },

  updateProfile: async (payload: UpdateProfileInput) => {
    const res = await api.put<ApiResponse<any>>("/auth/profile", payload);
    return res.data;
  },

  changePassword: async (payload: ChangePasswordInput) => {
    const res = await api.put<ApiResponse<any>>("/auth/change-password", payload);
    return res.data;
  },
};
