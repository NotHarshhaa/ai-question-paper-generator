import React from "react";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { examPatterns } from "../constants";
import { FormState } from "../types";

interface StepPatternProps {
  form: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepPattern: React.FC<StepPatternProps> = ({
  form,
  updateForm,
  onNext,
  onBack,
}) => {
  const canProceed = form.exam_pattern.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Exam Pattern Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern Type Selection */}
        <div className="space-y-4">
          <Label>Choose Exam Pattern</Label>
          <div className="grid gap-3">
            {examPatterns.map((pattern) => (
              <Card
                key={pattern.value}
                className={`cursor-pointer transition-all duration-200 ${
                  form.pattern_type === pattern.value
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() =>
                  updateForm({
                    pattern_type: pattern.value,
                    exam_pattern: pattern.value,
                  })
                }
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{pattern.label}</h4>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      {form.pattern_type === pattern.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  {pattern.value === "certification" && (
                    <div className="bg-muted/50 rounded p-3">
                      <h5 className="text-xs font-semibold mb-2">Certification Exam Pattern Structure:</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">Short Questions:</span>
                          <span>5 questions × 2 marks = 10 marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Long Questions:</span>
                          <span>8 questions × 15 marks = 60 marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">70 marks</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>• Attempt 1 question per domain (4 domains)</p>
                          <p>• Short questions: Generate 7, attempt any 5</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {pattern.value === "custom" && (
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-xs text-muted-foreground">
                        Design your own paper structure with custom sections, marks distribution, and question types.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={onNext} disabled={!canProceed} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
