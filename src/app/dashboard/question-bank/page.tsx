"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";
import {
  adminQuestionBankApi,
  AdminQuestionBankData,
  QuestionBankInput,
  BankQuestionInput,
} from "@/services/adminQuestionBankApi";

const emptyQuestion: BankQuestionInput = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
  subTopic: "",
};

export default function AdminQuestionBankPage() {
  const [banks, setBanks] = useState<AdminQuestionBankData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialty, setSpecialty] = useState("Cardiology");
  const [category, setCategory] = useState("Clinical Practice");
  const [type, setType] = useState<"Clinical" | "SJT">("Clinical");
  const [difficultyBadge, setDifficultyBadge] = useState("MODERATE");
  const [difficultyType, setDifficultyType] = useState<"moderate" | "advanced" | "clinical" | "standard">("moderate");
  const [questions, setQuestions] = useState<BankQuestionInput[]>([{ ...emptyQuestion }]);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
      const res = await adminQuestionBankApi.getQuestionBanks();
      if (res?.data) {
        setBanks(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load question banks:", err);
      showFeedback("error", err.message || "Failed to load question banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingBankId(null);
    setTitle("");
    setDescription("");
    setSpecialty("Cardiology");
    setCategory("Clinical Practice");
    setType("Clinical");
    setDifficultyBadge("MODERATE");
    setDifficultyType("moderate");
    setQuestions([
      {
        questionText: "A 45-year-old male presents with acute chest pain...",
        options: ["Immediate PCI", "Thrombolysis", "Aspirin & Discharge", "Reassurance"],
        correctAnswer: 0,
        explanation: "Primary PCI within 90 minutes is recommended for acute STEMI.",
        subTopic: "Acute Coronary Syndrome",
      },
    ]);
    setModalOpen(true);
  };

  const handleOpenEditModal = async (bank: AdminQuestionBankData) => {
    try {
      setIsSubmitting(true);
      setEditingBankId(bank.id);
      setTitle(bank.title);
      setDescription(bank.description || "");
      setSpecialty(bank.specialty || "General Medicine");
      setCategory(bank.category || "Clinical Practice");
      setType((bank.type as any) || "Clinical");
      setDifficultyBadge(bank.difficultyBadge || "MODERATE");
      setDifficultyType(bank.difficultyType || "moderate");

      const res = await adminQuestionBankApi.getQuestionBankById(bank.id);
      if (res?.data?.questions && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
        setQuestions(
          res.data.questions.map((q: any) => ({
            id: q.id,
            questionText: q.questionText,
            options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || "",
            subTopic: q.subTopic || "",
          }))
        );
      } else {
        setQuestions([{ ...emptyQuestion }]);
      }
      setModalOpen(true);
    } catch (err: any) {
      showFeedback("error", "Failed to fetch question bank details for editing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddQuestionField = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        subTopic: "",
      },
    ]);
  };

  const handleRemoveQuestionField = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index].questionText = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, correctIdx: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = correctIdx;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].explanation = val;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showFeedback("error", "Please provide a question bank title");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: QuestionBankInput = {
        title,
        description,
        specialty,
        category,
        type,
        difficultyBadge,
        difficultyType,
        questions: questions.filter((q) => q.questionText.trim().length > 0),
      };

      if (editingBankId) {
        await adminQuestionBankApi.updateQuestionBank(editingBankId, payload);
        showFeedback("success", "Question bank updated successfully!");
      } else {
        await adminQuestionBankApi.createQuestionBank(payload);
        showFeedback("success", "New question bank module created and published!");
      }

      setModalOpen(false);
      await fetchQuestionBanks();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to save question bank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      await adminQuestionBankApi.deleteQuestionBank(id);
      showFeedback("success", "Question bank module deleted successfully");
      setDeleteConfirmId(null);
      await fetchQuestionBanks();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to delete question bank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuestions = banks.reduce((acc, curr) => acc + (curr.questionCount || 0), 0);

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
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072438] to-[#0f3856] text-white p-6 sm:p-7 rounded-2xl shadow-md border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-950/80 rounded-lg border border-cyan-800 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Question Bank Control Center
            </h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Create, manage, and publish question bank modules and practice items for the student dashboard.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Module</span>
        </button>
      </div>

      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Bank Modules</div>
          <div className="text-2xl font-black text-slate-900">{banks.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</div>
          <div className="text-2xl font-black text-cyan-600">{totalQuestions}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            Live Sync Active
          </div>
        </div>
      </div>

      {/* Question Bank Modules List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Published Question Bank Modules</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">MODULE TITLE</th>
                <th className="py-3.5 px-6">TYPE</th>
                <th className="py-3.5 px-6">SPECIALTY / CATEGORY</th>
                <th className="py-3.5 px-6">DIFFICULTY</th>
                <th className="py-3.5 px-6">QUESTIONS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {banks.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No question bank modules created yet. Click "Create New Module" above to add your first topic.
                  </td>
                </tr>
              ) : (
                banks.map((bank) => (
                  <tr key={bank.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 leading-snug">
                      {bank.title}
                      {bank.description && (
                        <p className="text-[11px] font-normal text-slate-400 truncate max-w-xs mt-0.5">
                          {bank.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          bank.type === "SJT" ? "bg-rose-100 text-rose-700" : "bg-cyan-100 text-cyan-800"
                        }`}
                      >
                        {bank.type || "Clinical"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block text-xs">{bank.specialty}</span>
                        <span className="text-[10px] text-slate-400">{bank.category}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-sm tracking-wider ${
                          bank.difficultyType === "advanced"
                            ? "bg-rose-100 text-rose-700"
                            : bank.difficultyType === "clinical"
                            ? "bg-sky-100 text-sky-700"
                            : bank.difficultyType === "standard"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {bank.difficultyBadge || "MODERATE"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{bank.questionCount} Questions</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(bank)}
                          className="p-1.5 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Module & Questions"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(bank.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* CREATE / EDIT QUESTION BANK MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#072438] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">
                  {editingBankId ? "Edit Question Bank Module" : "Create New Question Bank Module"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs sm:text-sm">
              {/* Basic Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700">Module Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Cardiology: Acute Coronary Syndrome"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, Neurology, Gastroenterology"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Clinical Practice, Professionalism, Guidelines"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Exam Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium bg-white"
                  >
                    <option value="Clinical">Clinical</option>
                    <option value="SJT">SJT (Situational Judgement)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Difficulty Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. MODERATE, ADVANCED, CLINICAL"
                    value={difficultyBadge}
                    onChange={(e) => setDifficultyBadge(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief overview of clinical topics covered in this module..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Questions Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">
                    Module Questions ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionField}
                    className="px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-xs font-bold border border-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                          Question #{qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionField(qIdx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Question Prompt / Vignette</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="e.g., A 52-year-old male with diabetes presents with chest discomfort..."
                          value={q.questionText}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>

                      {/* 4 Options */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Options (Select radio for correct answer)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                                className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                              />
                              <input
                                type="text"
                                required
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                className="w-full text-xs border-none focus:outline-none font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Clinical Reasoning Explanation</label>
                        <input
                          type="text"
                          placeholder="Clinical guidelines explaining the correct answer..."
                          value={q.explanation || ""}
                          onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBankId ? "Save Changes" : "Publish Module"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Delete Module?</h3>
              <p className="text-xs text-slate-500">
                This action cannot be undone. It will delete this question bank module and all its questions from the candidate platform.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
