import { ExamPatternStructure } from "@/lib/api";

export interface ProcessedSyllabus {
  number: number;
  title: string;
  topics: string[];
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface ChoiceBasedConfig {
  enabled: boolean;
  generate: number;
  attempt: number;
}

export interface SubPartsConfig {
  enabled: boolean;
  format: string;
}

export interface FormState {
  subject: string;
  syllabus: string;
  exam_pattern: string;
  pattern_type: string;
  total_marks: number;
  duration_minutes: number;
  difficulty_distribution: DifficultyDistribution;
  num_questions: number;
  organization_name: string;
  semester: string;
  // Advanced Settings
  choice_based: ChoiceBasedConfig;
  sub_parts: SubPartsConfig;
  pyq_percentage: number;
  bloom_level: string;
  paper_type: string;
  question_type: string;
  // Custom Pattern (if selected)
  custom_sections: any[];
  // Derived from syllabus (auto-generated)
  units: ProcessedSyllabus[];
  topics: string[];
  keywords: string[];
}

export interface SubjectItem {
  id: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  credits: number;
  popularity: number;
}

export interface BloomLevelItem {
  value: string;
  label: string;
  description: string;
}

export interface OptionItem {
  value: string;
  label: string;
  description: string;
}

export interface QuickStatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
}

export interface ExamPatternItem {
  value: string;
  label: string;
  description: string;
  structure?: ExamPatternStructure;
}

export interface SyllabusTemplateItem {
  id: string;
  name: string;
  subject: string;
  content: string;
}
