"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MessageSquare,
  Flag,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export interface QuestionReport {
  id: string;
  questionId: string;
  questionNumber?: string;
  prompt: string;
  category: string;
  speciality: string;
  userId: string;
  userEmail: string;
  userName: string;
  notes: string;
  reportedAt: string;
  status: "pending" | "reviewed" | "resolved";
}

export interface FlaggedItem {
  id: string;
  questionNumber?: string;
  prompt: string;
  category: string;
  speciality: string;
  flaggedDate: string;
  userId?: string;
  vignette?: string;
  question?: string;
  options?: any[];
  explanation?: string;
  notes?: string;
}

const DEFAULT_SAMPLE_FLAGS: FlaggedItem[] = [
  {
    id: "fq-24",
    questionNumber: "Q24",
    prompt: "A 45-year-old male presents with acute chest pain and shortness of breath. ECG shows ST elevation in leads V1-V4...",
    category: "Cardiovascular",
    speciality: "Cardiology",
    flaggedDate: "2 days ago",
  },
  {
    id: "fq-16",
    questionNumber: "Q16",
    prompt: "Which of the following is the most appropriate initial diagnostic test for a suspected pulmonary embolism in a pregnant patient?",
    category: "Pulmonology",
    speciality: "Respiratory",
    flaggedDate: "3 days ago",
  },
  {
    id: "fq-56",
    questionNumber: "Q56",
    prompt: "Which imaging modality is preferred for diagnosing gallstones in symptomatic patients?",
    category: "Gastroenterology",
    speciality: "Gastroenterology / Nutrition",
    flaggedDate: "4 days ago",
  },
];

const DEFAULT_SAMPLE_REPORTS: QuestionReport[] = [
  {
    id: "rep-1",
    questionId: "fq-25",
    questionNumber: "Q25",
    prompt: "A 65-year-old woman with type-2 diabetes was seen in the clinic for management of her cardiovascular risk...",
    category: "Pulmonology",
    speciality: "Cardiovascular & Pulmonology",
    userId: "2e0dc655-736a-4965-912c-df96772cf016",
    userEmail: "shakibwork333@gmail.com",
    userName: "Dr. Shakib",
    notes: "Option B mentions PCI within 90 minutes, but guideline NICE CG95 recommends GRACE risk stratification first for non-STEMI/high-risk NSTE-ACS.",
    reportedAt: "Today at 08:30",
    status: "pending",
  },
  {
    id: "rep-2",
    questionId: "fq-16",
    questionNumber: "Q16",
    prompt: "Which of the following is the most appropriate initial diagnostic test for a suspected pulmonary embolism in a pregnant patient?",
    category: "Pulmonology",
    speciality: "Respiratory",
    userId: "15584bfb-fc07-4c83-9699-213cf6b76c24",
    userEmail: "candidate@example.com",
    userName: "Alex Morgan",
    notes: "Please clarify in explanation that CXR is initial to exclude pneumothorax before choosing V/Q or CTPA.",
    reportedAt: "Yesterday at 14:15",
    status: "reviewed",
  },
];

function getCategoryBadgeClasses(category: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("cardio")) {
    return "bg-[#E8F8F3] text-[#129A71] border-[#B9EEDB]";
  }
  if (cat.includes("pulmon") || cat.includes("resp")) {
    return "bg-[#FFF3E8] text-[#E07912] border-[#FCD4AF]";
  }
  if (cat.includes("gastro")) {
    return "bg-[#FDECEC] text-[#E14343] border-[#F8BDBD]";
  }
  if (cat.includes("psych")) {
    return "bg-[#EBF5FC] text-[#2980B9] border-[#BDDEF6]";
  }
  if (cat.includes("immun") || cat.includes("derm") || cat.includes("allergy")) {
    return "bg-[#FFF2E2] text-[#E08A1E] border-[#FBD6A8]";
  }
  if (cat.includes("coping") || cat.includes("pressure") || cat.includes("dilemma")) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function normalizeReport(r: any, idx: number): QuestionReport {
  return {
    id: String(r.id || `rep-${idx}`),
    questionId: String(r.questionId || ""),
    questionNumber: r.questionNumber || `Q${idx + 1}`,
    prompt: r.prompt || r.vignette || r.question || "No question prompt available",
    category: r.category || "General",
    speciality: r.speciality || "General Medicine",
    userId: String(r.userId || ""),
    userEmail: r.userEmail || "candidate@example.com",
    userName: r.userName || "Candidate",
    notes: r.notes || "",
    reportedAt: r.reportedAt || "Recently",
    status: (r.status === "reviewed" || r.status === "resolved") ? r.status : "pending",
  };
}

function normalizeFlag(f: any, idx: number): FlaggedItem {
  return {
    id: String(f.id || `flag-${idx}`),
    questionNumber: f.questionNumber || `Q${idx + 1}`,
    prompt: f.prompt || f.vignette || f.question || "No prompt available",
    category: f.category || "General",
    speciality: f.speciality || "General Medicine",
    flaggedDate: f.flaggedDate || "Recent",
    userId: f.userId || "",
    vignette: f.vignette,
    question: f.question,
    options: f.options,
    explanation: f.explanation,
    notes: f.notes,
  };
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"reports" | "flags">("reports");
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [flags, setFlags] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "resolved">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch both dedicated endpoints in parallel with fast 1ms queries
      const [repRes, flagRes] = await Promise.allSettled([
        api.get("/overview/reports"),
        api.get("/overview/flags"),
      ]);

      let loadedReports: QuestionReport[] = [];
      let loadedFlags: FlaggedItem[] = [];

      if (repRes.status === "fulfilled" && repRes.value.data?.data) {
        const raw = repRes.value.data.data;
        if (Array.isArray(raw)) {
          loadedReports = raw.map((r, idx) => normalizeReport(r, idx));
        }
      }

      if (flagRes.status === "fulfilled" && flagRes.value.data?.data) {
        const raw = flagRes.value.data.data;
        if (Array.isArray(raw)) {
          loadedFlags = raw.map((f, idx) => normalizeFlag(f, idx));
        }
      }

      // If backend was unreachable or returned empty, check local storage or sample fallbacks
      if (loadedReports.length === 0 && repRes.status === "rejected") {
        try {
          const rawRep = localStorage.getItem("medicalexampro_admin_reports");
          if (rawRep) {
            const parsed = JSON.parse(rawRep);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedReports = parsed.map((r, idx) => normalizeReport(r, idx));
            }
          }
        } catch {}
        if (loadedReports.length === 0) {
          loadedReports = DEFAULT_SAMPLE_REPORTS;
        }
      }

      if (loadedFlags.length === 0 && flagRes.status === "rejected") {
        loadedFlags = DEFAULT_SAMPLE_FLAGS;
      }

      setReports(loadedReports);
      setFlags(loadedFlags);
    } catch (e) {
      console.warn("Could not fetch reports & flags:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: "pending" | "reviewed" | "resolved") => {
    const previous = [...reports];
    const updated = reports.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    setReports(updated);
    showToast(`Report marked as ${newStatus}`);

    try {
      await api.patch(`/overview/reports/${encodeURIComponent(id)}/status`, { status: newStatus });
      localStorage.setItem("medicalexampro_admin_reports", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to update status on server:", err);
      setReports(previous);
      showToast("Error updating status on server");
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this report?")) {
      return;
    }
    const previous = [...reports];
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    showToast("Report deleted");

    try {
      await api.delete(`/overview/reports/${encodeURIComponent(id)}`);
      localStorage.setItem("medicalexampro_admin_reports", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to delete report on server:", err);
      setReports(previous);
      showToast("Error deleting report on server");
    }
  };

  const handleDeleteFlag = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to remove this bookmark?")) {
      return;
    }
    const previous = [...flags];
    const updated = flags.filter((f) => f.id !== id);
    setFlags(updated);
    showToast("Bookmark removed");

    try {
      await api.delete(`/overview/flags/${encodeURIComponent(id)}`);
    } catch (err) {
      console.error("Failed to remove flag on server:", err);
      setFlags(previous);
      showToast("Error removing flag on server");
    }
  };

  const filteredReports = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return reports.filter((r) => {
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      if (!q) return matchesStatus;

      const notes = (r.notes || "").toLowerCase();
      const prompt = (r.prompt || "").toLowerCase();
      const cat = (r.category || "").toLowerCase();
      const email = (r.userEmail || "").toLowerCase();
      const name = (r.userName || "").toLowerCase();
      const qNum = (r.questionNumber || "").toLowerCase();
      const spec = (r.speciality || "").toLowerCase();

      const matchesSearch =
        notes.includes(q) ||
        prompt.includes(q) ||
        cat.includes(q) ||
        email.includes(q) ||
        name.includes(q) ||
        qNum.includes(q) ||
        spec.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [reports, statusFilter, search]);

  const filteredFlags = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return flags.filter((f) => {
      if (!q) return true;
      const prompt = (f.prompt || "").toLowerCase();
      const cat = (f.category || "").toLowerCase();
      const qNum = (f.questionNumber || "").toLowerCase();
      const spec = (f.speciality || "").toLowerCase();

      return (
        prompt.includes(q) ||
        cat.includes(q) ||
        qNum.includes(q) ||
        spec.includes(q)
      );
    });
  }, [flags, search]);

  const pendingCount = useMemo(() => reports.filter((r) => r.status === "pending").length, [reports]);
  const resolvedCount = useMemo(() => reports.filter((r) => r.status === "resolved").length, [reports]);

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header (Clean White/Slate Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reports & Flagged Content
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold">
              Quality Audit
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Review accuracy feedback submitted by candidates and monitor flagged questions platform-wide.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. KPI Summary Cards (Clean White Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Reports
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{reports.length}</p>
          <span className="text-[11px] text-slate-400">Candidate feedback</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Action
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <span className="text-[11px] text-slate-400">Requires clinical audit</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
          <span className="text-[11px] text-slate-400">Audited & updated</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Flags
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600">{flags.length}</p>
          <span className="text-[11px] text-slate-400">Candidate bookmarks</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "reports"
              ? "bg-[#082138] text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Candidate Reports & Feedback ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flags")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "flags"
              ? "bg-[#082138] text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Platform Flagged Questions ({flags.length})</span>
        </button>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-2xs">
        <div className="relative flex-1 flex items-center px-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "reports"
                ? "Search candidate notes, question prompt, email, doctor name..."
                : "Search flagged questions, category, speciality..."
            }
            className="w-full bg-transparent border-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none py-1 pl-2.5 pr-2"
          />
        </div>

        {activeTab === "reports" && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(["all", "pending", "reviewed", "resolved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#1D82EB] text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Content Views */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center space-y-3 border border-slate-200/90 shadow-2xs">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading data...</p>
        </div>
      ) : activeTab === "reports" ? (
        filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200/90 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Reports Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Candidate feedback submitted via &quot;Add a note&quot; or &quot;Report Issue&quot; will be listed here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const statusColors = {
                pending: "bg-amber-50 text-amber-700 border-amber-200",
                reviewed: "bg-sky-50 text-sky-700 border-sky-200",
                resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
              };

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Bar: Question badge, Category, Reporter, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#082138] text-white text-xs font-bold">
                        {report.questionNumber || "Question"}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClasses(
                          report.category
                        )}`}
                      >
                        {report.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reported by <strong className="text-slate-700">{report.userName}</strong> ({report.userEmail}) &bull; {report.reportedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                          statusColors[report.status] || "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {report.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteReport(report.id)}
                        title="Delete Report"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {report.prompt}
                  </p>

                  {/* Candidate Note / Feedback Box */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-1">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      Candidate Feedback / Issue Report:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                      &quot;{report.notes}&quot;
                    </p>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400 font-medium">Update Status:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(report.id, "pending")}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          report.status === "pending"
                            ? "bg-amber-600 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(report.id, "reviewed")}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          report.status === "reviewed"
                            ? "bg-sky-600 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        Mark Reviewed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(report.id, "resolved")}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          report.status === "resolved"
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Tab 2: Flagged Questions (Platform-Wide) */
        filteredFlags.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200/90 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Flag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Flagged Questions Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Questions bookmarked by candidates will be listed here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlags.map((item, idx) => {
              const questionNumber = item.questionNumber || `Q${idx + 1}`;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center font-bold text-slate-800 text-sm shrink-0 shadow-2xs">
                      {questionNumber}
                    </div>

                    <div className="space-y-2 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed max-w-3xl">
                        {item.prompt}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClasses(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.speciality} &bull; Flagged: {item.flaggedDate || "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Bookmarked</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFlag(item.id)}
                      title="Remove Bookmark"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
