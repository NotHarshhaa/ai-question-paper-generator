"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  Clock,
  BookOpen,
  GraduationCap,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  FileCode,
  KeyRound,
  Layers,
  Award,
  Send,
  HelpCircle,
  X,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  api,
  type GeneratedPaper,
  type Question,
  type SolutionItem,
  type AnswerEvaluationResponse,
  type MCQQuestion,
} from "@/lib/api";

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const bloomColors: Record<string, string> = {
  Remember: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Understand: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Apply: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Analyze: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Evaluate: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Create: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

export default function PaperViewPage() {
  const params = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  // AI Evaluator Modal State
  const [gradingQuestion, setGradingQuestion] = useState<Question | null>(null);
  const [studentAnswerText, setStudentAnswerText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<AnswerEvaluationResponse | null>(null);

  // MCQ Practice State
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);
  const [loadingMcqs, setLoadingMcqs] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await api.getPaper(params.id as string);
        setPaper(data);
      } catch {
        toast.error("Failed to load paper");
        router.push("/history");
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [params.id, router]);

  const loadSolutions = async () => {
    if (solutions.length > 0 || !paper) return;
    setLoadingSolutions(true);
    try {
      const res = await api.getPaperSolutions(paper.id);
      setSolutions(res.solutions);
    } catch {
      toast.error("Failed to load solution hints");
    } finally {
      setLoadingSolutions(false);
    }
  };

  const loadMcqs = async () => {
    if (mcqs.length > 0 || !paper) return;
    setLoadingMcqs(true);
    try {
      const res = await api.generateMCQs({ subject: paper.subject, count: 5 });
      setMcqs(res.mcqs);
    } catch {
      toast.error("Failed to generate practice MCQs");
    } finally {
      setLoadingMcqs(false);
    }
  };

  const handleEvaluateSubmit = async () => {
    if (!gradingQuestion || !studentAnswerText.trim()) {
      toast.error("Please write an answer to evaluate");
      return;
    }
    setIsEvaluating(true);
    setEvalResult(null);
    try {
      const matchedSol = solutions.find((s) => s.question_id === gradingQuestion.id);
      const res = await api.evaluateAnswer({
        question: gradingQuestion.text,
        model_answer: matchedSol?.solution || "",
        student_answer: studentAnswerText,
        max_marks: gradingQuestion.marks,
      });
      setEvalResult(res);
      toast.success("AI Evaluation complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to evaluate answer");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExportPdf = async () => {
    if (!paper) return;
    setExporting(true);
    try {
      const blob = await api.exportPdf(paper.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paper.subject.replace(/\s+/g, "_")}_Question_Paper.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!paper) return;
    let md = `# ${paper.organization_name ? `${paper.organization_name}\n` : ""}${paper.subject}\n`;
    if (paper.semester) md += `**Semester:** ${paper.semester}\n`;
    md += `**Total Marks:** ${paper.total_marks} | **Duration:** ${paper.duration_minutes} Minutes\n\n---\n\n`;

    paper.sections.forEach((sec) => {
      md += `## ${sec.name} (${sec.total_marks} Marks)\n`;
      if (sec.instructions) md += `*${sec.instructions}*\n\n`;
      sec.questions.forEach((q, qi) => {
        md += `${qi + 1}. **[${q.marks}M - ${q.difficulty.toUpperCase()} | Bloom: ${q.bloom_level || "Understand"}]** ${q.text}\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paper.subject.replace(/\s+/g, "_")}_Paper.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown file exported!");
  };

  const handleCopyText = () => {
    if (!paper) return;
    let text = `${paper.subject} Examination\nTotal Marks: ${paper.total_marks} | Duration: ${paper.duration_minutes} Mins\n\n`;
    paper.sections.forEach((sec) => {
      text += `--- ${sec.name} (${sec.total_marks} Marks) ---\n`;
      sec.questions.forEach((q, i) => {
        text += `Q${i + 1}. (${q.marks}M - ${q.bloom_level || "Understand"}) ${q.text}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Paper copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveChanges = async () => {
    if (!paper) return;
    setIsSaving(true);
    try {
      await api.updatePaper(paper.id, paper);
      setIsEditing(false);
      toast.success("Paper changes saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save paper modifications");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => {
    if (!paper) return;
    const newSections = [...paper.sections];
    const section = { ...newSections[sectionIndex] };
    const newQuestions = [...section.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value,
    };
    section.questions = newQuestions;
    section.total_marks = newQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    newSections[sectionIndex] = section;

    const allQuestions = newSections.flatMap((s) => s.questions);
    const totalMarks = allQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    setPaper({
      ...paper,
      sections: newSections,
      questions: allQuestions,
      total_marks: totalMarks,
    });
  };

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!paper) return;
    const newSections = [...paper.sections];
    const section = { ...newSections[sectionIndex] };
    section.questions = section.questions.filter((_, idx) => idx !== questionIndex);
    section.total_marks = section.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    newSections[sectionIndex] = section;

    const allQuestions = newSections.flatMap((s) => s.questions);
    const totalMarks = allQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    setPaper({
      ...paper,
      sections: newSections,
      questions: allQuestions,
      total_marks: totalMarks,
    });
    toast.success("Question removed");
  };

  const handleAddQuestion = (sectionIndex: number) => {
    if (!paper) return;
    const newSections = [...paper.sections];
    const section = { ...newSections[sectionIndex] };
    const newQ: Question = {
      id: `custom-${Date.now()}`,
      text: "Describe the architectural best practices and implementation details for this component.",
      marks: 5,
      difficulty: "medium",
      unit: `Unit ${sectionIndex + 1}`,
      topic: paper.subject,
      question_type: "descriptive",
      bloom_level: "Apply",
    };
    section.questions.push(newQ);
    section.total_marks += newQ.marks;
    newSections[sectionIndex] = section;

    const allQuestions = newSections.flatMap((s) => s.questions);
    const totalMarks = allQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    setPaper({
      ...paper,
      sections: newSections,
      questions: allQuestions,
      total_marks: totalMarks,
    });
    toast.success("New question added to section");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paper) return null;

  const easyCount = paper.questions.filter((q) => q.difficulty === "easy").length;
  const mediumCount = paper.questions.filter((q) => q.difficulty === "medium").length;
  const hardCount = paper.questions.filter((q) => q.difficulty === "hard").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{paper.subject}</h1>
              {isEditing && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Editing Mode
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              Generated on{" "}
              {new Date(paper.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="gap-1.5"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5"
              >
                <Edit3 className="h-4 w-4 text-primary" />
                Edit Paper
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                className="gap-1.5"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMarkdown}
                className="gap-1.5"
                title="Download Markdown"
              >
                <FileCode className="h-4 w-4 text-indigo-500" />
                MD
              </Button>
              <Button
                onClick={handleExportPdf}
                disabled={exporting}
                size="sm"
                className="gap-1.5 shadow-sm"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <GraduationCap className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{paper.total_marks}</p>
            <p className="text-xs text-muted-foreground">Total Marks</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold">{paper.duration_minutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">{paper.questions.length}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
            <p className="text-2xl font-bold">{paper.sections.length}</p>
            <p className="text-xs text-muted-foreground">Sections</p>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground font-medium mr-1">Difficulty Distribution:</span>
        <Badge variant="outline" className={difficultyColors.easy}>
          Easy: {easyCount}
        </Badge>
        <Badge variant="outline" className={difficultyColors.medium}>
          Medium: {mediumCount}
        </Badge>
        <Badge variant="outline" className={difficultyColors.hard}>
          Hard: {hardCount}
        </Badge>
      </div>

      {/* Main Paper Tabs */}
      <Tabs
        defaultValue="formatted"
        className="w-full"
        onValueChange={(val) => {
          if (val === "solutions") loadSolutions();
          if (val === "mcq") loadMcqs();
        }}
      >
        <TabsList className="grid grid-cols-4 md:w-[560px]">
          <TabsTrigger value="formatted" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Exam Paper
          </TabsTrigger>
          <TabsTrigger value="solutions" className="gap-1.5 text-xs">
            <KeyRound className="h-3.5 w-3.5 text-amber-500" /> Solution Key
          </TabsTrigger>
          <TabsTrigger value="mcq" className="gap-1.5 text-xs">
            <BrainCircuit className="h-3.5 w-3.5 text-indigo-500" /> Practice MCQs
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5 text-primary" /> Syllabus
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Formatted Exam Paper */}
        <TabsContent value="formatted" className="pt-2">
          <Card className="border shadow-md">
            <CardHeader className="text-center border-b pb-6 space-y-2">
              {isEditing ? (
                <div className="space-y-3 max-w-md mx-auto">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Organization / University Name</label>
                    <Input
                      value={paper.organization_name || ""}
                      onChange={(e) => setPaper({ ...paper, organization_name: e.target.value })}
                      placeholder="e.g. AWS Certification Academy / University"
                      className="text-center font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Subject Title</label>
                    <Input
                      value={paper.subject}
                      onChange={(e) => setPaper({ ...paper, subject: e.target.value })}
                      className="text-center font-bold text-lg"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {paper.organization_name && (
                    <p className="text-base font-semibold tracking-wide uppercase text-muted-foreground">
                      {paper.organization_name}
                    </p>
                  )}
                  <CardTitle className="text-2xl font-bold">{paper.subject}</CardTitle>
                  {paper.semester && (
                    <p className="text-sm text-muted-foreground">{paper.semester}</p>
                  )}
                </>
              )}

              <div className="flex justify-center items-center gap-6 text-xs text-muted-foreground pt-2">
                <span>
                  <strong>Total Marks:</strong> {paper.total_marks}
                </span>
                <span>•</span>
                <span>
                  <strong>Duration:</strong> {paper.duration_minutes} min
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {paper.sections.map((section, si) => (
                <div key={si} className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h3 className="font-bold text-lg">{section.name}</h3>
                      {section.instructions && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          {section.instructions}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {section.total_marks} Marks
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {section.questions.map((q, qi) => {
                      const bloomTag = q.bloom_level || "Understand";
                      const bloomStyle = bloomColors[bloomTag] || bloomColors.Understand;

                      return (
                        <div
                          key={`sec-${si}-q-${qi}-${q.id}`}
                          className={`p-4 rounded-xl border transition-all ${
                            isEditing
                              ? "bg-background border-primary/40 space-y-3"
                              : "bg-muted/30 hover:bg-muted/50"
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-bold text-sm text-primary">Q{qi + 1}.</span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">Marks:</span>
                                    <Input
                                      type="number"
                                      value={q.marks}
                                      onChange={(e) =>
                                        handleUpdateQuestion(si, qi, "marks", parseInt(e.target.value) || 0)
                                      }
                                      className="w-16 h-8 text-xs font-semibold text-center"
                                    />
                                  </div>
                                  <Select
                                    value={q.difficulty}
                                    onValueChange={(val) =>
                                      handleUpdateQuestion(si, qi, "difficulty", val)
                                    }
                                  >
                                    <SelectTrigger className="w-24 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="easy">Easy</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteQuestion(si, qi)}
                                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <Textarea
                                value={q.text}
                                onChange={(e) => handleUpdateQuestion(si, qi, "text", e.target.value)}
                                rows={2}
                                className="text-sm font-medium"
                              />
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="font-bold text-muted-foreground text-sm shrink-0 mt-0.5">
                                  Q{qi + 1}.
                                </span>
                                <div className="space-y-2.5 flex-1">
                                  <p className="text-sm md:text-base font-medium leading-relaxed">
                                    {q.text}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                        difficultyColors[q.difficulty] || difficultyColors.medium
                                      }`}
                                    >
                                      {q.difficulty.toUpperCase()}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${bloomStyle}`}
                                    >
                                      Bloom: {bloomTag}
                                    </span>
                                    {q.unit && (
                                      <Badge variant="outline" className="text-[11px]">
                                        {q.unit}
                                      </Badge>
                                    )}
                                    {q.topic && q.topic !== paper.subject && (
                                      <Badge variant="secondary" className="text-[11px]">
                                        {q.topic}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <Badge variant="outline" className="font-bold text-xs">
                                  {q.marks} Marks
                                </Badge>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 text-[11px] gap-1 px-2 text-primary font-medium"
                                  onClick={() => {
                                    setGradingQuestion(q);
                                    setStudentAnswerText("");
                                    setEvalResult(null);
                                  }}
                                >
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                  Test Answer
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddQuestion(si)}
                      className="w-full border-dashed gap-1.5 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Question to {section.name}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Teacher Solution Key Mode */}
        <TabsContent value="solutions" className="pt-2 space-y-4">
          <Card className="border shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-amber-500" />
                    Teacher Solution Key &amp; Marking Criteria
                  </CardTitle>
                  <CardDescription>
                    Standard model answers, architectural explanations, and marking rubrics for instructors.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {paper.questions.length} Questions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSolutions ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating comprehensive model solutions...</p>
                </div>
              ) : solutions.length === 0 ? (
                <div className="space-y-4">
                  {paper.questions.map((q, i) => (
                    <div key={q.id || i} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-sm">
                          Q{i + 1}. {q.text}
                        </div>
                        <Badge variant="outline">{q.marks} Marks</Badge>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-3 border text-xs space-y-2">
                        <div className="font-semibold text-primary">Model Solution / Key Points:</div>
                        <p className="text-muted-foreground leading-relaxed">
                          • Define and clarify the primary concepts regarding {q.topic || paper.subject}.<br />
                          • Explain the operational mechanism, architecture, and relevant CLI parameters/configurations.<br />
                          • Mention real-world production considerations (high availability, security, cost optimization).
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {solutions.map((sol, i) => (
                    <div key={sol.question_id || i} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-sm">
                          Q{i + 1}. {sol.text}
                        </div>
                        <Badge variant="outline">{sol.marks} Marks</Badge>
                      </div>
                      <div className="rounded-lg bg-background p-4 border text-xs md:text-sm space-y-2">
                        <div className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" /> Model Answer:
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {sol.solution}
                        </p>
                        {sol.key_points && sol.key_points.length > 0 && (
                          <div className="pt-2 border-t mt-2">
                            <div className="font-semibold text-[11px] text-muted-foreground mb-1">
                              Grading Criteria:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                              {sol.key_points.map((pt, pti) => (
                                <li key={pti}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Practice MCQs Mode */}
        <TabsContent value="mcq" className="pt-2 space-y-4">
          <Card className="border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-indigo-500" />
                  Certification Practice MCQs
                </CardTitle>
                <CardDescription>
                  AI-generated multiple choice questions with realistic distractors and explanations.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={loadMcqs} disabled={loadingMcqs} className="text-xs">
                {loadingMcqs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Regenerate MCQs"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingMcqs ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Synthesizing smart MCQs with distractors...</p>
                </div>
              ) : mcqs.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <BrainCircuit className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Click below to generate certification-style MCQs for {paper.subject}.</p>
                  <Button onClick={loadMcqs} size="sm">Generate Practice MCQs</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {mcqs.map((mcq, mi) => {
                    const selectedIdx = selectedAnswers[mcq.id];
                    const isAnswered = selectedIdx !== undefined;

                    return (
                      <div key={mcq.id || mi} className="p-4 rounded-xl border bg-card space-y-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm md:text-base">
                            {mi + 1}. {mcq.question}
                          </h4>
                          <Badge variant="outline" className="text-xs shrink-0">{mcq.marks}M</Badge>
                        </div>

                        <div className="grid gap-2 pt-1">
                          {mcq.options.map((opt, oi) => {
                            const isCorrect = oi === mcq.correct_option_index;
                            const isSelected = selectedIdx === oi;

                            let optStyle = "border-muted bg-muted/20 hover:bg-muted/50";
                            if (isAnswered) {
                              if (isCorrect) optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                              else if (isSelected) optStyle = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                            }

                            return (
                              <button
                                key={oi}
                                disabled={isAnswered}
                                onClick={() => setSelectedAnswers({ ...selectedAnswers, [mcq.id]: oi })}
                                className={`text-left p-3 rounded-lg border text-xs md:text-sm flex items-start gap-2.5 transition-all ${optStyle}`}
                              >
                                <span className="font-bold opacity-70">
                                  {String.fromCharCode(65 + oi)}.
                                </span>
                                <span className="flex-1">{opt}</span>
                                {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                                {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="rounded-lg bg-muted/60 p-3 border text-xs space-y-1 animate-in fade-in-50">
                            <div className="font-semibold text-primary flex items-center gap-1">
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Explanation:
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {mcq.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Syllabus Topics */}
        <TabsContent value="topics" className="pt-2">
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Extracted Syllabus Topics
              </CardTitle>
              <CardDescription>
                Core concepts and keywords analyzed from the input syllabus during AI generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {paper.syllabus_topics.map((topic, i) => (
                  <Badge key={i} variant="secondary" className="text-xs py-1 px-3">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Answer Evaluation Modal Dialog */}
      {gradingQuestion && (
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
                onClick={() => setGradingQuestion(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Question Context */}
              <div className="p-3 rounded-lg bg-muted/50 border text-sm space-y-1">
                <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Question ({gradingQuestion.marks} Marks):
                </div>
                <p className="font-medium text-foreground">{gradingQuestion.text}</p>
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
