import React from "react";
import Link from "next/link";
import {
  Database,
  TrendingUp,
  KeyRound,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const CoreModules: React.FC = () => {
  return (
    <section className="bg-muted/40 py-12 md:py-16 border-y">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Explore Our Core Features
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Integrated modules designed for students, instructors, and certification candidates.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Module 1: Question Bank */}
          <Card className="border-l-4 border-l-primary flex flex-col justify-between border shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Database className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">2.5K+ Question Bank</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Browse, filter, and search questions across AWS, Terraform, Docker, Kubernetes, Linux, and CI/CD with full model solutions.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Free-text search &amp; subject filtering</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Model answers &amp; source citations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>One-click Markdown &amp; text copying</span>
                </li>
              </ul>
              <Link
                href="/question-bank"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline pt-2"
              >
                Browse Question Bank <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Module 2: Analytics & Insights */}
          <Card className="border-l-4 border-l-amber-500 flex flex-col justify-between border shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">PYQ Analytics &amp; Insights</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Real-time telemetry on subject distributions, difficulty ratios, and top recurring keywords across exams.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Domain-wise question volume metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Cognitive difficulty ratio charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>High-frequency topic tag cloud</span>
                </li>
              </ul>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline pt-2"
              >
                View Analytics Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Module 3: Paper Editor & Teacher Keys */}
          <Card className="border-l-4 border-l-emerald-500 flex flex-col justify-between border shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <KeyRound className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Paper Editor &amp; Solutions</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Fine-tune generated exams inline, view grading criteria in Teacher Solution Mode, and export across multiple formats.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Inline text, marks &amp; difficulty editing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Teacher Solution Key &amp; grading rubrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Export to PDF, Markdown &amp; JSON</span>
                </li>
              </ul>
              <Link
                href="/generate"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline pt-2"
              >
                Create New Paper <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
