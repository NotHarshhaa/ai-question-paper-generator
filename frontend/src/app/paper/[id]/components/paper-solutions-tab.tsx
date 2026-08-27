import React from "react";
import { KeyRound, Sparkles, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedPaper, SolutionItem } from "@/lib/api";

interface PaperSolutionsTabProps {
  paper: GeneratedPaper;
  solutions: SolutionItem[];
  loadingSolutions: boolean;
}

export const PaperSolutionsTab: React.FC<PaperSolutionsTabProps> = ({
  paper,
  solutions,
  loadingSolutions,
}) => {
  return (
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
  );
};
