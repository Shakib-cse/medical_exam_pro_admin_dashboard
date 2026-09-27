import { api } from "@/lib/api";

export interface AdminCoupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchaseAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  perUserLimit: number;
  applicablePlans?: string[] | null;
  isForSpecificUsers: boolean;
  allowedUserEmails?: string[] | null;
  allowedUserIds?: string[] | null;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  redemptionsCount?: number;
  redemptions?: {
    id: string;
    userId: string;
    planId: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    stripeSessionId?: string | null;
    createdAt: string;
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
    };
  }[];
}

export interface CreateCouponPayload {
  code?: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchaseAmount?: number;
  maxUses?: number | null;
  perUserLimit?: number;
  applicablePlans?: string[] | null;
  isForSpecificUsers?: boolean;
  allowedUserEmails?: string[] | null;
  allowedUserIds?: string[] | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminCouponApi = {
  getAllCoupons: async () => {
    const res = await api.get<ApiResponse<AdminCoupon[]>>("/coupons");
    return res.data;
  },

  getCouponById: async (id: string) => {
    const res = await api.get<ApiResponse<AdminCoupon>>(`/coupons/${id}`);
    return res.data;
  },

  createCoupon: async (payload: CreateCouponPayload) => {
    const res = await api.post<ApiResponse<AdminCoupon>>("/coupons", payload);
    return res.data;
  },

  updateCoupon: async (id: string, payload: Partial<CreateCouponPayload>) => {
    const res = await api.put<ApiResponse<AdminCoupon>>(`/coupons/${id}`, payload);
    return res.data;
  },

  deleteCoupon: async (id: string) => {
    const res = await api.delete<ApiResponse<any>>(`/coupons/${id}`);
    return res.data;
  },

  generateRandomCode: async (prefix = "PROMO") => {
    const res = await api.get<ApiResponse<{ code: string }>>(`/coupons/generate-code?prefix=${prefix}`);
    return res.data;
  },
};
