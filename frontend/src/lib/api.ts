const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface GenerateRequest {
  subject: string;
  syllabus: string;
  exam_pattern: string;
  total_marks: number;
  duration_minutes: number;
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  num_questions: number;
  university_name?: string;
  semester?: string;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  unit: string;
  topic: string;
  question_type: string;
}

export interface GeneratedPaper {
  id: string;
  subject: string;
  university_name: string;
  semester: string;
  total_marks: number;
  duration_minutes: number;
  questions: Question[];
  sections: Section[];
  created_at: string;
  syllabus_topics: string[];
}

export interface Section {
  name: string;
  instructions: string;
  questions: Question[];
  total_marks: number;
}

export interface PaperHistoryItem {
  id: string;
  subject: string;
  total_marks: number;
  created_at: string;
  num_questions: number;
  university_name: string;
}

export const api = {
  generatePaper: (data: GenerateRequest) =>
    request<GeneratedPaper>("/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPaperHistory: () => request<PaperHistoryItem[]>("/papers"),

  getPaper: (id: string) => request<GeneratedPaper>(`/papers/${id}`),

  deletePaper: (id: string) =>
    request<{ message: string }>(`/papers/${id}`, { method: "DELETE" }),

  exportPdf: async (id: string) => {
    const res = await fetch(`${API_BASE}/papers/${id}/pdf`);
    if (!res.ok) throw new Error("Failed to export PDF");
    return res.blob();
  },

  getSubjects: () => request<string[]>("/subjects"),

  analyzeSyllabus: (syllabus: string) =>
    request<{ topics: string[]; units: string[] }>("/analyze-syllabus", {
      method: "POST",
      body: JSON.stringify({ syllabus }),
    }),
};
