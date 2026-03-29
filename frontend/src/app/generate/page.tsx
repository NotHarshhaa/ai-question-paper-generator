"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Brain,
  BookOpen,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { api, type GenerateRequest } from "@/lib/api";

const subjects = [
  "Computer Architecture and Parallel Processing",
  "Computer Networks",
  "Software Engineering",
  "Operating Systems",
  "Java and .NET and C#",
  "Data Structures",
  "Database Systems",
  "Artificial Intelligence",
  "Web Development",
  "IoT and Cloud Computing",
  "Linux and Shell Scripts",
  "Network Security",
  "Wireless Networks",
  "Python Programming",
  "R Programming",
  "Machine Learning",
  "Big Data Analytics",
  "Data Mining and Date Warehousing",
];

const examPatterns = [
  { value: "standard", label: "Standard (Q1-Q9)" },
  { value: "choice", label: "With Internal Choice" },
  { value: "sections", label: "Section-wise (A, B, C)" },
];

export default function GeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [form, setForm] = useState<GenerateRequest>({
    subject: "",
    syllabus: "",
    exam_pattern: "standard",
    total_marks: 80,
    duration_minutes: 180,
    difficulty_distribution: { easy: 30, medium: 40, hard: 30 },
    num_questions: 9,
    university_name: "",
    semester: "",
  });

  const updateForm = (updates: Partial<GenerateRequest>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const updateDifficulty = (key: "easy" | "medium" | "hard", value: number) => {
    setForm((prev) => ({
      ...prev,
      difficulty_distribution: {
        ...prev.difficulty_distribution,
        [key]: value,
      },
    }));
  };

  const totalDifficulty =
    form.difficulty_distribution.easy +
    form.difficulty_distribution.medium +
    form.difficulty_distribution.hard;

  const canProceedStep1 = form.subject.length > 0;
  const canProceedStep2 = form.syllabus.trim().length > 10;
  const canSubmit = totalDifficulty === 100;

  const handleGenerate = async () => {
    if (!canSubmit) {
      toast.error("Difficulty distribution must add up to 100%");
      return;
    }
    setLoading(true);
    setProgressValue(0);

    const interval = setInterval(() => {
      setProgressValue((prev) => Math.min(prev + Math.random() * 10, 85));
    }, 800);

    try {
      const paper = await api.generatePaper(form);
      setProgressValue(100);
      clearInterval(interval);
      toast.success("Question paper generated successfully!");
      router.push(`/paper/${paper.id}`);
    } catch (err: unknown) {
      clearInterval(interval);
      setProgressValue(0);
      const message = err instanceof Error ? err.message : "Failed to generate paper";
      toast.error(message, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="h-8 w-8" />
          Generate Question Paper
        </h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details below to generate an AI-powered question paper.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              {s === 1 ? "Subject" : s === 2 ? "Syllabus" : "Settings"}
            </span>
            {s < 3 && <Separator className="flex-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Subject */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Subject &amp; Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="university">University Name</Label>
              <Input
                id="university"
                placeholder="e.g., Anna University"
                value={form.university_name}
                onChange={(e) =>
                  updateForm({ university_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                placeholder="e.g., 5th Semester"
                value={form.semester}
                onChange={(e) => updateForm({ semester: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={form.subject || undefined}
                onValueChange={(v) => updateForm({ subject: v as string })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Syllabus */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Enter Syllabus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="syllabus">
                Syllabus Content *{" "}
                <span className="text-muted-foreground font-normal">
                  (Paste your syllabus topics, unit-wise)
                </span>
              </Label>
              <Textarea
                id="syllabus"
                placeholder={`Unit 1: Introduction to Data Structures\n- Arrays, Linked Lists, Stacks, Queues\n\nUnit 2: Trees\n- Binary Trees, BST, AVL Trees\n\nUnit 3: Graphs\n- BFS, DFS, Shortest Path Algorithms`}
                rows={12}
                value={form.syllabus}
                onChange={(e) => updateForm({ syllabus: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {form.syllabus.length} characters entered (minimum 10 required)
              </p>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Settings */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Exam Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exam Pattern</Label>
                <Select
                  value={form.exam_pattern || undefined}
                  onValueChange={(v) => updateForm({ exam_pattern: v as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {examPatterns.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min={3}
                  max={30}
                  value={form.num_questions}
                  onChange={(e) =>
                    updateForm({ num_questions: parseInt(e.target.value) || 9 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min={10}
                  max={200}
                  value={form.total_marks}
                  onChange={(e) =>
                    updateForm({ total_marks: parseInt(e.target.value) || 80 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={30}
                  max={360}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    updateForm({
                      duration_minutes: parseInt(e.target.value) || 180,
                    })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Difficulty Distribution</Label>
                <Badge
                  variant={totalDifficulty === 100 ? "default" : "destructive"}
                >
                  Total: {totalDifficulty}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-600">Easy (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.difficulty_distribution.easy}
                    onChange={(e) =>
                      updateDifficulty("easy", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-yellow-600">Medium (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.difficulty_distribution.medium}
                    onChange={(e) =>
                      updateDifficulty("medium", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-600">Hard (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.difficulty_distribution.hard}
                    onChange={(e) =>
                      updateDifficulty("hard", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progressValue < 20
                      ? "Connecting to AI backend..."
                      : progressValue < 50
                      ? "Loading AI models (may take a minute on first run)..."
                      : progressValue < 80
                      ? "Generating questions from syllabus..."
                      : "Structuring paper..."}
                  </span>
                  <span className="font-medium">
                    {Math.round(progressValue)}%
                  </span>
                </div>
                <Progress value={progressValue} />
                {progressValue > 5 && progressValue < 90 && (
                  <p className="text-xs text-muted-foreground">
                    This may take 1–3 minutes while AI models load. Please keep this tab open.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="gap-2"
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading || !canSubmit}
                className="gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Generate Paper
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
