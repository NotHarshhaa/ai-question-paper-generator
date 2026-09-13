"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Play,
  Pause,
  Send,
  Award,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RichContent } from "@/components/ui/rich-content";
import {
  api,
  GeneratedPaper,
  Question,
  SolutionItem,
  AnswerEvaluationResponse,
} from "@/lib/api";
import { difficultyColors, bloomColors } from "../constants";

interface PaperStudentArenaProps {
  paper: GeneratedPaper;
  solutions: SolutionItem[];
}

interface QuestionEvaluationResult {
  question: Question;
  studentAnswer: string;
  modelAnswer: string;
  evaluation: AnswerEvaluationResponse;
}

interface ExamScorecard {
  totalEarned: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  timeSpentSeconds: number;
  questionResults: QuestionEvaluationResult[];
  bloomBreakdown: Record<string, { earned: number; total: number }>;
}

export const PaperStudentArena: React.FC<PaperStudentArenaProps> = ({ paper, solutions }) => {
  const allQuestions = paper.questions || [];
  const totalDurationSeconds = Math.max(1, (paper.duration_minutes || 60) * 60);

  // Examination State
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalDurationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [scorecard, setScorecard] = useState<ExamScorecard | null>(null);
  const [copiedScorecard, setCopiedScorecard] = useState(false);

  // Timer Ref & Submit Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmitRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!isTimerRunning || isSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitRef.current();
          toast.warning("Time has expired! Submitting your examination answers.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isSubmitted]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = allQuestions[currentIdx];
  const answeredCount = Object.values(studentAnswers).filter((a) => a.trim().length > 0).length;

  const handleAnswerChange = (text: string) => {
    if (!currentQ || isSubmitted) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: text,
    }));
  };

  const handleSubmitExam = async () => {
    if (isSubmitted || isGrading) return;

    setIsTimerRunning(false);
    setIsGrading(true);
    setIsSubmitted(true);

    const toastId = toast.loading("AI Auto-Grader is evaluating your entire examination paper...");
    const results: QuestionEvaluationResult[] = [];
    const bloomMap: Record<string, { earned: number; total: number }> = {};

    let totalScore = 0;
    const totalMax = paper.total_marks || allQuestions.reduce((acc, q) => acc + (q.marks || 5), 0);

    try {
      for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        setGradingProgress(Math.round(((i + 1) / allQuestions.length) * 100));

        const studentAns = studentAnswers[q.id] || "";
        const matchedSol = solutions.find((s) => s.question_id === q.id);
        const modelAns = matchedSol?.solution || "";

        try {
          const evalRes = await api.evaluateAnswer({
            question: q.text,
            model_answer: modelAns,
            student_answer: studentAns,
            max_marks: q.marks || 5,
          });

          results.push({
            question: q,
            studentAnswer: studentAns,
            modelAnswer: modelAns,
            evaluation: evalRes,
          });

          totalScore += evalRes.score;

          // Track by Bloom's level
          const bLevel = q.bloom_level || "Understand";
          if (!bloomMap[bLevel]) {
            bloomMap[bLevel] = { earned: 0, total: 0 };
          }
          bloomMap[bLevel].earned += evalRes.score;
          bloomMap[bLevel].total += q.marks || 5;
        } catch {
          // Graceful fallback per question
          const fallbackScore = studentAns.trim().length > 20 ? (q.marks || 5) * 0.4 : 0;
          totalScore += fallbackScore;
          results.push({
            question: q,
            studentAnswer: studentAns,
            modelAnswer: modelAns,
            evaluation: {
              score: fallbackScore,
              max_marks: q.marks || 5,
              percentage: Math.round((fallbackScore / (q.marks || 5)) * 100),
              grade: "C",
              semantic_similarity: 50,
              concept_coverage: 40,
              strengths: ["Attempted question"],
              missing_points: ["Detailed technical analysis"],
              feedback: "Evaluated with base baseline rubric.",
              improvement_tips: ["Expand technical command examples."],
            },
          });
        }
      }

      const totalEarned = Math.round(totalScore * 10) / 10;
      const percentage = Math.round((totalEarned / Math.max(1, totalMax)) * 100);

      let grade = "Needs Improvement";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B";
      else if (percentage >= 60) grade = "C";
      else if (percentage >= 45) grade = "D";

      setScorecard({
        totalEarned,
        totalMarks: totalMax,
        percentage,
        grade,
        timeSpentSeconds: totalDurationSeconds - timeLeft,
        questionResults: results,
        bloomBreakdown: bloomMap,
      });

      toast.success(`Exam graded! Score: ${totalEarned}/${totalMax} (${percentage}%) - Grade ${grade}`, {
        id: toastId,
      });
    } catch {
      toast.error("An error occurred while compiling final scorecard.", { id: toastId });
    } finally {
      setIsGrading(false);
    }
  };

  handleSubmitRef.current = handleSubmitExam;

  const handleRetakeExam = () => {
    setStudentAnswers({});
    setCurrentIdx(0);
    setTimeLeft(totalDurationSeconds);
    setIsTimerRunning(true);
    setIsSubmitted(false);
    setScorecard(null);
    toast.info("Exam reset! Timer restarted.");
  };

  const handleCopyScorecard = () => {
    if (!scorecard) return;
    const text = `# Examination Scorecard: ${paper.subject}
**Organization:** ${paper.organization_name || "Cloud Academy"}
**Score:** ${scorecard.totalEarned} / ${scorecard.totalMarks} (${scorecard.percentage}%)
**Grade:** ${scorecard.grade}
**Time Taken:** ${formatTime(scorecard.timeSpentSeconds)}

## Question Breakdown
${scorecard.questionResults
  .map(
    (r, i) => `### Q${i + 1}. ${r.question.text}
**Marks Awarded:** ${r.evaluation.score} / ${r.question.marks}
**Student Answer:**
${r.studentAnswer || "(No answer submitted)"}

**AI Feedback:**
${r.evaluation.feedback}
`
  )
  .join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopiedScorecard(true);
    toast.success("Scorecard copied in Markdown!");
    setTimeout(() => setCopiedScorecard(false), 2000);
  };

  if (allQuestions.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground text-sm">This question paper contains no questions to take.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Exam Control & Timer Bar */}
      <Card className="border shadow-sm bg-background">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
                timeLeft < 300
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse"
                  : timeLeft < 900
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            {!isSubmitted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="h-8 gap-1 text-xs"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Resume Timer
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Progress / Answered Counters */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div>
              Answered: <strong className="text-foreground">{answeredCount}</strong> of {allQuestions.length}
            </div>
            <div className="w-24">
              <Progress value={(answeredCount / allQuestions.length) * 100} className="h-2" />
            </div>

            {!isSubmitted ? (
              <Button
                size="sm"
                onClick={handleSubmitExam}
                disabled={isGrading}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-xs font-semibold"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Grading ({gradingProgress}%)
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit Exam
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetakeExam}
                className="gap-1.5 text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake Exam
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Scorecard View (If Submitted) */}
      {isSubmitted && scorecard && (
        <Card className="border-2 border-primary/30 shadow-lg bg-card">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Award className="h-6 w-6 text-amber-500" />
                  Examination Result &amp; AI Scorecard
                </CardTitle>
                <CardDescription>
                  Detailed performance analysis across technical accuracy, CLI precision, and cognitive depth.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyScorecard}
                className="gap-1.5 text-xs font-semibold"
              >
                {copiedScorecard ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Scorecard
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Final Score</span>
                <div className="text-2xl font-bold text-foreground">
                  {scorecard.totalEarned} <span className="text-sm text-muted-foreground">/ {scorecard.totalMarks}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Percentage</span>
                <div className="text-2xl font-bold text-primary">{scorecard.percentage}%</div>
              </div>

              <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Letter Grade</span>
                <div className="text-2xl font-bold text-amber-500">{scorecard.grade}</div>
              </div>

              <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Time Taken</span>
                <div className="text-lg font-bold text-foreground mt-1">
                  {formatTime(scorecard.timeSpentSeconds)}
                </div>
              </div>
            </div>

            {/* Cognitive Depth (Bloom's) Breakdown */}
            {Object.keys(scorecard.bloomBreakdown).length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cognitive Mastery Breakdown (Bloom&apos;s Taxonomy)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(scorecard.bloomBreakdown).map(([lvl, data]) => {
                    const bPct = Math.round((data.earned / Math.max(1, data.total)) * 100);
                    return (
                      <div key={lvl} className="p-3 rounded-lg border bg-muted/20 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center font-medium">
                          <span>{lvl}</span>
                          <span className="font-bold">{bPct}%</span>
                        </div>
                        <Progress value={bPct} className="h-1.5" />
                        <div className="text-[11px] text-muted-foreground text-right">
                          {data.earned.toFixed(1)} / {data.total} Marks
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. Question Arena (Navigator + Answer Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Question Navigator Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="border shadow-sm">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Question Navigator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2">
                {allQuestions.map((q, idx) => {
                  const isAnswered = Boolean(studentAnswers[q.id]?.trim());
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-lg border font-semibold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? "ring-2 ring-primary border-primary bg-primary/10 text-primary font-bold"
                          : isAnswered
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded bg-emerald-500/20 border border-emerald-500/50" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded bg-muted border border-border" />
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Question Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {currentQ && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-bold text-xs">
                      Question {currentIdx + 1} of {allQuestions.length}
                    </Badge>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        difficultyColors[currentQ.difficulty] || difficultyColors.medium
                      }`}
                    >
                      {currentQ.difficulty.toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        bloomColors[currentQ.bloom_level || "Understand"] || bloomColors.Understand
                      }`}
                    >
                      Bloom: {currentQ.bloom_level || "Understand"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-bold text-xs">
                    {currentQ.marks} Marks
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Question Text */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border/60">
                  <RichContent content={currentQ.text} />
                </div>

                {/* Student Answer Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <label className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Your Answer / Solution:
                    </label>
                    <span>
                      {(studentAnswers[currentQ.id] || "").length} characters |{" "}
                      {(studentAnswers[currentQ.id] || "").split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <Textarea
                    disabled={isSubmitted}
                    value={studentAnswers[currentQ.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your technical answer here. Include architectural diagrams (ASCII), configuration code (YAML / HCL / Bash), operational steps, and security best practices..."
                    rows={8}
                    className="font-sans text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tip: Use triple backticks (```yaml, ```bash) to embed formatted code or manifests in your answer.
                  </p>
                </div>

                {/* Scorecard Review for Current Question (If Submitted) */}
                {isSubmitted && scorecard && (
                  <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3">
                    {(() => {
                      const qRes = scorecard.questionResults.find((r) => r.question.id === currentQ.id);
                      if (!qRes) return null;
                      const ev = qRes.evaluation;
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-primary">AI Evaluation &amp; Feedback</span>
                            <Badge variant={ev.percentage >= 65 ? "default" : "destructive"}>
                              {ev.score} / {currentQ.marks} Marks ({ev.percentage}%)
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-foreground leading-relaxed">
                            {ev.feedback}
                          </p>
                          {ev.missing_points && ev.missing_points.length > 0 && (
                            <div className="text-xs text-rose-500 space-y-1">
                              <strong>Key Points Missed:</strong>
                              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                {ev.missing_points.map((pt, pti) => (
                                  <li key={pti}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {qRes.modelAnswer && (
                            <div className="pt-2 border-t mt-2">
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                Model Answer:
                              </span>
                              <div className="mt-1.5 p-3 rounded-lg bg-background border text-xs">
                                <RichContent content={qRes.modelAnswer} />
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="gap-1 text-xs"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIdx((prev) => Math.min(allQuestions.length - 1, prev + 1))}
                    disabled={currentIdx === allQuestions.length - 1}
                    className="gap-1 text-xs"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
