import React from "react";
import { Sparkles, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FormState } from "../types";

interface StepReviewProps {
  form: FormState;
  loading: boolean;
  progressValue: number;
  canSubmit: boolean;
  onGenerate: () => void;
  onBack: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  form,
  loading,
  progressValue,
  canSubmit,
  onGenerate,
  onBack,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Question Paper
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review your settings and generate the AI-powered question paper
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Paper Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium">{form.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Marks:</span>
                <span className="font-medium">{form.total_marks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{form.duration_minutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pattern:</span>
                <span className="font-medium">{form.exam_pattern}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Syllabus Overview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units:</span>
                <span className="font-medium">{form.units.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Topics:</span>
                <span className="font-medium">{form.topics.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Keywords:</span>
                <span className="font-medium">{form.keywords.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium">
                  {form.difficulty_distribution.easy}% Easy / {form.difficulty_distribution.medium}% Medium / {form.difficulty_distribution.hard}% Hard
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Units Preview */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Units & Topics</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {form.units.map((unit, index) => (
              <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                <div className="font-medium text-xs mb-1">{unit.title}</div>
                <div className="text-xs text-muted-foreground">
                  {unit.topics.slice(0, 3).join(", ")}
                  {unit.topics.length > 3 && `... +${unit.topics.length - 3} more`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating paper...</span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="w-full" />
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={onGenerate}
            disabled={!canSubmit || loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Paper
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
