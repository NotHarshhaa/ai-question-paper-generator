import React from "react";
import { Database } from "lucide-react";

interface QuestionBankHeroProps {
  totalQuestions?: number | string;
}

export const QuestionBankHero: React.FC<QuestionBankHeroProps> = ({ totalQuestions }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 md:p-10 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/80 text-xs font-medium text-primary">
            <Database className="h-3.5 w-3.5" />
            DevOps &amp; AWS PYQ Repository
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Interactive Question Bank &amp; AI Grader
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Search, filter, and practice 2,500+ verified previous year questions with model solutions and live AI answer evaluation.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 self-stretch md:self-auto bg-background/80 backdrop-blur border rounded-xl p-4 shadow-sm">
          <div className="text-center px-2">
            <div className="text-2xl font-bold text-primary">{totalQuestions ?? "..."}</div>
            <div className="text-xs text-muted-foreground">Total Questions</div>
          </div>
          <div className="text-center px-2 border-x">
            <div className="text-2xl font-bold text-amber-500">15+</div>
            <div className="text-xs text-muted-foreground">Subject Areas</div>
          </div>
          <div className="text-center px-2">
            <div className="text-2xl font-bold text-emerald-500">100%</div>
            <div className="text-xs text-muted-foreground">AI Graded</div>
          </div>
        </div>
      </div>
    </div>
  );
};
