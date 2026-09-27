"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Copy,
  Check,
  Trash2,
  Edit3,
  Eye,
  Zap,
  Sparkles,
  Percent,
  PoundSterling,
  AlertCircle,
  Loader2,
  Globe,
  UserCheck,
  X,
  Calendar,
  Layers,
} from "lucide-react";
import {
  adminCouponApi,
  AdminCoupon,
  CreateCouponPayload,
} from "@/services/adminCouponApi";
import { adminUserApi, AdminUserData } from "@/services/adminUserApi";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED">("ALL");
  const [audienceFilter, setAudienceFilter] = useState<"ALL" | "EVERYONE" | "SPECIFIC">("ALL");

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [historyModalCoupon, setHistoryModalCoupon] = useState<AdminCoupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateCouponPayload>({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 20,
    maxUses: null,
    perUserLimit: 1,
    applicablePlans: [], // empty = all plans
    isForSpecificUsers: false,
    allowedUserEmails: [],
    allowedUserIds: [],
    expiresAt: null,
    isActive: true,
  });

  // Selected User search for specific user targeting
  const [userSearch, setUserSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [couponsRes, usersRes] = await Promise.all([
        adminCouponApi.getAllCoupons(),
        adminUserApi.getAllUsers().catch(() => ({ success: false, data: [] })),
      ]);

      if (couponsRes.success) {
        setCoupons(couponsRes.data || []);
      }
      if (usersRes.success) {
        setUsers(usersRes.data || []);
      }
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Failed to load coupons" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate random promo code
  const handleGenerateRandomCode = async () => {
    try {
      const res = await adminCouponApi.generateRandomCode("MSRA");
      if (res.data?.code) {
        setFormData((prev) => ({ ...prev, code: res.data.code }));
      }
    } catch (_) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let randomCode = "PROMO-";
      for (let i = 0; i < 6; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormData((prev) => ({ ...prev, code: randomCode }));
    }
  };

  // Toggle active status
  const handleToggleStatus = async (coupon: AdminCoupon) => {
    try {
      const newStatus = !coupon.isActive;
      await adminCouponApi.updateCoupon(coupon.id, { isActive: newStatus });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c))
      );
      setToastMessage({
        type: "success",
        text: `Coupon "${coupon.code}" is now ${newStatus ? "active" : "inactive"}.`,
      });
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Failed to toggle status" });
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await adminCouponApi.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setToastMessage({ type: "success", text: `Coupon "${code}" deleted successfully.` });
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Failed to delete coupon" });
    } finally {
      setDeletingId(null);
    }
  };

  // View redemptions history
  const handleViewHistory = async (coupon: AdminCoupon) => {
    try {
      const res = await adminCouponApi.getCouponById(coupon.id);
      if (res.success && res.data) {
        setHistoryModalCoupon(res.data);
      } else {
        setHistoryModalCoupon(coupon);
      }
    } catch (_) {
      setHistoryModalCoupon(coupon);
    }
  };

  // Submit Create Coupon Form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code?.trim()) {
      setToastMessage({ type: "error", text: "Please enter or generate a coupon code." });
      return;
    }
    if (formData.discountValue <= 0) {
      setToastMessage({ type: "error", text: "Discount value must be greater than 0." });
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminCouponApi.createCoupon(formData);
      if (res.success) {
        setToastMessage({ type: "success", text: `Coupon "${res.data.code}" created successfully!` });
        setCreateModalOpen(false);
        // Reset form
        setFormData({
          code: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: 20,
          maxUses: null,
          perUserLimit: 1,
          applicablePlans: [],
          isForSpecificUsers: false,
          allowedUserEmails: [],
          allowedUserIds: [],
          expiresAt: null,
          isActive: true,
        });
        loadData();
      }
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to create coupon" });
    } finally {
      setSubmitting(false);
    }
  };

  // Add user to allowed list
  const handleToggleUserTarget = (user: AdminUserData) => {
    const email = user.email.toLowerCase();
    const currentEmails = formData.allowedUserEmails || [];
    const currentIds = formData.allowedUserIds || [];

    if (currentEmails.includes(email)) {
      setFormData({
        ...formData,
        allowedUserEmails: currentEmails.filter((e) => e !== email),
        allowedUserIds: currentIds.filter((id) => id !== user.id),
      });
    } else {
      setFormData({
        ...formData,
        allowedUserEmails: [...currentEmails, email],
        allowedUserIds: [...currentIds, user.id],
      });
    }
  };

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);
    return { total, active, totalRedemptions };
  }, [coupons]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((c) => {
      // Search
      const matchesSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      const isExpired = c.expiresAt ? new Date(c.expiresAt) < now : false;
      let matchesStatus = true;
      if (statusFilter === "ACTIVE") matchesStatus = c.isActive && !isExpired;
      if (statusFilter === "INACTIVE") matchesStatus = !c.isActive;
      if (statusFilter === "EXPIRED") matchesStatus = isExpired;

      // Audience
      let matchesAudience = true;
      if (audienceFilter === "EVERYONE") matchesAudience = !c.isForSpecificUsers;
      if (audienceFilter === "SPECIFIC") matchesAudience = c.isForSpecificUsers;

      return matchesSearch && matchesStatus && matchesAudience;
    });
  }, [coupons, searchQuery, statusFilter, audienceFilter]);

  // Filtered user list for modal
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users.slice(0, 15);
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  return (
    <div className="space-y-6 w-full pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 border ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Promotion Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Coupon &amp; Promo Codes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate promotional codes for all candidates, or restrict special discounts to specific user accounts.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Coupons
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Promos
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.active}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Redemptions
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">{metrics.totalRedemptions}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by coupon code or description..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "ACTIVE" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "INACTIVE" ? "bg-white text-slate-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setStatusFilter("EXPIRED")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "EXPIRED" ? "bg-white text-rose-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Expired
            </button>
          </div>

          {/* Audience Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setAudienceFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                audienceFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Targets
            </button>
            <button
              onClick={() => setAudienceFilter("EVERYONE")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                audienceFilter === "EVERYONE" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Everyone
            </button>
            <button
              onClick={() => setAudienceFilter("SPECIFIC")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                audienceFilter === "SPECIFIC" ? "bg-white text-purple-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Specific Users
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-xs font-semibold">Loading coupons...</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <Ticket className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No coupons found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery || statusFilter !== "ALL" || audienceFilter !== "ALL"
                ? "No promo codes match your active filters. Try resetting the search or filter criteria."
                : "No promo codes have been created yet. Click 'Create New Coupon' to add your first promotion."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Usage Limit</th>
                  <th className="py-3.5 px-4">Expires</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCoupons.map((c) => {
                  const now = new Date();
                  const isExpired = c.expiresAt ? new Date(c.expiresAt) < now : false;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Code */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            title="Copy code"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                            {c.description}
                          </p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                            c.discountType === "PERCENTAGE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {c.discountType === "PERCENTAGE" ? (
                            <>
                              <Percent className="w-3 h-3" />
                              <span>{c.discountValue}% OFF</span>
                            </>
                          ) : (
                            <>
                              <span>£{c.discountValue}.00 OFF</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Audience */}
                      <td className="py-4 px-4">
                        {c.isForSpecificUsers ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 w-fit">
                              <UserCheck className="w-3 h-3" />
                              <span>
                                Specific (
                                {Array.isArray(c.allowedUserEmails) ? c.allowedUserEmails.length : 0} users)
                              </span>
                            </span>
                            {Array.isArray(c.allowedUserEmails) && c.allowedUserEmails.length > 0 && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                {c.allowedUserEmails.join(", ")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                            <Globe className="w-3 h-3" />
                            <span>Everyone</span>
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold">{c.usedCount}</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-500">
                            {c.maxUses !== null ? `${c.maxUses} total` : "Unlimited"}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="inline-block text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            Max {c.perUserLimit || 1}x per candidate
                          </span>
                        </div>
                        {c.usedCount > 0 && (
                          <button
                            onClick={() => handleViewHistory(c)}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer mt-1 block"
                          >
                            View {c.usedCount} redemption{c.usedCount > 1 ? "s" : ""}
                          </button>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-4 text-slate-600">
                        {c.expiresAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(c.expiresAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Never</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            <Clock className="w-3 h-3" />
                            <span>Expired</span>
                          </span>
                        ) : c.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(c)}
                            title={c.isActive ? "Deactivate" : "Activate"}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              c.isActive
                                ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {c.isActive ? (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>

                          <button
                            onClick={() => handleViewHistory(c)}
                            title="View Redemptions"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            disabled={deletingId === c.id}
                            title="Delete Coupon"
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW COUPON MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh] relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  New Promotion
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Generate Coupon Code
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Code Input with Random Generator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "") })
                    }
                    placeholder="e.g. WELCOME20, MSRA50"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 fill-orange-500" />
                    <span>Random Code</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Purpose (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 20% discount for candidate webinar attendees"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-hidden"
                />
              </div>

              {/* Discount Type & Value Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "PERCENTAGE" })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        formData.discountType === "PERCENTAGE"
                          ? "bg-white text-orange-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percentage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "FIXED" })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        formData.discountType === "FIXED"
                          ? "bg-white text-orange-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <PoundSterling className="w-3.5 h-3.5" />
                      <span>Fixed GBP (£)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Value {formData.discountType === "PERCENTAGE" ? "(%)" : "(£ GBP)"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === "PERCENTAGE" ? 100 : 1000}
                    value={formData.discountValue || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    placeholder={formData.discountType === "PERCENTAGE" ? "20" : "15"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* TARGET AUDIENCE (Everyone vs Specific Users) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setFormData({ ...formData, isForSpecificUsers: false })}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      !formData.isForSpecificUsers
                        ? "border-orange-500 bg-orange-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className={`w-4 h-4 ${!formData.isForSpecificUsers ? "text-orange-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold text-slate-900">Available to Everyone</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Any candidate can enter this promo code during checkout.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, isForSpecificUsers: true })}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.isForSpecificUsers
                        ? "border-orange-500 bg-orange-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className={`w-4 h-4 ${formData.isForSpecificUsers ? "text-orange-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold text-slate-900">Specific Users Only</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Only designated candidate emails can redeem this code.
                    </p>
                  </div>
                </div>

                {/* Specific User Selector if enabled */}
                {formData.isForSpecificUsers && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        Selected Candidates ({formData.allowedUserEmails?.length || 0})
                      </span>
                      {formData.allowedUserEmails && formData.allowedUserEmails.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, allowedUserEmails: [], allowedUserIds: [] })}
                          className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Chips of selected emails */}
                    {formData.allowedUserEmails && formData.allowedUserEmails.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                        {formData.allowedUserEmails.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800"
                          >
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  allowedUserEmails: formData.allowedUserEmails?.filter((e) => e !== email),
                                })
                              }
                              className="text-orange-600 hover:text-orange-950 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* User Search & Checklist */}
                    <div>
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search candidate name or email to add..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
                      {filteredUsers.length === 0 ? (
                        <div className="p-3 text-[11px] text-slate-400 text-center">
                          No users found
                        </div>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelected = formData.allowedUserEmails?.includes(u.email.toLowerCase());
                          return (
                            <div
                              key={u.id}
                              onClick={() => handleToggleUserTarget(u)}
                              className="p-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
                            >
                              <div>
                                <span className="font-semibold text-slate-800 block">
                                  {u.firstName} {u.lastName}
                                </span>
                                <span className="text-[11px] text-slate-400">{u.email}</span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                  isSelected ? "bg-orange-600 border-orange-600 text-white" : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Limits & Expiration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Redemption Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Unlimited"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Platform-wide total uses</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Limit Per Candidate
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.perUserLimit ?? 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        perUserLimit: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    placeholder="1"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Times 1 user can use (default: 1)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt ? String(formData.expiresAt).slice(0, 10) : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value || null })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Optional expiration date</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Create Coupon</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REDEMPTION HISTORY MODAL */}
      {historyModalCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setHistoryModalCoupon(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight font-mono">
                    {historyModalCoupon.code}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {historyModalCoupon.discountValue}
                    {historyModalCoupon.discountType === "PERCENTAGE" ? "% OFF" : " GBP OFF"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Redemption History ({historyModalCoupon.redemptions?.length || historyModalCoupon.usedCount || 0} Total)
                </p>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
              {!historyModalCoupon.redemptions || historyModalCoupon.redemptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No candidate has redeemed this coupon code yet.
                </div>
              ) : (
                historyModalCoupon.redemptions.map((r) => {
                  const userTotalUses =
                    historyModalCoupon.redemptions?.filter((item) => item.userId === r.userId).length || 1;

                  return (
                    <div key={r.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {r.user?.displayName || `${r.user?.firstName || "Candidate"} ${r.user?.lastName || ""}`}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                            Used {userTotalUses}x
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{r.user?.email || "Email protected"}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Plan: <span className="font-mono font-semibold uppercase">{r.planId}</span> • {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-emerald-600">
                          -£{r.discountAmount.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Paid: <strong className="text-slate-800">£{r.finalPrice.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 flex justify-end">
              <button
                onClick={() => setHistoryModalCoupon(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
