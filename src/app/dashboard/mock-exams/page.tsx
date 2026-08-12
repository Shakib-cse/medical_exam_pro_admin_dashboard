"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Clock,
  CheckCircle2,
  X,
  FileCheck2,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  adminMockExamApi,
  AdminMockExamData,
  MockExamInput,
  QuestionInput,
} from "@/services/adminMockExamApi";

const emptyQuestion: QuestionInput = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
};

export default function AdminMockExamsPage() {
  const [exams, setExams] = useState<AdminMockExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cardiology");
  const [difficultyBadge, setDifficultyBadge] = useState("MODERATE");
  const [difficultyType, setDifficultyType] = useState<"moderate" | "advanced" | "clinical" | "standard">("moderate");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [questions, setQuestions] = useState<QuestionInput[]>([{ ...emptyQuestion }]);

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
    setEditingExamId(null);
    setTitle("");
    setDescription("");
    setCategory("Cardiology");
    setDifficultyBadge("MODERATE");
    setDifficultyType("moderate");
    setDurationMinutes(45);
    setQuestions([
      {
        questionText: "A 65-year-old male presents with chest pain...",
        options: ["12-Lead ECG", "Chest X-Ray", "CT Pulmonary Angiogram", "Echocardiogram"],
        correctAnswer: 0,
        explanation: "12-lead ECG is the first diagnostic test for suspected ACS.",
      },
    ]);
    setModalOpen(true);
  };

  const handleOpenEditModal = async (exam: AdminMockExamData) => {
    try {
      setIsSubmitting(true);
      setEditingExamId(exam.id);
      setTitle(exam.title);
      setDescription(exam.description || "");
      setCategory(exam.category || "General");
      setDifficultyBadge(exam.difficultyBadge || "MODERATE");
      setDifficultyType(exam.difficultyType || "moderate");
      setDurationMinutes(exam.durationMinutes || 45);

      // Fetch full questions for editing
      const res = await adminMockExamApi.getMockExamById(exam.id);
      if (res?.data?.questions && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
        setQuestions(
          res.data.questions.map((q: any) => ({
            id: q.id,
            questionText: q.questionText,
            options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || "",
          }))
        );
      } else {
        setQuestions([{ ...emptyQuestion }]);
      }
      setModalOpen(true);
    } catch (err: any) {
      showFeedback("error", "Failed to fetch exam details for editing");
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
      showFeedback("error", "Please provide an exam title");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: MockExamInput = {
        title,
        description,
        category,
        difficultyBadge,
        difficultyType,
        durationMinutes: Number(durationMinutes),
        questions: questions.filter((q) => q.questionText.trim().length > 0),
      };

      if (editingExamId) {
        await adminMockExamApi.updateMockExam(editingExamId, payload);
        showFeedback("success", "Mock exam updated successfully!");
      } else {
        await adminMockExamApi.createMockExam(payload);
        showFeedback("success", "New mock exam created and published for frontend!");
      }

      setModalOpen(false);
      await fetchExams();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to save mock exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      await adminMockExamApi.deleteMockExam(id);
      showFeedback("success", "Mock exam deleted successfully");
      setDeleteConfirmId(null);
      await fetchExams();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to delete mock exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuestions = exams.reduce((acc, curr) => {
    const qCount = typeof curr.questions === "number" ? curr.questions : (curr.questions as any[])?.length || 0;
    return acc + qCount;
  }, 0);

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
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Mock Exams Control Center
            </h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Create, edit, and publish mock exams and targeted clinical questions live for the student dashboard.
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

      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Mock Exams</div>
          <div className="text-2xl font-black text-slate-900">{exams.length}</div>
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

      {/* Mock Exams List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Published Mock Exams</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">EXAM TITLE</th>
                <th className="py-3.5 px-6">CATEGORY</th>
                <th className="py-3.5 px-6">DIFFICULTY</th>
                <th className="py-3.5 px-6">DURATION</th>
                <th className="py-3.5 px-6">QUESTIONS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No mock exams created yet. Click "Create New Mock Exam" above to add your first mock exam.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => {
                  const qCount = typeof exam.questions === "number" ? exam.questions : (exam.questions as any[])?.length || 0;
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 leading-snug">
                        {exam.title}
                        {exam.description && (
                          <p className="text-[11px] font-normal text-slate-400 truncate max-w-xs mt-0.5">
                            {exam.description}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                          {exam.category || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-sm tracking-wider ${
                            exam.difficultyType === "advanced"
                              ? "bg-rose-100 text-rose-700"
                              : exam.difficultyType === "clinical"
                              ? "bg-sky-100 text-sky-700"
                              : exam.difficultyType === "standard"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {exam.difficultyBadge || "MODERATE"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.durationMinutes} mins</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{qCount} Questions</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(exam)}
                            className="p-1.5 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Exam"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(exam.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* CREATE / EDIT MOCK EXAM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#072438] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">
                  {editingExamId ? "Edit Mock Exam" : "Create New Mock Exam"}
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
                  <label className="font-bold text-slate-700">Exam Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Cardiology & Respiratory Focus"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, SJT, Neurology"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Difficulty Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. MODERATE, ADVANCED, CLINICAL"
                    value={difficultyBadge}
                    onChange={(e) => setDifficultyBadge(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Difficulty Type (Color)</label>
                  <select
                    value={difficultyType}
                    onChange={(e) => setDifficultyType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium bg-white"
                  >
                    <option value="moderate">Moderate (Orange)</option>
                    <option value="advanced">Advanced (Red)</option>
                    <option value="clinical">Clinical (Blue)</option>
                    <option value="standard">Standard (Amber)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the topics covered in this mock test..."
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
                    Exam Questions ({questions.length})
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
                        <label className="text-xs font-bold text-slate-600">Question Prompt</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="e.g., A patient presents with shortness of breath..."
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
                                placeholder={`Option ${optIdx + 1}`}
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
                        <label className="text-xs font-bold text-slate-600">Clinical Explanation (Optional)</label>
                        <input
                          type="text"
                          placeholder="Why is option correct?"
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
                  <span>{editingExamId ? "Save Changes" : "Publish Mock Exam"}</span>
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
              <h3 className="font-bold text-slate-900 text-base">Delete Mock Exam?</h3>
              <p className="text-xs text-slate-500">
                This action cannot be undone. It will remove this mock exam and its questions from the student dashboard.
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
