import React from "react";
import Link from "next/link";
import { Database, Layers, Sparkles, BookOpen, TrendingUp, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestionBankHeroProps {
  totalQuestions?: number | string;
}

export const QuestionBankHero: React.FC<QuestionBankHeroProps> = ({ totalQuestions }) => {
  const stats = [
    {
      label: "Total Questions",
      value: totalQuestions ? String(totalQuestions) : "2,558",
      icon: Database,
      trend: "+150 this month",
    },
    {
      label: "Subject Areas",
      value: "18",
      icon: Layers,
      trend: "All Cloud Domains",
    },
    {
      label: "Model Solutions",
      value: "100%",
      icon: BookOpen,
      trend: "Verified Answers",
    },
    {
      label: "AI Answer Grader",
      value: "Active",
      icon: Sparkles,
      trend: "Sentence-BERT",
    },
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                  <Icon className="h-6 w-6 text-primary/20 flex-shrink-0" />
                </div>
                <div className="flex items-center mt-1 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6" />
            Interactive Question Bank &amp; AI Grader
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search, filter, and practice 2,500+ verified previous year questions with model solutions and live AI answer evaluation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/generate">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Brain className="h-4 w-4" />
              Generate Paper
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
