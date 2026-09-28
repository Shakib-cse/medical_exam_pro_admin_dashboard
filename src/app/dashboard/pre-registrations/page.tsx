"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Users,
  Clock,
  Mail,
  Award,
  Star,
  CheckCircle2,
  ListOrdered,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

interface PreRegRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isVerified: boolean;
  verifiedAt: string | null;
  queueNumber: number | null;
  isEligibleForDiscount: boolean;
  discountPercentage: number;
  discountCode: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    status: string;
    createdAt: string;
  } | null;
}

interface StatsData {
  total: number;
  totalVerified: number;
  totalDiscountEligible: number;
  spotsRemaining: number;
}

export default function PreRegistrationsPage() {
  const [records, setRecords] = useState<PreRegRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    totalVerified: 0,
    totalDiscountEligible: 0,
    spotsRemaining: 100,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "first100" | "waitlist" | "verified" | "pending">("first100");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedFirst100, setCopiedFirst100] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Delete modal state
  const [deleteCandidate, setDeleteCandidate] = useState<PreRegRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchPreRegistrations();
  }, []);

  const fetchPreRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/preregistration/list");
      if (res.data?.success && res.data?.data) {
        setRecords(res.data.data.records || []);
        setStats({
          total: res.data.data.total || 0,
          totalVerified: res.data.data.totalVerified || 0,
          totalDiscountEligible: res.data.data.totalDiscountEligible || 0,
          spotsRemaining: res.data.data.spotsRemaining ?? 100,
        });
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to load pre-registrations");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === "first100") return rec.isEligibleForDiscount && rec.isVerified;
      if (filterType === "waitlist") return rec.isVerified && !rec.isEligibleForDiscount;
      if (filterType === "verified") return rec.isVerified;
      if (filterType === "pending") return !rec.isVerified;
      return true;
    });
  }, [records, searchTerm, filterType]);

  // Copy First 100 Verified Emails
  const handleCopyFirst100Emails = () => {
    const first100Emails = records
      .filter((r) => r.isVerified && r.isEligibleForDiscount)
      .sort((a, b) => (a.queueNumber || 999) - (b.queueNumber || 999))
      .map((r) => r.email)
      .join(", ");

    if (first100Emails) {
      navigator.clipboard.writeText(first100Emails);
      setCopiedFirst100(true);
      showToast("success", `Copied ${stats.totalDiscountEligible} First 100 emails to clipboard!`);
      setTimeout(() => setCopiedFirst100(false), 2500);
    }
  };

  // Copy all verified emails to clipboard
  const handleCopyAllVerifiedEmails = () => {
    const verifiedEmails = records
      .filter((r) => r.isVerified)
      .map((r) => r.email)
      .join(", ");

    if (verifiedEmails) {
      navigator.clipboard.writeText(verifiedEmails);
      setCopiedAll(true);
      showToast("success", `Copied ${stats.totalVerified} verified emails to clipboard!`);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  // Copy single email
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Delete Candidate Handler: shifts subsequent candidates up
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/preregistration/${deleteCandidate.id}`);
      if (res.data?.success) {
        showToast(
          "success",
          `Candidate ${deleteCandidate.email} deleted. Subsequent queue positions moved up!`
        );
        setDeleteCandidate(null);
        await fetchPreRegistrations();
      } else {
        throw new Error(res.data?.message || "Failed to delete candidate");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete candidate");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export First 100 to CSV
  const handleExportFirst100CSV = () => {
    const first100 = records
      .filter((r) => r.isVerified && r.isEligibleForDiscount)
      .sort((a, b) => (a.queueNumber || 999) - (b.queueNumber || 999));

    if (first100.length === 0) return;

    const headers = [
      "Position",
      "Candidate Name",
      "Email Address",
      "Eligibility Status",
      "Verified Exact Timestamp",
      "Registered Date",
    ];

    const rows = first100.map((r) => [
      `"#${r.queueNumber}"`,
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.email,
      "FIRST 100 - 50% LAUNCH DISCOUNT",
      r.verifiedAt ? `"${new Date(r.verifiedAt).toISOString()}"` : "",
      `"${new Date(r.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `first-100-eligible-50-percent-discount-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export All to CSV
  const handleExportAllCSV = () => {
    if (records.length === 0) return;

    const headers = [
      "Queue Position",
      "Full Name",
      "Email",
      "First 100 Status",
      "Verification Status",
      "Verified Timestamp",
      "Registered Date",
    ];

    const rows = records.map((r) => [
      r.queueNumber ? `#${r.queueNumber}` : "Pending OTP",
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.email,
      r.isEligibleForDiscount ? "FIRST 100 (50% DISCOUNT)" : "WAITLIST (#101+)",
      r.isVerified ? "VERIFIED" : "PENDING OTP",
      r.verifiedAt ? new Date(r.verifiedAt).toLocaleString() : "",
      new Date(r.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `medicalexampro-all-preregistrations-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Pre-Registrations & Early Birds
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center gap-1">
              <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>First 100 Justification List</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chrono-sorted candidates for the 50% launch discount. Review and justify the first 100 users to manually deliver their launch promo codes.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchPreRegistrations}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Copy First 100 Emails */}
          <button
            onClick={handleCopyFirst100Emails}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {copiedFirst100 ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied {stats.totalDiscountEligible} Emails!</span>
              </>
            ) : (
              <>
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Copy First 100 Emails</span>
              </>
            )}
          </button>

          {/* Export First 100 CSV */}
          <button
            onClick={handleExportFirst100CSV}
            disabled={stats.totalDiscountEligible === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export First 100 CSV</span>
          </button>

          {/* Export All CSV */}
          <button
            onClick={handleExportAllCSV}
            disabled={records.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <span>Export All ({records.length})</span>
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pre-Registrations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Registered
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              {stats.totalVerified} verified emails
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* First 100 Eligible (50% Launch Discount) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>First 100 Justified</span>
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {stats.totalDiscountEligible} <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
            <div className="text-xs font-medium text-emerald-600/80 mt-0.5">
              Eligible for 50% discount
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining Discount Spots */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Spots Left in First 100
            </span>
            <div className="text-2xl font-black text-orange-600 mt-1">{stats.spotsRemaining}</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              {stats.spotsRemaining > 0 ? "50% offer still open" : "100 cap reached"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Waitlist Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Waitlist (#101+)
            </span>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {Math.max(0, stats.totalVerified - 100)}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Standard launch notification
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <ListOrdered className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
          <button
            onClick={() => setFilterType("first100")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === "first100"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            <span>First 100 ({stats.totalDiscountEligible})</span>
          </button>
          <button
            onClick={() => setFilterType("waitlist")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === "waitlist"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Waitlist #{Math.max(0, stats.totalVerified - 100)}
          </button>
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setFilterType("verified")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === "verified"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Verified ({stats.totalVerified})
          </button>
          <button
            onClick={() => setFilterType("pending")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === "pending"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending OTP ({records.filter((r) => !r.isVerified).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Queue #</th>
                <th className="px-5 py-4">Candidate Name</th>
                <th className="px-5 py-4">Email Address</th>
                <th className="px-5 py-4">50% Discount Status (First 100)</th>
                <th className="px-5 py-4">Verification</th>
                <th className="px-5 py-4">Verified Timestamp</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span className="font-medium text-slate-500">Loading pre-registrations...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700">No candidates found in this category</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Switch filters above to view other pre-registered users.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isFirst100 = r.isVerified && r.isEligibleForDiscount;
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isFirst100 ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      {/* Queue Number */}
                      <td className="px-5 py-4 font-semibold">
                        {r.queueNumber ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono text-xs px-2.5 py-1 rounded-lg font-black border ${
                                isFirst100
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              #{r.queueNumber}
                            </span>
                            {isFirst100 && (
                              <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pending OTP</span>
                        )}
                      </td>

                      {/* Full Name */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border shrink-0 ${
                              isFirst100
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            {r.firstName ? r.firstName[0] : "C"}
                          </div>
                          <span>{r.fullName}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{r.email}</span>
                        </div>
                      </td>

                      {/* 50% Discount Status */}
                      <td className="px-5 py-4">
                        {isFirst100 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 border border-emerald-200 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>FIRST 100 — 50% DISCOUNT</span>
                          </span>
                        ) : r.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600">
                            <span>Waitlist (After #100)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Awaiting Email OTP</span>
                          </span>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="px-5 py-4">
                        {r.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending OTP</span>
                          </span>
                        )}
                      </td>

                      {/* Verified Timestamp */}
                      <td className="px-5 py-4 text-slate-500 text-[11px] font-mono">
                        {r.verifiedAt ? (
                          new Date(r.verifiedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        ) : (
                          <span className="text-slate-400 italic">Not verified</span>
                        )}
                      </td>

                      {/* Action Buttons: Copy Email & Delete */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy email button */}
                          <button
                            onClick={() => handleCopyEmail(r.email)}
                            title="Copy Email"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer inline-flex items-center"
                          >
                            {copiedEmail === r.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeleteCandidate(r)}
                            title="Delete candidate (Next user moves up)"
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Delete Pre-Registration?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-800">{deleteCandidate.email}</strong>?
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Queue Position Auto-Shift</span>
              </div>
              <p>
                Candidate was at Position <strong className="font-mono">#{deleteCandidate.queueNumber ?? "N/A"}</strong>.
                Deleting this candidate will automatically shift all subsequent candidates up by 1 position (e.g., candidate #{Number(deleteCandidate.queueNumber) + 1} will become #{deleteCandidate.queueNumber}).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting & Re-indexing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete & Shift Up</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
