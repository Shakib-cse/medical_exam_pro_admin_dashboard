"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  adminOverviewApi,
  ClinicalTopicItem,
  DilemmaCardItem,
  TopicQuestion,
} from "@/services/adminOverviewApi";
import { uploadApi } from "@/services/uploadApi";
import { ClinicalTopicsTable } from "./_components/ClinicalTopicsTable";
import { ClinicalTopicModal } from "./_components/ClinicalTopicModal";
import { ProfessionalDilemmasManager } from "./_components/ProfessionalDilemmasManager";

const emptyQuestion: TopicQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: -1, // -1 means NO option selected by default
  explanation: "",
};

export default function OverviewControlPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Clinical Topics Data
  const [clinicalTopics, setClinicalTopics] = useState<ClinicalTopicItem[]>([]);

  // Clinical Topic Modal Form State
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopicIdx, setEditingTopicIdx] = useState<number | null>(null);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicImage, setTopicImage] = useState("");
  const [topicDurationMinutes, setTopicDurationMinutes] = useState(45);
  const [topicCategory, setTopicCategory] = useState<"all" | "weakest" | "inProgress">("all");
  const [topicTotalQ, setTopicTotalQ] = useState(100);
  const [topicQuestions, setTopicQuestions] = useState<TopicQuestion[]>([{ ...emptyQuestion }]);

  // Professional Dilemmas Data
  const [dilemmaCards, setDilemmaCards] = useState<DilemmaCardItem[]>([]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Load from local storage cache on mount for 0ms instant render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("admin_overview_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.clinicalTopics) && parsed.clinicalTopics.length > 0) {
            setClinicalTopics(parsed.clinicalTopics);
          }
          if (Array.isArray(parsed.dilemmaCards) && parsed.dilemmaCards.length > 0) {
            setDilemmaCards(parsed.dilemmaCards);
          }
          setLoading(false);
        } catch (_) {}
      }
    }
  }, []);

  // Fetch content from backend on mount asynchronously in background
  const fetchContent = async () => {
    try {
      const res = await adminOverviewApi.getOverviewContent();
      if (res?.data) {
        let topics: ClinicalTopicItem[] = [];
        let dilemmas: DilemmaCardItem[] = [];

        if (res.data.clinical_topics?.content) {
          topics = res.data.clinical_topics.content;
          setClinicalTopics(topics);
        }
        if (res.data.professional_dilemmas?.content) {
          dilemmas = res.data.professional_dilemmas.content;
          setDilemmaCards(dilemmas);
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "admin_overview_cache",
            JSON.stringify({ clinicalTopics: topics, dilemmaCards: dilemmas })
          );
        }
      }
    } catch (err: any) {
      console.error("Failed to load overview content:", err);
      showFeedback("error", "Failed to load overview content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSaveSection = async (section: string, content: any, title?: string) => {
    try {
      setSaving(true);
      await adminOverviewApi.upsertSection(section, { title, content });
      if (typeof window !== "undefined") {
        const currentCache = localStorage.getItem("admin_overview_cache");
        let parsed = currentCache ? JSON.parse(currentCache) : {};
        if (section === "clinical_topics") parsed.clinicalTopics = content;
        if (section === "professional_dilemmas") parsed.dilemmaCards = content;
        localStorage.setItem("admin_overview_cache", JSON.stringify(parsed));
      }
      showFeedback("success", `"${section}" section saved and published!`);
    } catch (err: any) {
      showFeedback("error", err.message || `Failed to save ${section}`);
    } finally {
      setSaving(false);
    }
  };

  // ========== CLINICAL TOPIC MODAL HANDLERS ==========
  const handleOpenCreateTopicModal = () => {
    setEditingTopicIdx(null);
    setTopicTitle("");
    setTopicImage("");
    setTopicDurationMinutes(45);
    setTopicCategory("all");
    setTopicTotalQ(100);
    setTopicQuestions([
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: -1,
        explanation: "",
      },
    ]);
    setTopicModalOpen(true);
  };

  const handleOpenEditTopicModal = (index: number) => {
    const topic = clinicalTopics[index];
    setEditingTopicIdx(index);
    setTopicTitle(topic.title);
    setTopicImage(topic.image || "");
    setTopicDurationMinutes(topic.durationMinutes || 45);
    setTopicCategory(topic.category || "all");
    setTopicTotalQ(topic.totalQ || 100);
    setTopicQuestions(
      topic.questions && topic.questions.length > 0
        ? topic.questions.map((q) => ({
          questionText: q.questionText,
          options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
          correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : -1,
          explanation: q.explanation || "",
        }))
        : [{ ...emptyQuestion }]
    );
    setTopicModalOpen(true);
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleTopicImageFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const cdnUrl = await uploadApi.uploadImage(file, "kawanf/clinical-topics");
      if (cdnUrl) {
        setTopicImage(cdnUrl);
        showFeedback("success", "Image uploaded to Cloudinary CDN successfully!");
      }
    } catch (err: any) {
      showFeedback("error", err?.message || "Cloudinary upload failed. Falling back to local preview.");
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setTopicImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddQuestionToTopicForm = () => {
    setTopicQuestions([...topicQuestions, { ...emptyQuestion }]);
  };

  const handleRemoveQuestionFromTopicForm = (qIdx: number) => {
    if (topicQuestions.length === 1) return;
    setTopicQuestions(topicQuestions.filter((_, i) => i !== qIdx));
  };

  const handleQuestionTextChange = (qIdx: number, val: string) => {
    const updated = [...topicQuestions];
    updated[qIdx].questionText = val;
    setTopicQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...topicQuestions];
    updated[qIdx].options[optIdx] = val;
    setTopicQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIdx: number, correctIdx: number) => {
    const updated = [...topicQuestions];
    updated[qIdx].correctAnswer = correctIdx;
    setTopicQuestions(updated);
  };

  const handleExplanationChange = (qIdx: number, val: string) => {
    const updated = [...topicQuestions];
    updated[qIdx].explanation = val;
    setTopicQuestions(updated);
  };

  const handleSubmitTopicModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      showFeedback("error", "Please enter a topic title");
      return;
    }

    const updatedTopicItem: ClinicalTopicItem = {
      id: editingTopicIdx !== null ? clinicalTopics[editingTopicIdx].id : `topic-${Date.now()}`,
      title: topicTitle,
      image: topicImage,
      totalQ: topicQuestions.filter((q) => q.questionText.trim().length > 0).length || Number(topicTotalQ) || 100,
      durationMinutes: Number(topicDurationMinutes) || 45,
      category: topicCategory,
      questions: topicQuestions.filter((q) => q.questionText.trim().length > 0),
    };

    let newTopicsList: ClinicalTopicItem[] = [];
    if (editingTopicIdx !== null) {
      newTopicsList = [...clinicalTopics];
      newTopicsList[editingTopicIdx] = updatedTopicItem;
    } else {
      newTopicsList = [...clinicalTopics, updatedTopicItem];
    }

    setClinicalTopics(newTopicsList);
    setTopicModalOpen(false);

    await handleSaveSection("clinical_topics", newTopicsList, "Clinical Problem Solving Topics");
  };

  const handleDeleteTopic = async (index: number) => {
    const topicToDelete = clinicalTopics[index];
    if (!confirm(`Are you sure you want to delete "${topicToDelete.title}"?`)) return;

    const newTopicsList = clinicalTopics.filter((_, i) => i !== index);
    setClinicalTopics(newTopicsList);
    await handleSaveSection("clinical_topics", newTopicsList, "Clinical Problem Solving Topics");
  };

  // ========== PROFESSIONAL DILEMMAS HANDLERS ==========
  const addDilemmaCard = () => {
    setDilemmaCards([
      ...dilemmaCards,
      {
        title: "",
        subtitle: "",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
      },
    ]);
  };

  const removeDilemmaCard = (idx: number) => {
    setDilemmaCards(dilemmaCards.filter((_, i) => i !== idx));
  };

  const updateDilemmaCard = (idx: number, field: keyof DilemmaCardItem, val: string) => {
    const updated = [...dilemmaCards];
    updated[idx][field] = val;
    setDilemmaCards(updated);
  };

  const handleDilemmaImageFileUpload = async (idx: number, file: File | undefined) => {
    if (!file) return;
    try {
      const cdnUrl = await uploadApi.uploadImage(file, "kawanf/dilemmas");
      if (cdnUrl) {
        updateDilemmaCard(idx, "image", cdnUrl);
        showFeedback("success", "Dilemma card image uploaded to Cloudinary!");
      }
    } catch (err: any) {
      showFeedback("error", err?.message || "Cloudinary upload failed. Falling back to local preview.");
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          updateDilemmaCard(idx, "image", e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && clinicalTopics.length === 0 && dilemmaCards.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Overview Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#072438] to-[#0d3b5c] p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold">Overview Page Control Center</h1>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            Manage candidate overview page content: Clinical Topic cards, time limits, and custom practice questions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateTopicModal}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Clinical Topic</span>
        </button>
      </div>

      {/* Alert Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 font-semibold text-xs animate-in fade-in duration-200 ${feedbackMsg.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* SECTION 1: CLINICAL PROBLEM SOLVING TOPICS */}
      <ClinicalTopicsTable
        clinicalTopics={clinicalTopics}
        onOpenCreateModal={handleOpenCreateTopicModal}
        onOpenEditModal={handleOpenEditTopicModal}
        onDeleteTopic={handleDeleteTopic}
      />

      {/* SECTION 2: PROFESSIONAL DILEMMAS */}
      <ProfessionalDilemmasManager
        dilemmaCards={dilemmaCards}
        saving={saving}
        onAddCard={addDilemmaCard}
        onRemoveCard={removeDilemmaCard}
        onUpdateCard={updateDilemmaCard}
        onImageFileUpload={handleDilemmaImageFileUpload}
        onSaveDilemmas={() => handleSaveSection("professional_dilemmas", dilemmaCards, "Professional Dilemmas")}
      />

      {/* CREATE / EDIT CLINICAL TOPIC MODAL FORM */}
      <ClinicalTopicModal
        isOpen={topicModalOpen}
        isEditing={editingTopicIdx !== null}
        topicTitle={topicTitle}
        topicImage={topicImage}
        topicDurationMinutes={topicDurationMinutes}
        topicQuestions={topicQuestions}
        saving={saving}
        uploadingImage={uploadingImage}
        onClose={() => setTopicModalOpen(false)}
        onSubmit={handleSubmitTopicModal}
        onTitleChange={setTopicTitle}
        onImageChange={setTopicImage}
        onDurationChange={setTopicDurationMinutes}
        onImageFileUpload={handleTopicImageFileUpload}
        onAddQuestion={handleAddQuestionToTopicForm}
        onRemoveQuestion={handleRemoveQuestionFromTopicForm}
        onQuestionTextChange={handleQuestionTextChange}
        onOptionChange={handleOptionChange}
        onCorrectAnswerChange={handleCorrectAnswerChange}
        onExplanationChange={handleExplanationChange}
      />
    </div>
  );
}
