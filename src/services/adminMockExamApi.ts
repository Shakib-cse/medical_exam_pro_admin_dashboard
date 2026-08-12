import { api } from "@/lib/api";

export interface QuestionInput {
  id?: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface MockExamInput {
  title: string;
  description?: string;
  difficultyBadge: string;
  difficultyType: "moderate" | "advanced" | "clinical" | "standard";
  durationMinutes: number;
  category: string;
  questions?: QuestionInput[];
}

export interface AdminMockExamData {
  id: string;
  title: string;
  description?: string;
  difficultyBadge: string;
  difficultyType: "moderate" | "advanced" | "clinical" | "standard";
  durationMinutes: number;
  duration?: string;
  questions: number | QuestionInput[];
  category: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminMockExamApi = {
  getMockExams: async () => {
    const res = await api.get<ApiResponse<AdminMockExamData[]>>("/mock-exams");
    return res.data;
  },

  getMockExamById: async (id: string) => {
    const res = await api.get<ApiResponse<any>>(`/mock-exams/${id}`);
    return res.data;
  },

  createMockExam: async (payload: MockExamInput) => {
    const res = await api.post<ApiResponse<AdminMockExamData>>("/mock-exams", payload);
    return res.data;
  },

  updateMockExam: async (id: string, payload: Partial<MockExamInput>) => {
    const res = await api.put<ApiResponse<AdminMockExamData>>(`/mock-exams/${id}`, payload);
    return res.data;
  },

  deleteMockExam: async (id: string) => {
    const res = await api.delete<ApiResponse<any>>(`/mock-exams/${id}`);
    return res.data;
  },
};
