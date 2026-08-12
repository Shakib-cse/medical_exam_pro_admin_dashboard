"use client";

import React from "react";
import { Plus, Trash2, Upload, Save, Loader2, ImageIcon } from "lucide-react";
import { DilemmaCardItem } from "@/services/adminOverviewApi";

interface ProfessionalDilemmasManagerProps {
  dilemmaCards: DilemmaCardItem[];
  saving: boolean;
  onAddCard: () => void;
  onRemoveCard: (index: number) => void;
  onUpdateCard: (index: number, field: keyof DilemmaCardItem, value: string) => void;
  onImageFileUpload: (index: number, file: File | undefined) => void;
  onSaveDilemmas: () => void;
}

export function ProfessionalDilemmasManager({
  dilemmaCards,
  saving,
  onAddCard,
  onRemoveCard,
  onUpdateCard,
  onImageFileUpload,
  onSaveDilemmas,
}: ProfessionalDilemmasManagerProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="p-5 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm">Professional Dilemmas Cards</h3>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-extrabold">
            {dilemmaCards.length} Cards
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {dilemmaCards.map((card, idx) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-700 text-xs uppercase">Card #{idx + 1}</span>
              <button
                onClick={() => onRemoveCard(idx)}
                className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Card Title</label>
                <input
                  type="text"
                  placeholder="e.g. Professional Integrity"
                  value={card.title}
                  onChange={(e) => onUpdateCard(idx, "title", e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Card Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Probity, safety and candour"
                  value={card.subtitle}
                  onChange={(e) => onUpdateCard(idx, "subtitle", e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Upload Card Image from Device</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 relative">
                    {card.image ? (
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-slate-300 m-auto mt-4" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs active:scale-98">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{card.image ? "Change Image" : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onImageFileUpload(idx, e.target.files?.[0])}
                      />
                    </label>
                    {card.image && (
                      <button
                        type="button"
                        onClick={() => onUpdateCard(idx, "image", "")}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onAddCard}
            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
          <button
            onClick={onSaveDilemmas}
            disabled={saving}
            className="px-4 py-2 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <Save className="w-3.5 h-3.5" /> Save & Publish Dilemmas
          </button>
        </div>
      </div>
    </div>
  );
}
