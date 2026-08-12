import { api } from "@/lib/api";

export interface TopicQuestion {
  id?: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ClinicalTopicItem {
  id: string;
  title: string;
  image: string;
  totalQ: number;
  durationMinutes?: number;
  category: "all" | "weakest" | "inProgress";
  questions?: TopicQuestion[];
}

export interface DilemmaCardItem {
  title: string;
  subtitle: string;
  image: string;
}

export interface DailyGoalConfig {
  goalTarget: number;
  weakestTopics: Array<{ name: string; score: string }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminOverviewApi = {
  getOverviewContent: async () => {
    const res = await api.get<ApiResponse<Record<string, any>>>("/overview/content");
    return res.data;
  },

  upsertSection: async (section: string, payload: { title?: string; content: any; isActive?: boolean }) => {
    const res = await api.put<ApiResponse<any>>(`/overview/content/${section}`, payload);
    return res.data;
  },

  deleteSection: async (section: string) => {
    const res = await api.delete<ApiResponse<any>>(`/overview/content/${section}`);
    return res.data;
  },
};
