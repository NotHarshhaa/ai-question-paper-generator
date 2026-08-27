import {
  QuestionBankItem,
  QuestionBankResponse,
  AnswerEvaluationResponse,
} from "@/lib/api";

export type { QuestionBankItem, QuestionBankResponse, AnswerEvaluationResponse };

export interface QuestionFiltersState {
  search: string;
  subject: string;
  difficulty: string;
  questionType: string;
}
