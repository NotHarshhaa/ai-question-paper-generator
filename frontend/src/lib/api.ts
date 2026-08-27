const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  timeoutMs = 300_000 // 5 minutes — ML model loading can be slow
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. The backend may be loading AI models for the first time — please try again in a moment.");
    }
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Cannot connect to backend. Please check if the backend server is running and accessible.");
    }
    throw err;
  }
}

export interface ExamPatternStructure {
  shortQuestions?: {
    count: number;
    marks: number;
    total: number;
    choice?: {
      generate: number;
      attempt: number;
    };
  };
  longQuestions?: {
    count: number;
    marks: number;
    total: number;
    units?: number;
    questionsPerUnit?: number;
  };
  sections?: Array<{
    name: string;
    marks: number;
    questions: number;
  }>;
  totalMarks: number;
}

export interface GenerateRequest {
  subject: string;
  syllabus: string;
  exam_pattern: string;
  exam_structure?: ExamPatternStructure;
  total_marks: number;
  duration_minutes: number;
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  num_questions: number;
  organization_name?: string;
  semester?: string;
  // Flattened exam pattern fields for backend compatibility
  short_questions_count?: number;
  short_questions_marks?: number;
  short_questions_total?: number;
  short_questions_choice_generate?: number;
  short_questions_choice_attempt?: number;
  long_questions_count?: number;
  long_questions_marks?: number;
  long_questions_total?: number;
  long_questions_units?: number;
  long_questions_per_unit?: number;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  unit: string;
  topic: string;
  question_type: string;
  bloom_level?: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  bloom_order?: number;
}

export interface GeneratedPaper {
  id: string;
  subject: string;
  organization_name: string;
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
  organization_name: string;
}

export interface QuestionBankItem {
  id: number;
  subject: string;
  text: string;
  answer: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  question_type: string;
  topic: string;
  source_file: string;
  bloom_level?: string;
}

export interface QuestionBankResponse {
  questions: QuestionBankItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AnalyticsSubjectItem {
  subject: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface AnalyticsTopicItem {
  topic: string;
  count: number;
}

export interface AnalyticsData {
  total_questions: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  bloom_distribution?: Record<string, number>;
  subjects: AnalyticsSubjectItem[];
  top_topics: AnalyticsTopicItem[];
  papers_generated: number;
  avg_paper_marks: number;
  recent_papers: PaperHistoryItem[];
}

export interface SolutionItem {
  question_id: string;
  text: string;
  marks: number;
  difficulty: string;
  solution: string;
  key_points: string[];
}

export interface PaperSolutionsResponse {
  paper_id: string;
  subject: string;
  solutions: SolutionItem[];
}

export interface AnswerEvaluationRequest {
  question: string;
  model_answer?: string;
  student_answer: string;
  max_marks?: number;
}

export interface AnswerEvaluationResponse {
  score: number;
  max_marks: number;
  percentage: number;
  grade: string;
  semantic_similarity: number;
  concept_coverage: number;
  strengths: string[];
  missing_points: string[];
  feedback: string;
  improvement_tips: string[];
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  correct_option_letter: string;
  correct_answer: string;
  explanation: string;
  marks: number;
  difficulty: string;
  question_type: "mcq";
}

export interface MCQResponse {
  subject: string;
  topic: string;
  mcqs: MCQQuestion[];
}

export const api = {
  generatePaper: (data: GenerateRequest) =>
    request<GeneratedPaper>("/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPaperHistory: () => request<PaperHistoryItem[]>("/papers"),

  getPaper: (id: string) => request<GeneratedPaper>(`/papers/${id}`),

  updatePaper: (id: string, data: Partial<GeneratedPaper>) =>
    request<{ message: string; paper: GeneratedPaper }>(`/papers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deletePaper: (id: string) =>
    request<{ message: string }>(`/papers/${id}`, { method: "DELETE" }),

  exportPdf: async (id: string) => {
    const res = await fetch(`${API_BASE}/papers/${id}/pdf`);
    if (!res.ok) throw new Error("Failed to export PDF");
    return res.blob();
  },

  getPaperSolutions: (id: string) =>
    request<PaperSolutionsResponse>(`/papers/${id}/solutions`),

  evaluateAnswer: (data: AnswerEvaluationRequest) =>
    request<AnswerEvaluationResponse>("/evaluate-answer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  generateMCQs: (data: { subject: string; topic?: string; count?: number }) =>
    request<MCQResponse>("/generate-mcq", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSubjects: () => request<string[]>("/subjects"),

  getQuestionBank: (params?: {
    subject?: string;
    difficulty?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.append("subject", params.subject);
    if (params?.difficulty) searchParams.append("difficulty", params.difficulty);
    if (params?.type) searchParams.append("type", params.type);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const queryString = searchParams.toString();
    return request<QuestionBankResponse>(`/question-bank${queryString ? `?${queryString}` : ""}`);
  },

  getAnalytics: () => request<AnalyticsData>("/analytics"),

  analyzeSyllabus: (syllabus: string) =>
    request<{ topics: string[]; units: string[] }>("/analyze-syllabus", {
      method: "POST",
      body: JSON.stringify({ syllabus }),
    }),
};
