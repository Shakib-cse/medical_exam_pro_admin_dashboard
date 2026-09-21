"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Clock,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  adminMockExamApi,
  AdminMockExamData,
} from "@/services/adminMockExamApi";
import { MockExamModal } from "./_components/MockExamModal";

export default function AdminMockExamsPage() {
  const [exams, setExams] = useState<AdminMockExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<AdminMockExamData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await adminMockExamApi.getMockExams();
      if (res?.data) {
        setExams(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load mock exams:", err);
      showFeedback("error", err.message || "Failed to load mock exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (exam: AdminMockExamData) => {
    setEditingExam(exam);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await adminMockExamApi.deleteMockExam(id);
      showFeedback("success", "Mock exam deleted successfully");
      setDeleteConfirmId(null);
      await fetchExams();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to delete mock exam");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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
      <div className="bg-gradient-to-r from-[#072438] to-[#143e34] text-white p-6 sm:p-7 rounded-2xl shadow-md border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-950/80 rounded-lg border border-emerald-800 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Mock Exam Management</h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Create, configure and manage timed mock exams, difficulty badges, and test questions for candidates.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Mock Exam</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Mocks</div>
          <div className="text-2xl font-black text-slate-900">{exams.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 pt-0.5">Published exam blueprints</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Duration</div>
          <div className="text-2xl font-black text-emerald-600">
            {exams.length > 0
              ? Math.round(exams.reduce((acc, curr) => acc + (curr.durationMinutes || 45), 0) / exams.length)
              : 45}{" "}
            mins
          </div>
          <div className="text-[11px] font-semibold text-slate-500 pt-0.5">Standard timed sessions</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            Live Sync
          </div>
          <div className="text-[11px] font-semibold text-slate-500 pt-0.5">Mock portal operational</div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Published Mock Exams ({exams.length})</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">EXAM TITLE</th>
                <th className="py-3.5 px-6">CATEGORY</th>
                <th className="py-3.5 px-6">QUESTIONS</th>
                <th className="py-3.5 px-6">DURATION</th>
                <th className="py-3.5 px-6">DIFFICULTY</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No mock exams created yet. Click above to create one.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => {
                  const qCount = Array.isArray(exam.questions) ? exam.questions.length : exam.questions || 0;
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 leading-snug">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </span>
                          <span>{exam.title}</span>
                        </div>
                        {exam.description && (
                          <p className="text-[11px] font-normal text-slate-400 truncate max-w-xs mt-1 pl-6">
                            {exam.description}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-600">
                        <span className="font-bold text-slate-800 block text-xs">{exam.category}</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <span className="text-sm text-emerald-700 font-black">{qCount}</span> questions
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.durationMinutes || 45} mins</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {exam.difficultyBadge || "MODERATE"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(exam)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-600 shadow-2xs transition-all cursor-pointer"
                            title="Edit Exam"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(exam.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs transition-all cursor-pointer"
                            title="Delete Exam"
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
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Mock Exam?</h3>
              <p className="text-xs text-slate-500">
                Are you sure? This will remove this exam and all associated questions from the student portal.
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
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <MockExamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingExam={editingExam}
        onSaveSuccess={(msg) => {
          showFeedback("success", msg);
          fetchExams();
        }}
        onError={(err) => showFeedback("error", err)}
      />
    </div>
  );
}
