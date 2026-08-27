import React, { useState } from "react";
import {
  FileText,
  FolderOpen,
  Upload,
  FileSymlink,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { syllabusTemplates } from "../constants";
import { FormState, SyllabusTemplateItem } from "../types";
import { parseSyllabus } from "../utils/syllabus-parser";

interface StepSyllabusProps {
  form: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepSyllabus: React.FC<StepSyllabusProps> = ({
  form,
  updateForm,
  onNext,
  onBack,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const handleApplySyllabus = (content: string) => {
    const parsed = parseSyllabus(content);
    updateForm({
      syllabus: content,
      units: parsed.units,
      topics: parsed.topics,
      keywords: parsed.keywords,
    });
  };

  const handleTemplateSelect = (template: SyllabusTemplateItem) => {
    setSelectedTemplate(template.id);
    setShowTemplates(false);
    handleApplySyllabus(template.content);
    toast.success(`Template "${template.name}" applied successfully!`);
  };

  const handleSyllabusImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleApplySyllabus(content);
        toast.success("Syllabus imported successfully!");
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    updateForm({
      syllabus: "",
      units: [],
      topics: [],
      keywords: [],
    });
  };

  const handleCopy = () => {
    if (!form.syllabus) return;
    navigator.clipboard.writeText(form.syllabus);
    toast.success("Syllabus copied to clipboard!");
  };

  const canProceed = form.syllabus.trim().length > 10 && form.units.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Enter Syllabus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template and Import Options */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(!showTemplates)}
              className="gap-2 flex-1"
            >
              <FolderOpen className="h-4 w-4" />
              {showTemplates ? "Hide Templates" : "Use Template"}
            </Button>
            <div className="flex-1">
              <input
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={handleSyllabusImport}
                className="hidden"
                id="syllabus-import"
              />
              <Button variant="outline" asChild className="gap-2 w-full">
                <label
                  htmlFor="syllabus-import"
                  className="cursor-pointer flex items-center justify-center"
                >
                  <Upload className="h-4 w-4" />
                  Import File
                </label>
              </Button>
            </div>
          </div>

          {/* Template Selection */}
          {showTemplates && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm">Quick Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {syllabusTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTemplate === template.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-sm">{template.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {template.subject}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.content.split("\n").slice(0, 3).join(" ")}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Syllabus Input */}
        <div className="space-y-2">
          <Label htmlFor="syllabus">
            Syllabus Content *{" "}
            <span className="text-muted-foreground font-normal">
              (Paste your syllabus topics, unit-wise)
            </span>
          </Label>
          <Textarea
            id="syllabus"
            placeholder={`Unit 1: Introduction to AWS Cloud\n- Cloud Concepts, EC2, S3, IAM\n\nUnit 2: Containers & Orchestration\n- Docker, Kubernetes, ECS\n\nUnit 3: CI/CD & Infrastructure as Code\n- Jenkins Pipelines, Terraform, Ansible`}
            rows={12}
            value={form.syllabus}
            onChange={(e) => handleApplySyllabus(e.target.value)}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{form.syllabus.length} characters entered (minimum 10 required)</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="gap-1"
              >
                <FileSymlink className="h-3 w-3" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1"
              >
                <FileSymlink className="h-3 w-3" />
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Syllabus Analysis */}
        {form.units.length > 0 && (
          <div className="p-4 bg-muted border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Syllabus Analysis</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-primary font-medium">Units:</span>
                <span className="ml-1 text-foreground">{form.units.length}</span>
              </div>
              <div>
                <span className="text-primary font-medium">Topics:</span>
                <span className="ml-1 text-foreground">{form.topics.length}</span>
              </div>
              <div>
                <span className="text-primary font-medium">Keywords:</span>
                <span className="ml-1 text-foreground">{form.keywords.length}</span>
              </div>
              <div>
                <span className="text-primary font-medium">Complexity:</span>
                <span className="ml-1 text-foreground">
                  {form.syllabus.length > 500
                    ? "High"
                    : form.syllabus.length > 200
                    ? "Medium"
                    : "Low"}
                </span>
              </div>
            </div>

            {/* Units Breakdown */}
            <div className="mt-3 space-y-2">
              <h5 className="font-medium text-xs text-foreground">Detected Units:</h5>
              <div className="space-y-1">
                {form.units.map((unit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs bg-card p-2 rounded border"
                  >
                    <span className="font-medium text-foreground">{unit.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {unit.topics?.length || 0} topics
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
