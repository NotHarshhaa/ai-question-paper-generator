import React from "react";
import { Sparkles, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GeneratedPaper, Question } from "@/lib/api";
import { difficultyColors, bloomColors } from "../constants";

interface PaperExamTabProps {
  paper: GeneratedPaper;
  isEditing: boolean;
  onPaperChange: (paper: GeneratedPaper) => void;
  onUpdateQuestion: (
    sectionIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => void;
  onDeleteQuestion: (sectionIndex: number, questionIndex: number) => void;
  onAddQuestion: (sectionIndex: number) => void;
  onTestAnswer: (q: Question) => void;
}

export const PaperExamTab: React.FC<PaperExamTabProps> = ({
  paper,
  isEditing,
  onPaperChange,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onTestAnswer,
}) => {
  return (
    <Card className="border shadow-md">
      <CardHeader className="text-center border-b pb-6 space-y-2">
        {isEditing ? (
          <div className="space-y-3 max-w-md mx-auto">
            <div>
              <label className="text-xs text-muted-foreground font-medium">
                Organization / University Name
              </label>
              <Input
                value={paper.organization_name || ""}
                onChange={(e) =>
                  onPaperChange({ ...paper, organization_name: e.target.value })
                }
                placeholder="e.g. AWS Certification Academy / University"
                className="text-center font-semibold"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">
                Subject Title
              </label>
              <Input
                value={paper.subject}
                onChange={(e) => onPaperChange({ ...paper, subject: e.target.value })}
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
                                  onUpdateQuestion(
                                    si,
                                    qi,
                                    "marks",
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-16 h-8 text-xs font-semibold text-center"
                              />
                            </div>
                            <Select
                              value={q.difficulty}
                              onValueChange={(val) =>
                                onUpdateQuestion(si, qi, "difficulty", val)
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
                              onClick={() => onDeleteQuestion(si, qi)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={q.text}
                          onChange={(e) =>
                            onUpdateQuestion(si, qi, "text", e.target.value)
                          }
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
                            onClick={() => onTestAnswer(q)}
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
                onClick={() => onAddQuestion(si)}
                className="w-full border-dashed gap-1.5 text-xs text-muted-foreground hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Add Question to {section.name}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
