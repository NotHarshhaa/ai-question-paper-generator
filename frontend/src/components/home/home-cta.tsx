import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle, Brain, Database, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const HomeCta: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      <Card className="border-l-4 border-l-primary overflow-hidden shadow-lg bg-card/90 backdrop-blur border">
        <CardContent className="p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Value Prop & Checklist */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/60 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Free &amp; Open DevOps Question Engine
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Empower Your Exam Prep &amp; Teaching with AI
              </h2>

              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Generate balanced university and certification exam papers from your syllabus in under 60 seconds, complete with Bloom&apos;s taxonomy mapping and instructor solution keys.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Automated Difficulty &amp; Bloom Calibration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>2,500+ Curated DevOps &amp; AWS PYQs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Teacher Solution Keys &amp; Rubrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>One-Click Export to PDF &amp; Markdown</span>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Launch Action Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border bg-muted/40 p-5 space-y-4 shadow-sm">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Popular Cloud Domains
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"].map((topic) => (
                      <Link key={topic} href={`/question-bank`}>
                        <Badge
                          variant="secondary"
                          className="text-xs py-1 px-2.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          {topic}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t">
                  <Link href="/generate" className="block w-full">
                    <Button size="lg" className="w-full gap-2 font-semibold shadow-md">
                      <Brain className="h-4 w-4" /> Start Generating Paper
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/question-bank" className="block w-full">
                    <Button size="lg" variant="outline" className="w-full gap-2 text-sm">
                      <Database className="h-4 w-4 text-primary" /> Browse Question Bank
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    AI Pipeline Ready
                  </span>
                  <span>T5 + Sentence-BERT</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
