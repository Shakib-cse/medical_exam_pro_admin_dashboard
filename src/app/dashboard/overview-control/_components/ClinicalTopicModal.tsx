"use client";

import React from "react";
import { Sparkles, X, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { TopicQuestion } from "@/services/adminOverviewApi";

interface ClinicalTopicModalProps {
  isOpen: boolean;
  isEditing: boolean;
  topicTitle: string;
  topicImage: string;
  topicDurationMinutes: number;
  topicQuestions: TopicQuestion[];
  saving: boolean;
  uploadingImage?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (title: string) => void;
  onImageChange: (image: string) => void;
  onDurationChange: (duration: number) => void;
  onImageFileUpload: (file: File | undefined) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (qIdx: number) => void;
  onQuestionTextChange: (qIdx: number, text: string) => void;
  onOptionChange: (qIdx: number, optIdx: number, text: string) => void;
  onCorrectAnswerChange: (qIdx: number, correctIdx: number) => void;
  onExplanationChange: (qIdx: number, text: string) => void;
}

export function ClinicalTopicModal({
  isOpen,
  isEditing,
  topicTitle,
  topicImage,
  topicDurationMinutes,
  topicQuestions,
  saving,
  uploadingImage = false,
  onClose,
  onSubmit,
  onTitleChange,
  onImageChange,
  onDurationChange,
  onImageFileUpload,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionTextChange,
  onOptionChange,
  onCorrectAnswerChange,
  onExplanationChange,
}: ClinicalTopicModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {isEditing ? "Edit Clinical Topic" : "Create New Clinical Topic"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">Topic Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiovascular"
                value={topicTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium text-slate-800"
              />
            </div>

            {/* Device Image Upload Button */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 block">Upload Image from Device</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shrink-0 transition-colors shadow-xs active:scale-98">
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingImage ? "Uploading to Cloudinary..." : topicImage ? "Change Image" : "Upload Image from Device"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    className="hidden"
                    onChange={(e) => onImageFileUpload(e.target.files?.[0])}
                  />
                </label>
                {topicImage && (
                  <button
                    type="button"
                    onClick={() => onImageChange("")}
                    className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {topicImage && (
                <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mt-2 relative">
                  <img src={topicImage} alt="Uploaded Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">Time Limit / Duration (Minutes) *</label>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 45"
                value={topicDurationMinutes}
                onChange={(e) => onDurationChange(parseInt(e.target.value) || 45)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
              />
            </div>
          </div>

          {/* Dynamic Questions Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base">
                Topic Practice Questions ({topicQuestions.length})
              </h4>
              <button
                type="button"
                onClick={onAddQuestion}
                className="px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-xs font-bold border border-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-5">
              {topicQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                      Question #{qIdx + 1}
                    </span>
                    {topicQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveQuestion(qIdx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Question Vignette / Prompt</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g., A 45-year-old male presents with acute central chest pain..."
                      value={q.questionText}
                      onChange={(e) => onQuestionTextChange(qIdx, e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Options (Select radio for correct answer)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                          <input
                            type="radio"
                            name={`topic-modal-correct-${qIdx}`}
                            checked={typeof q.correctAnswer === "number" && q.correctAnswer === optIdx}
                            onChange={() => onCorrectAnswerChange(qIdx, optIdx)}
                            className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            required
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => onOptionChange(qIdx, optIdx, e.target.value)}
                            className="w-full text-xs border-none focus:outline-none font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Clinical Reasoning Explanation</label>
                    <input
                      type="text"
                      placeholder="Clinical guidelines explaining the correct answer..."
                      value={q.explanation || ""}
                      onChange={(e) => onExplanationChange(qIdx, e.target.value)}
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Publish Topic"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
