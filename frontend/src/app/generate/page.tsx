"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Brain } from "lucide-react";
import { api } from "@/lib/api";
import {
  QuickStats,
  Stepper,
  StepSubject,
  StepSyllabus,
  StepPattern,
  StepSettings,
  StepReview,
} from "./components";
import { initialFormState, examPatterns } from "./constants";
import { FormState } from "./types";

export default function GeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [form, setForm] = useState<FormState>(initialFormState);

  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const totalDifficulty =
    form.difficulty_distribution.easy +
    form.difficulty_distribution.medium +
    form.difficulty_distribution.hard;

  const canProceedStep1 = form.subject.length > 0;
  const canProceedStep2 = form.syllabus.trim().length > 10 && form.units.length > 0;
  const canProceedStep3 = form.exam_pattern.length > 0;
  const canProceedStep4 = totalDifficulty === 100;
  const canSubmit = canProceedStep1 && canProceedStep2 && canProceedStep3 && canProceedStep4;

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
      const selectedPattern = examPatterns.find(
        (pattern) => pattern.value === form.exam_pattern
      );

      const requestData = {
        ...form,
        short_questions_count: selectedPattern?.structure?.shortQuestions?.count || 5,
        short_questions_marks: selectedPattern?.structure?.shortQuestions?.marks || 2,
        short_questions_total: selectedPattern?.structure?.shortQuestions?.total || 10,
        short_questions_choice_generate:
          selectedPattern?.structure?.shortQuestions?.choice?.generate || 7,
        short_questions_choice_attempt:
          selectedPattern?.structure?.shortQuestions?.choice?.attempt || 5,
        long_questions_count: selectedPattern?.structure?.longQuestions?.count || 8,
        long_questions_marks: selectedPattern?.structure?.longQuestions?.marks || 15,
        long_questions_total: selectedPattern?.structure?.longQuestions?.total || 60,
        long_questions_units: selectedPattern?.structure?.longQuestions?.units || 4,
        long_questions_per_unit:
          selectedPattern?.structure?.longQuestions?.questionsPerUnit || 2,
        exam_structure: selectedPattern?.structure,
      };

      const paper = await api.generatePaper(requestData);
      setProgressValue(100);
      clearInterval(interval);
      toast.success("Question paper generated successfully!");
      router.push(`/paper/${paper.id}`);
    } catch (err: unknown) {
      clearInterval(interval);
      setProgressValue(0);
      const message =
        err instanceof Error ? err.message : "Failed to generate paper";
      toast.error(message, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Quick Stats Dashboard */}
      <QuickStats />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Generate Question Paper
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details below to generate an AI-powered question paper.
        </p>
      </div>

      {/* Stepper Progress */}
      <Stepper currentStep={step} />

      {/* Step Components */}
      {step === 1 && (
        <StepSubject
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepSyllabus
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepPattern
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepSettings
          form={form}
          updateForm={updateForm}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <StepReview
          form={form}
          loading={loading}
          progressValue={progressValue}
          canSubmit={canSubmit}
          onGenerate={handleGenerate}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  );
}
