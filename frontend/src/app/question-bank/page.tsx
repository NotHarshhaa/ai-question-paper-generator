"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  api,
  type QuestionBankItem,
  type QuestionBankResponse,
  type AnswerEvaluationResponse,
} from "@/lib/api";
import {
  QuestionBankHero,
  QuestionFilters,
  QuestionGrid,
  AiEvalModal,
} from "./components";

export default function QuestionBankPage() {
  const [data, setData] = useState<QuestionBankResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [questionType, setQuestionType] = useState("All");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // AI Grader Modal State
  const [gradingItem, setGradingItem] = useState<QuestionBankItem | null>(null);
  const [studentAnswerText, setStudentAnswerText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<AnswerEvaluationResponse | null>(null);

  const fetchQuestions = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await api.getQuestionBank({
        subject: subject === "All" ? undefined : subject,
        difficulty: difficulty === "All" ? undefined : difficulty,
        type: questionType === "All" ? undefined : questionType,
        search: search.trim() || undefined,
        page: targetPage,
        limit: 12,
      });
      setData(res);
      setPage(res.page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load question bank";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(1);
  }, [subject, difficulty, questionType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSubject("All");
    setDifficulty("All");
    setQuestionType("All");
  };

  const handleCopy = (item: QuestionBankItem, type: "question" | "markdown") => {
    const text =
      type === "markdown"
        ? `### ${item.text}\n\n**Subject:** ${item.subject} | **Difficulty:** ${item.difficulty.toUpperCase()} | **Marks:** ${item.marks}M\n\n**Answer/Solution:**\n${item.answer || "Refer to core documentation."}`
        : item.text;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success(
      type === "markdown"
        ? "Copied question and answer in Markdown!"
        : "Copied question text!"
    );
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEvaluateSubmit = async () => {
    if (!gradingItem || !studentAnswerText.trim()) {
      toast.error("Please write an answer to evaluate");
      return;
    }
    setIsEvaluating(true);
    setEvalResult(null);
    try {
      const res = await api.evaluateAnswer({
        question: gradingItem.text,
        model_answer: gradingItem.answer,
        student_answer: studentAnswerText,
        max_marks: gradingItem.marks || 5,
      });
      setEvalResult(res);
      toast.success("AI Evaluation complete!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to evaluate answer";
      toast.error(message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Header */}
      <QuestionBankHero totalQuestions={data?.total} />

      {/* Search and Filters */}
      <QuestionFilters
        search={search}
        subject={subject}
        difficulty={difficulty}
        questionType={questionType}
        onSearchChange={setSearch}
        onSubjectChange={(val) => {
          setSubject(val);
          setPage(1);
        }}
        onDifficultyChange={(val) => {
          setDifficulty(val);
          setPage(1);
        }}
        onQuestionTypeChange={(val) => {
          setQuestionType(val);
          setPage(1);
        }}
        onSearchSubmit={handleSearchSubmit}
        onResetFilters={handleResetFilters}
      />

      {/* Question Cards Grid & Pagination */}
      <QuestionGrid
        loading={loading}
        data={data}
        expandedId={expandedId}
        copiedId={copiedId}
        onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
        onCopy={handleCopy}
        onTestAI={(item) => {
          setGradingItem(item);
          setStudentAnswerText("");
          setEvalResult(null);
        }}
        onPageChange={fetchQuestions}
        onResetFilters={handleResetFilters}
      />

      {/* AI Evaluation Modal */}
      {gradingItem && (
        <AiEvalModal
          item={gradingItem}
          studentAnswerText={studentAnswerText}
          isEvaluating={isEvaluating}
          evalResult={evalResult}
          onStudentAnswerChange={setStudentAnswerText}
          onEvaluate={handleEvaluateSubmit}
          onClose={() => setGradingItem(null)}
        />
      )}
    </div>
  );
}
