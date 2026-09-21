"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Scale,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ListOrdered,
  CheckSquare,
} from "lucide-react";
import {
  adminQuestionBankApi,
  AdminQuestionBankData,
} from "@/services/adminQuestionBankApi";
import { PDModuleModal } from "./_components/PDModuleModal";

export default function AdminProfessionalDilemmasPage() {
  const [banks, setBanks] = useState<AdminQuestionBankData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<AdminQuestionBankData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPDBanks = async () => {
    try {
      setLoading(true);
      const res = await adminQuestionBankApi.getQuestionBanks();
      if (res?.data) {
        const pdOnly = res.data.filter(
          (b) =>
            b.type === "SJT" ||
            b.type?.toLowerCase() === "sjt" ||
            b.category?.toLowerCase().includes("professional") ||
            b.specialty?.toLowerCase().includes("professional")
        );
        setBanks(pdOnly);
      }
    } catch (err: any) {
      console.error("Failed to load PD question banks:", err);
      showFeedback("error", err.message || "Failed to load PD question banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPDBanks();
  }, []);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingBank(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (bank: AdminQuestionBankData) => {
    setEditingBank(bank);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await adminQuestionBankApi.deleteQuestionBank(id);
      showFeedback("success", "PD domain module deleted successfully");
      setDeleteConfirmId(null);
      await fetchPDBanks();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to delete PD domain");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalQuestions = useMemo(() => banks.reduce((acc, curr) => acc + (curr.questionCount || 0), 0), [banks]);
  const totalRanking = useMemo(() => banks.reduce((acc, curr) => acc + (curr.rankingCount || 0), 0), [banks]);
  const totalSelect3 = useMemo(() => banks.reduce((acc, curr) => acc + (curr.select3Count || 0), 0), [banks]);

  const filteredBanks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.specialty && b.specialty.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }, [banks, search]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950 text-emerald-300 border-emerald-700"
              : "bg-rose-950 text-rose-300 border-rose-700"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d2035] to-[#153452] text-white p-6 sm:p-7 rounded-2xl shadow-md border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-950/80 rounded-lg border border-amber-700/80 text-amber-400">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Professional Dilemmas (PD) Control Center
            </h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Manage GMC Good Medical Practice domains: Ranking Dilemmas (Order 5 options) and Multiple Best (Select 3 of 8) scenarios.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create PD Module</span>
        </button>
      </div>

      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Core GMC Domains</div>
          <div className="text-2xl font-black text-slate-900">{banks.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 pt-0.5">
            Full Professional Dilemmas Syllabus
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total PD Questions</div>
          <div className="text-2xl font-black text-amber-600">{totalQuestions.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-0.5">
            <span className="text-slate-700 font-bold">{totalRanking.toLocaleString()} Ranking Scenarios</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{totalSelect3.toLocaleString()} Select 3 Scenarios</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scoring System</div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            Concordance Engine
          </div>
          <div className="text-[11px] font-semibold text-slate-500 pt-0.5">
            Difference matrix active
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search GMC domains, scenarios, descriptions..."
          className="w-full bg-transparent border-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none"
        />
      </div>

      {/* PD Domains List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Published PD Domains ({filteredBanks.length})</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">GMC DOMAIN MODULE</th>
                <th className="py-3.5 px-6">CATEGORY</th>
                <th className="py-3.5 px-6">TOTAL QUESTIONS</th>
                <th className="py-3.5 px-6">SCENARIOS BREAKDOWN</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBanks.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No Professional Dilemmas modules found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBanks.map((bank) => (
                  <tr key={bank.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 leading-snug">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
                          <Scale className="w-3.5 h-3.5" />
                        </span>
                        <span>{bank.title}</span>
                      </div>
                      {bank.description && (
                        <p className="text-[11px] font-normal text-slate-400 truncate max-w-xs mt-1 pl-6">
                          {bank.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">
                      <span className="font-bold text-slate-800 block text-xs">Professional Dilemmas (SJT)</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <span className="text-sm text-amber-800 font-black">
                        {(bank.questionCount || 0).toLocaleString()}
                      </span>{" "}
                      questions
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <ListOrdered className="w-3 h-3" />
                          {bank.rankingCount || 0} Ranking
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" />
                          {bank.select3Count || 0} Select 3
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(bank)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-amber-600 shadow-2xs transition-all cursor-pointer"
                          title="Edit PD Module"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(bank.id)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs transition-all cursor-pointer"
                          title="Delete PD Module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Professional Dilemmas Domain?</h3>
              <p className="text-xs text-slate-500">
                Are you sure? This will remove this domain module and its questions from the candidate question bank.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete Module"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <PDModuleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingBank={editingBank}
        onSaveSuccess={(msg) => {
          showFeedback("success", msg);
          fetchPDBanks();
        }}
        onError={(err) => showFeedback("error", err)}
      />
    </div>
  );
}
