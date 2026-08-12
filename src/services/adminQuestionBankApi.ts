import { api } from "@/lib/api";

export interface BankQuestionInput {
  id?: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subTopic?: string;
}

export interface QuestionBankInput {
  title: string;
  description?: string;
  specialty?: string;
  category?: string;
  type?: string; // "Clinical" | "SJT"
  difficultyBadge: string;
  difficultyType: "moderate" | "advanced" | "clinical" | "standard";
  questions?: BankQuestionInput[];
}

export interface AdminQuestionBankData {
  id: string;
  title: string;
  description?: string;
  specialty: string;
  category: string;
  type: string;
  difficultyBadge: string;
  difficultyType: "moderate" | "advanced" | "clinical" | "standard";
  questionCount: number;
  questions?: BankQuestionInput[];
  avgAcc?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminQuestionBankApi = {
  getQuestionBanks: async () => {
    const res = await api.get<ApiResponse<AdminQuestionBankData[]>>("/question-bank");
    return res.data;
  },

  getQuestionBankById: async (id: string) => {
    const res = await api.get<ApiResponse<AdminQuestionBankData>>(`/question-bank/${id}`);
    return res.data;
  },

  createQuestionBank: async (payload: QuestionBankInput) => {
    const res = await api.post<ApiResponse<AdminQuestionBankData>>("/question-bank", payload);
    return res.data;
  },

  updateQuestionBank: async (id: string, payload: Partial<QuestionBankInput>) => {
    const res = await api.put<ApiResponse<AdminQuestionBankData>>(`/question-bank/${id}`, payload);
    return res.data;
  },

  deleteQuestionBank: async (id: string) => {
    const res = await api.delete<ApiResponse<any>>(`/question-bank/${id}`);
    return res.data;
  },

  addQuestion: async (bankId: string, payload: BankQuestionInput) => {
    const res = await api.post<ApiResponse<BankQuestionInput>>(`/question-bank/${bankId}/questions`, payload);
    return res.data;
  },

  deleteQuestion: async (questionId: string) => {
    const res = await api.delete<ApiResponse<any>>(`/question-bank/questions/${questionId}`);
    return res.data;
  },
};
