import React from "react";
import { BrainCircuit, Loader2, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedPaper, MCQQuestion } from "@/lib/api";

interface PaperMcqTabProps {
  paper: GeneratedPaper;
  mcqs: MCQQuestion[];
  loadingMcqs: boolean;
  selectedAnswers: Record<string, number>;
  onSelectAnswer: (mcqId: string, optionIndex: number) => void;
  onLoadMcqs: () => void;
}

export const PaperMcqTab: React.FC<PaperMcqTabProps> = ({
  paper,
  mcqs,
  loadingMcqs,
  selectedAnswers,
  onSelectAnswer,
  onLoadMcqs,
}) => {
  return (
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
        <Button
          size="sm"
          variant="outline"
          onClick={onLoadMcqs}
          disabled={loadingMcqs}
          className="text-xs"
        >
          {loadingMcqs ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Regenerate MCQs"
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingMcqs ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Synthesizing smart MCQs with distractors...
            </p>
          </div>
        ) : mcqs.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <BrainCircuit className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Click below to generate certification-style MCQs for {paper.subject}.
            </p>
            <Button onClick={onLoadMcqs} size="sm">
              Generate Practice MCQs
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {mcqs.map((mcq, mi) => {
              const selectedIdx = selectedAnswers[mcq.id];
              const isAnswered = selectedIdx !== undefined;

              return (
                <div
                  key={mcq.id || mi}
                  className="p-4 rounded-xl border bg-card space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm md:text-base">
                      {mi + 1}. {mcq.question}
                    </h4>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {mcq.marks}M
                    </Badge>
                  </div>

                  <div className="grid gap-2 pt-1">
                    {mcq.options.map((opt, oi) => {
                      const isCorrect = oi === mcq.correct_option_index;
                      const isSelected = selectedIdx === oi;

                      let optStyle = "border-muted bg-muted/20 hover:bg-muted/50";
                      if (isAnswered) {
                        if (isCorrect)
                          optStyle =
                            "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                        else if (isSelected)
                          optStyle =
                            "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                      }

                      return (
                        <button
                          key={oi}
                          disabled={isAnswered}
                          onClick={() => onSelectAnswer(mcq.id, oi)}
                          className={`text-left p-3 rounded-lg border text-xs md:text-sm flex items-start gap-2.5 transition-all ${optStyle}`}
                        >
                          <span className="font-bold opacity-70">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isAnswered && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          )}
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
  );
};
