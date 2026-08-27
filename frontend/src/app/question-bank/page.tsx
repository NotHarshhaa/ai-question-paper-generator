"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Database,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  Loader2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Zap,
  Send,
  X,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  api,
  type QuestionBankItem,
  type QuestionBankResponse,
  type AnswerEvaluationResponse,
} from "@/lib/api";

const SUBJECTS_LIST = [
  "All",
  "AWS",
  "Terraform",
  "Docker",
  "Kubernetes",
  "Linux",
  "Jenkins",
  "Ansible",
  "Git",
  "CI/CD",
  "Python",
  "Microservices",
];

const DIFFICULTY_MAP: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  hard: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
};

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
    } catch (err: any) {
      toast.error(err.message || "Failed to load question bank");
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

  const handleCopy = (item: QuestionBankItem, type: "question" | "markdown") => {
    const text =
      type === "markdown"
        ? `### ${item.text}\n\n**Subject:** ${item.subject} | **Difficulty:** ${item.difficulty.toUpperCase()} | **Marks:** ${item.marks}M\n\n**Answer/Solution:**\n${item.answer || "Refer to core documentation."}`
        : item.text;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success(type === "markdown" ? "Copied question and answer in Markdown!" : "Copied question text!");
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
    } catch (err: any) {
      toast.error(err.message || "Failed to evaluate answer");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/80 text-xs font-medium text-primary">
              <Database className="h-3.5 w-3.5" />
              DevOps &amp; AWS PYQ Repository
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Interactive Question Bank &amp; AI Grader
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Search, filter, and practice 2,500+ verified previous year questions with model solutions and live AI answer evaluation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 self-stretch md:self-auto bg-background/80 backdrop-blur border rounded-xl p-4 shadow-sm">
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-primary">{data?.total ?? "..."}</div>
              <div className="text-xs text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center px-2 border-x">
              <div className="text-2xl font-bold text-amber-500">15+</div>
              <div className="text-xs text-muted-foreground">Subject Areas</div>
            </div>
            <div className="text-center px-2">
              <div className="text-2xl font-bold text-emerald-500">100%</div>
              <div className="text-xs text-muted-foreground">AI Graded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="mb-8 border shadow-sm">
        <CardContent className="p-4 md:p-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keyword, concept, command, or topic..."
                className="pl-9"
              />
            </div>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>

          {/* Filter dropdowns & pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-1">
              <Filter className="h-3.5 w-3.5" />
              Filters:
            </div>

            {/* Subject Select */}
            <Select value={subject} onValueChange={(val) => { setSubject(val); setPage(1); }}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS_LIST.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Select */}
            <Select value={difficulty} onValueChange={(val) => { setDifficulty(val); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Question Type Select */}
            <Select value={questionType} onValueChange={(val) => { setQuestionType(val); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="short">Short Answer</SelectItem>
                <SelectItem value="long">Long Answer</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
              </SelectContent>
            </Select>

            {(subject !== "All" || difficulty !== "All" || questionType !== "All" || search) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setSubject("All");
                  setDifficulty("All");
                  setQuestionType("All");
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Fetching question bank entries...</p>
        </div>
      ) : data?.questions.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No questions found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              We couldn't find any questions matching your current search criteria. Try adjusting your search query or filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSubject("All");
                setDifficulty("All");
                setQuestionType("All");
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.questions.map((item) => {
              const diffStyle = DIFFICULTY_MAP[item.difficulty] || DIFFICULTY_MAP.medium;
              const isExpanded = expandedId === item.id;
              const isCopied = copiedId === item.id;

              return (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between border hover:border-primary/40 transition-all duration-200 shadow-sm"
                >
                  <CardHeader className="pb-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-semibold text-xs">
                          {item.subject}
                        </Badge>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}
                        >
                          {item.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {item.marks} Marks
                      </span>
                    </div>

                    <CardTitle className="text-base font-semibold leading-snug">
                      {item.text}
                    </CardTitle>

                    {item.topic && item.topic !== item.subject && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        <span>Topic: {item.topic}</span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {/* Collapsible Solution Box */}
                    {isExpanded && (
                      <div className="rounded-lg bg-muted/60 p-4 border text-sm space-y-2 animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                          Model Answer / Solution
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs md:text-sm">
                          {item.answer || "No detailed explanation recorded. Refer to standard documentation."}
                        </p>
                        {item.source_file && (
                          <div className="text-[11px] text-muted-foreground/75 pt-1 border-t">
                            Source: {item.source_file}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-medium"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" /> Hide Solution
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" /> View Solution
                            </>
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 text-xs gap-1 font-semibold text-primary"
                          onClick={() => {
                            setGradingItem(item);
                            setStudentAnswerText("");
                            setEvalResult(null);
                          }}
                        >
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Test with AI
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => handleCopy(item, "question")}
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleCopy(item, "markdown")}
                        >
                          <Zap className="h-3 w-3 text-amber-500" />
                          MD
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold">{data.page}</span> of{" "}
                <span className="font-semibold">{data.total_pages}</span> ({data.total} total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => fetchQuestions(data.page - 1)}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.total_pages}
                  onClick={() => fetchQuestions(data.page + 1)}
                  className="gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Answer Evaluation Modal Dialog */}
      {gradingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  AI Answer Evaluator &amp; Grader
                </CardTitle>
                <CardDescription className="text-xs">
                  Sentence-BERT Semantic Analysis &amp; Concept Rubric
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGradingItem(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Question Context */}
              <div className="p-3 rounded-lg bg-muted/50 border text-sm space-y-1">
                <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Question ({gradingItem.subject} - {gradingItem.marks} Marks):
                </div>
                <p className="font-medium text-foreground">{gradingItem.text}</p>
              </div>

              {/* Student Answer Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Your Answer:
                </label>
                <Textarea
                  value={studentAnswerText}
                  onChange={(e) => setStudentAnswerText(e.target.value)}
                  placeholder="Type or paste your technical answer here to receive instant AI score and feedback..."
                  rows={5}
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleEvaluateSubmit}
                disabled={isEvaluating || !studentAnswerText.trim()}
                className="w-full gap-2 shadow-sm"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Evaluating with Sentence-BERT...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Evaluate &amp; Grade with AI
                  </>
                )}
              </Button>

              {/* Evaluation Results Card */}
              {evalResult && (
                <div className="p-5 rounded-xl border bg-card space-y-4 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Calculated Score</div>
                      <div className="text-2xl font-extrabold text-primary">
                        {evalResult.score} / {evalResult.max_marks} Marks
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Grade:</span>
                      <Badge className="text-sm font-bold px-3 py-1 bg-primary text-primary-foreground">
                        {evalResult.grade} ({evalResult.percentage}%)
                      </Badge>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-muted/40 border space-y-1">
                      <div className="text-muted-foreground">Semantic Similarity:</div>
                      <div className="font-bold text-sm">{evalResult.semantic_similarity}%</div>
                      <Progress value={evalResult.semantic_similarity} className="h-1.5" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/40 border space-y-1">
                      <div className="text-muted-foreground">Concept Coverage:</div>
                      <div className="font-bold text-sm">{evalResult.concept_coverage}%</div>
                      <Progress value={evalResult.concept_coverage} className="h-1.5" />
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-primary">AI Evaluation Feedback:</div>
                    <p className="text-muted-foreground leading-relaxed">
                      {evalResult.feedback}
                    </p>
                  </div>

                  {/* Strengths & Missing Concepts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="space-y-1">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Covered Concepts:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {evalResult.strengths.map((st, i) => (
                          <Badge key={i} variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            {st}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-rose-600 dark:text-rose-400">
                        ⚠ Missing Key Points:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {evalResult.missing_points.map((mp, i) => (
                          <Badge key={i} variant="outline" className="text-[11px] bg-rose-500/10 text-rose-600 border-rose-500/20">
                            {mp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Improvement Tips */}
                  {evalResult.improvement_tips && evalResult.improvement_tips.length > 0 && (
                    <div className="rounded-lg bg-muted/60 p-3 border text-xs space-y-1">
                      <div className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5" /> Recommendations for Full Marks:
                      </div>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {evalResult.improvement_tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
