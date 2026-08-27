import React from "react";
import { Sparkles, X, Loader2, Send, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { QuestionBankItem, AnswerEvaluationResponse } from "../types";

interface AiEvalModalProps {
  item: QuestionBankItem;
  studentAnswerText: string;
  isEvaluating: boolean;
  evalResult: AnswerEvaluationResponse | null;
  onStudentAnswerChange: (val: string) => void;
  onEvaluate: () => void;
  onClose: () => void;
}

export const AiEvalModal: React.FC<AiEvalModalProps> = ({
  item,
  studentAnswerText,
  isEvaluating,
  evalResult,
  onStudentAnswerChange,
  onEvaluate,
  onClose,
}) => {
  return (
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
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Question Context */}
          <div className="p-3 rounded-lg bg-muted/50 border text-sm space-y-1">
            <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Question ({item.subject} - {item.marks} Marks):
            </div>
            <p className="font-medium text-foreground">{item.text}</p>
          </div>

          {/* Student Answer Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Your Answer:
            </label>
            <Textarea
              value={studentAnswerText}
              onChange={(e) => onStudentAnswerChange(e.target.value)}
              placeholder="Type or paste your technical answer here to receive instant AI score and feedback..."
              rows={5}
              className="text-sm"
            />
          </div>

          <Button
            onClick={onEvaluate}
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
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      >
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
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[11px] bg-rose-500/10 text-rose-600 border-rose-500/20"
                      >
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
  );
};
