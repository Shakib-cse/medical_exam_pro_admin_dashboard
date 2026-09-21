"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Stethoscope,
  Scale,
  FileCheck2,
  Users,
  LifeBuoy,
  Flag,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ListOrdered,
  CheckSquare,
  Sparkles,
  BarChart3,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  adminQuestionBankApi,
  AdminQuestionBankData,
} from "@/services/adminQuestionBankApi";
import { adminMockExamApi } from "@/services/adminMockExamApi";
import { adminUserApi } from "@/services/adminUserApi";
import { api } from "@/lib/api";

export default function OverviewControlPage() {
  const [banks, setBanks] = useState<AdminQuestionBankData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mockExamsCount, setMockExamsCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [reportsCount, setReportsCount] = useState<{ total: number; pending: number; flags: number }>({
    total: 0,
    pending: 0,
    flags: 0,
  });
  const [supportStats, setSupportStats] = useState<{ total: number; open: number }>({
    total: 0,
    open: 0,
  });
  const [specialtySearch, setSpecialtySearch] = useState("");

  const fetchOverviewData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [banksRes, mockRes, usersRes, reportsRes, flagsRes, supportRes] = await Promise.allSettled([
        adminQuestionBankApi.getQuestionBanks(),
        adminMockExamApi.getMockExams(),
        adminUserApi.getAllUsers(),
        api.get("/overview/reports"),
        api.get("/overview/flags"),
        api.get("/overview/support"),
      ]);

      // 1. Process Question Banks
      if (banksRes.status === "fulfilled" && banksRes.value?.data) {
        setBanks(banksRes.value.data);
      }

      // 2. Process Mock Exams
      if (mockRes.status === "fulfilled" && mockRes.value?.data) {
        setMockExamsCount(mockRes.value.data.length);
      }

      // 3. Process Users
      if (usersRes.status === "fulfilled" && usersRes.value?.data) {
        setUsersCount(usersRes.value.data.length);
      }

      // 4. Process Reports & Flags
      let repTotal = 0;
      let repPending = 0;
      let flagsTotal = 0;

      if (reportsRes.status === "fulfilled" && reportsRes.value?.data?.data) {
        const reps = reportsRes.value.data.data;
        if (Array.isArray(reps)) {
          repTotal = reps.length;
          repPending = reps.filter((r: any) => r.status === "open" || r.status === "pending" || !r.status).length;
        }
      }

      if (flagsRes.status === "fulfilled" && flagsRes.value?.data?.data) {
        const fls = flagsRes.value.data.data;
        if (Array.isArray(fls)) {
          flagsTotal = fls.length;
        }
      }

      setReportsCount({ total: repTotal, pending: repPending, flags: flagsTotal });

      // 5. Process Support Tickets
      if (supportRes.status === "fulfilled" && supportRes.value?.data?.data) {
        const sups = supportRes.value.data.data;
        if (Array.isArray(sups)) {
          setSupportStats({
            total: sups.length,
            open: sups.filter((s: any) => s.status === "open" || !s.status).length,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Split into CPS and PD
  const cpsBanks = useMemo(
    () => banks.filter((b) => b.type === "Clinical" || b.type?.toLowerCase() === "clinical"),
    [banks]
  );

  const pdBanks = useMemo(
    () =>
      banks.filter(
        (b) =>
          b.type === "SJT" ||
          b.type?.toLowerCase() === "sjt" ||
          b.category?.toLowerCase().includes("professional") ||
          b.specialty?.toLowerCase().includes("professional")
      ),
    [banks]
  );

  // Overall totals
  const totalCPSQuestions = useMemo(
    () => cpsBanks.reduce((acc, curr) => acc + (curr.questionCount || 0), 0),
    [cpsBanks]
  );
  const totalSBA = useMemo(
    () => cpsBanks.reduce((acc, curr) => acc + (curr.sbaCount || 0), 0),
    [cpsBanks]
  );
  const totalEMQCases = useMemo(
    () => cpsBanks.reduce((acc, curr) => acc + (curr.emqCount || 0), 0),
    [cpsBanks]
  );
  const totalEMQThemes = useMemo(
    () => cpsBanks.reduce((acc, curr) => acc + (curr.emqThemesCount || 0), 0),
    [cpsBanks]
  );

  const totalPDQuestions = useMemo(
    () => pdBanks.reduce((acc, curr) => acc + (curr.questionCount || 0), 0),
    [pdBanks]
  );
  const totalRanking = useMemo(
    () => pdBanks.reduce((acc, curr) => acc + (curr.rankingCount || 0), 0),
    [pdBanks]
  );
  const totalSelect3 = useMemo(
    () => pdBanks.reduce((acc, curr) => acc + (curr.select3Count || 0), 0),
    [pdBanks]
  );

  const grandTotalQuestions = totalCPSQuestions + totalPDQuestions;

  // Percentage calculations
  const cpsPercentage = grandTotalQuestions > 0 ? Math.round((totalCPSQuestions / grandTotalQuestions) * 100) : 0;
  const pdPercentage = grandTotalQuestions > 0 ? 100 - cpsPercentage : 0;

  // Filtered CPS specialties
  const filteredCPS = useMemo(() => {
    const q = specialtySearch.trim().toLowerCase();
    if (!q) return cpsBanks;
    return cpsBanks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.specialty && b.specialty.toLowerCase().includes(q))
    );
  }, [cpsBanks, specialtySearch]);

  return (
    <div className="space-y-7 pb-10">
      {/* Hero / Header Banner */}
      <div className="bg-gradient-to-r from-[#072438] via-[#0d2a45] to-[#12385c] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-cyan-950/80 rounded-lg border border-cyan-800 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Platform Executive Overview
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real-time dashboard summarizing the complete MSRA question bank (CPS &amp; PD), specialty breakdowns, candidate inquiries, and system operations.
          </p>
        </div>

        <button
          onClick={() => fetchOverviewData(true)}
          disabled={refreshing}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
        </button>
      </div>

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Grand Total Questions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Question Bank
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400 my-1" />
              ) : (
                grandTotalQuestions.toLocaleString()
              )}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              Active validated MSRA items
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
            <span className="text-cyan-700">{totalCPSQuestions.toLocaleString()} CPS</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700">{totalPDQuestions.toLocaleString()} PD</span>
          </div>
        </div>

        {/* Card 2: Clinical Problem Solving */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clinical Problem Solving
            </span>
            <span className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600">
              <Stethoscope className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-cyan-700 tracking-tight">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400 my-1" />
              ) : (
                totalCPSQuestions.toLocaleString()
              )}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              {cpsBanks.length} Medical Specialties
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600">
              {totalSBA.toLocaleString()} SBA • {totalEMQCases.toLocaleString()} EMQ
            </span>
            <Link
              href="/dashboard/clinical-problem-solving"
              className="text-cyan-600 font-bold hover:text-cyan-700 flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Professional Dilemmas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Professional Dilemmas
            </span>
            <span className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600 tracking-tight">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-amber-400 my-1" />
              ) : (
                totalPDQuestions.toLocaleString()
              )}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              {pdBanks.length} Core GMC Domains
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600">
              {totalRanking.toLocaleString()} Rank • {totalSelect3.toLocaleString()} Sel-3
            </span>
            <Link
              href="/dashboard/professional-dilemmas"
              className="text-amber-600 font-bold hover:text-amber-700 flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Operations & Mock Exams */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assessments &amp; Users
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 tracking-tight">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 my-1" />
              ) : (
                mockExamsCount
              )}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              Active Mock Exam Simulations
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600">
              {usersCount} Registered Candidates
            </span>
            <Link
              href="/dashboard/mock-exams"
              className="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-0.5"
            >
              <span>Exams</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Distribution Ratio & Question Types Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Question Bank Distribution Ratio
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Comparison between Clinical Problem Solving and Professional Dilemmas papers.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-600" />
              <span className="text-slate-700">CPS: {cpsPercentage}% ({totalCPSQuestions.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-700">PD: {pdPercentage}% ({totalPDQuestions.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${cpsPercentage}%` }}
            className="bg-cyan-600 h-full transition-all duration-500"
            title={`Clinical Problem Solving: ${totalCPSQuestions} (${cpsPercentage}%)`}
          />
          <div
            style={{ width: `${pdPercentage}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Professional Dilemmas: ${totalPDQuestions} (${pdPercentage}%)`}
          />
        </div>

        {/* 4 Format Breakdown Pill Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Single Best Answer
            </span>
            <div className="text-lg font-black text-slate-800">{totalSBA.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium">Standard CPS MCQs</div>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/60 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-cyan-800 tracking-wider">
              Extended Matching
            </span>
            <div className="text-lg font-black text-cyan-900">{totalEMQCases.toLocaleString()}</div>
            <div className="text-[10px] text-cyan-700 font-medium">
              Vignettes across {totalEMQThemes} Themes
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider flex items-center gap-1">
              <ListOrdered className="w-3 h-3" />
              Ranking Scenarios
            </span>
            <div className="text-lg font-black text-amber-900">{totalRanking.toLocaleString()}</div>
            <div className="text-[10px] text-amber-700 font-medium">Order 5 actions</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              Multiple Best
            </span>
            <div className="text-lg font-black text-slate-800">{totalSelect3.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium">Select 3 of 8 options</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PROFESSIONAL DILEMMAS (PD) DOMAINS HIGHLIGHT */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Professional Dilemmas (3 Core GMC Domains)
              </h3>
              <p className="text-slate-400 text-xs">
                Good Medical Practice situational judgment scenarios scored via concordance difference matrix.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/professional-dilemmas"
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            <span>Open PD Control Center</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 3 Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pdBanks.map((domain) => (
            <div
              key={domain.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-amber-200 hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{domain.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-2 mt-1">
                    {domain.description || "GMC Good Medical Practice guidance scenarios"}
                  </p>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-black text-amber-600">
                    {(domain.questionCount || 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-1">questions</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-amber-100/70 text-amber-800">
                    {domain.rankingCount || 0} Ranking
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {domain.select3Count || 0} Select 3
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: CLINICAL PROBLEM SOLVING (CPS) SPECIALTIES OVERVIEW */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700">
              <Stethoscope className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Clinical Problem Solving (18 Medical Specialties)
              </h3>
              <p className="text-slate-400 text-xs">
                Breakdown of all 18 clinical medicine modules and single best answer cases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={specialtySearch}
                onChange={(e) => setSpecialtySearch(e.target.value)}
                placeholder="Filter specialty..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 w-40 sm:w-52"
              />
            </div>
            <Link
              href="/dashboard/clinical-problem-solving"
              className="px-3.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Manage CPS</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 18 Specialties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredCPS.map((spec) => (
            <div
              key={spec.id}
              className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 hover:bg-white hover:border-cyan-200 hover:shadow-2xs transition-all flex flex-col justify-between"
            >
              <div>
                <h5 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">
                  {spec.title}
                </h5>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-sm font-black text-cyan-800">
                  {(spec.questionCount || 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {spec.sbaCount || 0} SBA
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: PLATFORM OPERATIONS & SUPPORT PULSE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Support Tickets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Support Inquiries
              </span>
              <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <LifeBuoy className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-slate-900">{supportStats.total}</div>
              <span className="text-xs font-semibold text-slate-500">tickets received</span>
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-bold text-amber-600">{supportStats.open} pending reply</span>
            </div>
          </div>
          <Link
            href="/dashboard/support"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Review Inquiries</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Quality Audit & Flags */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Reports &amp; Bookmarks
              </span>
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <Flag className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-slate-900">{reportsCount.total}</div>
              <span className="text-xs font-semibold text-slate-500">issue reports</span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <span className="font-bold text-rose-600">{reportsCount.pending} unresolved</span>
              <span>•</span>
              <span className="text-slate-500">{reportsCount.flags} platform flags</span>
            </div>
          </div>
          <Link
            href="/dashboard/reports"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Open Quality Audit</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Candidate Directory */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Candidate Management
              </span>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-slate-900">{usersCount}</div>
              <span className="text-xs font-semibold text-slate-500">candidates enrolled</span>
            </div>
            <div className="text-xs text-slate-600">
              <span className="text-slate-500">Targeting MSRA &amp; Core Training</span>
            </div>
          </div>
          <Link
            href="/dashboard/users"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Manage Candidates</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
