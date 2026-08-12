"use client";

import React from "react";
import { Plus, Edit3, Trash2, ImageIcon } from "lucide-react";
import { ClinicalTopicItem } from "@/services/adminOverviewApi";

interface ClinicalTopicsTableProps {
  clinicalTopics: ClinicalTopicItem[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (index: number) => void;
  onDeleteTopic: (index: number) => void;
}

export function ClinicalTopicsTable({
  clinicalTopics,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteTopic,
}: ClinicalTopicsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="p-5 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm">Clinical Problem Solving Topic Cards</h3>
          <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-xs font-extrabold">
            {clinicalTopics.length} Topics
          </span>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-xl text-xs font-bold border border-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Clinical Topics Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">IMAGE & TITLE</th>
              <th className="py-3.5 px-6">TIME LIMIT</th>
              <th className="py-3.5 px-6">QUESTIONS COUNT</th>
              <th className="py-3.5 px-6">PRACTICE SET STATUS</th>
              <th className="py-3.5 px-6 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinicalTopics.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  No clinical problem solving topics created yet. Click "Create New Clinical Topic" above to add your first card.
                </td>
              </tr>
            ) : (
              clinicalTopics.map((topic, idx) => {
                const qCount = topic.questions?.length || 0;

                return (
                  <tr key={topic.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    {/* Image & Title */}
                    <td className="py-4 px-6 font-bold text-slate-900 leading-snug">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 relative">
                          {topic.image ? (
                            <img src={topic.image} alt={topic.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-300 m-auto mt-3" />
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">{topic.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">ID: {topic.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Time Limit */}
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                        {topic.durationMinutes || 45} Mins
                      </span>
                    </td>

                    {/* Questions Count */}
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {topic.totalQ || 100} Questions
                    </td>

                    {/* Practice Set Status */}
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${qCount > 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                        {qCount > 0 ? `${qCount} Questions Configured` : "No Questions Added"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenEditModal(idx)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => onDeleteTopic(idx)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
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
  );
}
