"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, FileCheck2, Loader2 } from "lucide-react";
import {
  MockExamInput,
  QuestionInput,
  AdminMockExamData,
  adminMockExamApi,
} from "@/services/adminMockExamApi";

const emptyQuestion: QuestionInput = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
};

interface MockExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (message: string) => void;
  onError: (error: string) => void;
  editingExam: AdminMockExamData | null;
}

export function MockExamModal({
  isOpen,
  onClose,
  onSaveSuccess,
  onError,
  editingExam,
}: MockExamModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cardiology");
  const [difficultyBadge, setDifficultyBadge] = useState("MODERATE");
  const [difficultyType, setDifficultyType] = useState<"moderate" | "advanced" | "clinical" | "standard">("moderate");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [questions, setQuestions] = useState<QuestionInput[]>([{ ...emptyQuestion }]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingExam) {
      setTitle(editingExam.title);
      setDescription(editingExam.description || "");
      setCategory(editingExam.category || "Cardiology");
      setDifficultyBadge(editingExam.difficultyBadge || "MODERATE");
      setDifficultyType(editingExam.difficultyType || "moderate");
      setDurationMinutes(editingExam.durationMinutes || 45);

      adminMockExamApi
        .getMockExamById(editingExam.id)
        .then((res) => {
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
        })
        .catch(() => {
          setQuestions([{ ...emptyQuestion }]);
        });
    } else {
      setTitle("");
      setDescription("");
      setCategory("Cardiology");
      setDifficultyBadge("MODERATE");
      setDifficultyType("moderate");
      setDurationMinutes(45);
      setQuestions([
        {
          questionText: "A 52-year-old male with a history of hypertension...",
          options: ["ACE inhibitor", "Beta-blocker", "Calcium channel blocker", "Thiazide diuretic"],
          correctAnswer: 0,
          explanation: "NICE guidelines recommend ACE inhibitor as first line for under 55 without African/Caribbean ancestry.",
        },
      ]);
    }
  }, [isOpen, editingExam]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion }]);
  };

  const handleRemoveQuestion = (index: number) => {
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
      onError("Please provide an exam title");
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

      if (editingExam) {
        await adminMockExamApi.updateMockExam(editingExam.id, payload);
        onSaveSuccess("Mock exam updated successfully!");
      } else {
        await adminMockExamApi.createMockExam(payload);
        onSaveSuccess("New mock exam created and published!");
      }
      onClose();
    } catch (err: any) {
      onError(err.message || "Failed to save mock exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
              <FileCheck2 className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              {editingExam ? "Edit Mock Exam" : "Create New Mock Exam"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Exam Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MSRA High-Yield Mock 1"
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl py-2.5 px-3.5 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Clinical Practice"
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl py-2.5 px-3.5 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl py-2.5 px-3.5 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Difficulty Badge</label>
              <select
                value={difficultyBadge}
                onChange={(e) => {
                  setDifficultyBadge(e.target.value);
                  setDifficultyType(e.target.value.toLowerCase() as any);
                }}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl py-2.5 px-3.5 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="MODERATE">MODERATE</option>
                <option value="ADVANCED">ADVANCED</option>
                <option value="STANDARD">STANDARD</option>
                <option value="CLINICAL">CLINICAL</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Exam instructions, coverage, and timing notes..."
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl py-2 px-3 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Questions Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Exam Questions ({questions.length})
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Question #{qIdx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-rose-500 hover:text-rose-700 font-semibold text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Question Text</label>
                    <textarea
                      rows={2}
                      value={q.questionText}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      placeholder="Enter question scenario..."
                      className="w-full bg-white text-slate-800 text-xs rounded-lg p-2.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">Options (Select Correct)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-mock-${qIdx}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                            className="accent-emerald-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="flex-1 bg-white text-slate-800 text-xs rounded-lg py-1.5 px-2.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Explanation</label>
                    <input
                      type="text"
                      value={q.explanation || ""}
                      onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                      placeholder="Educational rationale..."
                      className="w-full bg-white text-slate-800 text-xs rounded-lg py-1.5 px-2.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{editingExam ? "Update Exam" : "Create Exam"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
