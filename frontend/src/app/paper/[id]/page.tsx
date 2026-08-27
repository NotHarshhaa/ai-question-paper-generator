"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText, KeyRound, BrainCircuit, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  api,
  type GeneratedPaper,
  type Question,
  type SolutionItem,
  type AnswerEvaluationResponse,
  type MCQQuestion,
} from "@/lib/api";
import {
  PaperHeader,
  PaperKpiCards,
  PaperExamTab,
  PaperSolutionsTab,
  PaperMcqTab,
  PaperTopicsTab,
  AiEvalModal,
} from "./components";
import {
  exportPaperPdf,
  exportPaperMarkdown,
  copyPaperPlainText,
} from "./utils/export-helpers";

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to evaluate answer";
      toast.error(message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!paper) return;
    setIsSaving(true);
    try {
      await api.updatePaper(paper.id, paper);
      setIsEditing(false);
      toast.success("Paper changes saved successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save paper modifications";
      toast.error(message);
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
    section.total_marks = newQuestions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );
    newSections[sectionIndex] = section;

    const allQuestions = newSections.flatMap((s) => s.questions);
    const totalMarks = allQuestions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );

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
    section.total_marks = section.questions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );
    newSections[sectionIndex] = section;

    const allQuestions = newSections.flatMap((s) => s.questions);
    const totalMarks = allQuestions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );

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
    const totalMarks = allQuestions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Top Action Bar */}
      <PaperHeader
        paper={paper}
        isEditing={isEditing}
        isSaving={isSaving}
        exporting={exporting}
        copied={copied}
        onEditToggle={setIsEditing}
        onSaveChanges={handleSaveChanges}
        onCopyText={() => copyPaperPlainText(paper, setCopied)}
        onExportMarkdown={() => exportPaperMarkdown(paper)}
        onExportPdf={() => exportPaperPdf(paper, setExporting)}
      />

      {/* KPI Info Cards */}
      <PaperKpiCards paper={paper} />

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
          <PaperExamTab
            paper={paper}
            isEditing={isEditing}
            onPaperChange={setPaper}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddQuestion={handleAddQuestion}
            onTestAnswer={(q) => {
              setGradingQuestion(q);
              setStudentAnswerText("");
              setEvalResult(null);
            }}
          />
        </TabsContent>

        {/* Tab 2: Teacher Solution Key Mode */}
        <TabsContent value="solutions" className="pt-2 space-y-4">
          <PaperSolutionsTab
            paper={paper}
            solutions={solutions}
            loadingSolutions={loadingSolutions}
          />
        </TabsContent>

        {/* Tab 3: Practice MCQs Mode */}
        <TabsContent value="mcq" className="pt-2 space-y-4">
          <PaperMcqTab
            paper={paper}
            mcqs={mcqs}
            loadingMcqs={loadingMcqs}
            selectedAnswers={selectedAnswers}
            onSelectAnswer={(mcqId, oi) =>
              setSelectedAnswers((prev) => ({ ...prev, [mcqId]: oi }))
            }
            onLoadMcqs={loadMcqs}
          />
        </TabsContent>

        {/* Tab 4: Syllabus Topics */}
        <TabsContent value="topics" className="pt-2">
          <PaperTopicsTab paper={paper} />
        </TabsContent>
      </Tabs>

      {/* AI Answer Evaluation Modal Dialog */}
      {gradingQuestion && (
        <AiEvalModal
          question={gradingQuestion}
          studentAnswerText={studentAnswerText}
          isEvaluating={isEvaluating}
          evalResult={evalResult}
          onStudentAnswerChange={setStudentAnswerText}
          onEvaluate={handleEvaluateSubmit}
          onClose={() => setGradingQuestion(null)}
        />
      )}
    </div>
  );
}
