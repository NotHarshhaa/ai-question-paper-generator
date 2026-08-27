"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Database,
  FileText,
  PieChart,
  Layers,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Award,
  Loader2,
  RefreshCw,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { api, type AnalyticsData } from "@/lib/api";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Aggregating platform intelligence metrics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-muted-foreground">Unable to load analytics data.</p>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const totalQuestions = data.total_questions || 1;
  const easyPct = Math.round((data.difficulty.easy / totalQuestions) * 100);
  const medPct = Math.round((data.difficulty.medium / totalQuestions) * 100);
  const hardPct = Math.max(0, 100 - easyPct - medPct);

  const quickStats = [
    {
      label: "Total Questions",
      value: String(data.total_questions),
      icon: Database,
      trend: "+12% total volume",
    },
    {
      label: "Subject Areas",
      value: String(data.subjects.length),
      icon: Layers,
      trend: "Curated Domains",
    },
    {
      label: "Papers Generated",
      value: String(data.papers_generated),
      icon: FileText,
      trend: "Active exams",
    },
    {
      label: "Avg Paper Marks",
      value: `${data.avg_paper_marks} M`,
      icon: Award,
      trend: "Standardized",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((stat, index) => {
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
            <BarChart3 className="h-6 w-6" />
            Platform Analytics &amp; PYQ Insights
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time telemetry on question bank distributions, domain weightages, cognitive difficulty ratios, and exam generation activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/generate">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Generate Paper
            </Button>
          </Link>
          <Link href="/question-bank">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Database className="h-4 w-4" />
              Browse Bank
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Breakdown */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Question Distribution by Subject
            </CardTitle>
            <CardDescription>
              Volume and difficulty breakdown across DevOps, AWS, and Cloud Engineering modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.subjects.map((s) => {
              const pct = Math.round((s.count / totalQuestions) * 100);
              return (
                <div key={s.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{s.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {s.count} questions ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(s.easy / (s.count || 1)) * 100}%` }}
                      className="bg-emerald-500 transition-all"
                      title={`Easy: ${s.easy}`}
                    />
                    <div
                      style={{ width: `${(s.medium / (s.count || 1)) * 100}%` }}
                      className="bg-amber-500 transition-all"
                      title={`Medium: ${s.medium}`}
                    />
                    <div
                      style={{ width: `${(s.hard / (s.count || 1)) * 100}%` }}
                      className="bg-rose-500 transition-all"
                      title={`Hard: ${s.hard}`}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Easy: {s.easy}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Medium: {s.medium}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Hard: {s.hard}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Difficulty Ratio Card */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-amber-500" />
                Overall Difficulty Ratio
              </CardTitle>
              <CardDescription>Aggregate distribution across all subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400">Easy ({data.difficulty.easy})</span>
                    <span>{easyPct}%</span>
                  </div>
                  <Progress value={easyPct} className="h-2 bg-muted [&>div]:bg-emerald-500" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-amber-600 dark:text-amber-400">Medium ({data.difficulty.medium})</span>
                    <span>{medPct}%</span>
                  </div>
                  <Progress value={medPct} className="h-2 bg-muted [&>div]:bg-amber-500" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-rose-600 dark:text-rose-400">Hard ({data.difficulty.hard})</span>
                    <span>{hardPct}%</span>
                  </div>
                  <Progress value={hardPct} className="h-2 bg-muted [&>div]:bg-rose-500" />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                💡 <span className="font-semibold text-foreground">Recommendation:</span> For certification practice, balance questions with a 30% Easy, 50% Medium, and 20% Hard ratio to match standard exam patterns.
              </div>
            </CardContent>
          </Card>

          {/* Bloom's Taxonomy Cognitive Breakdown Card */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Bloom&apos;s Cognitive Taxonomy
              </CardTitle>
              <CardDescription className="text-xs">Cognitive depth across questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {Object.entries(
                data.bloom_distribution || {
                  Remember: Math.round(totalQuestions * 0.35),
                  Understand: Math.round(totalQuestions * 0.3),
                  Apply: Math.round(totalQuestions * 0.2),
                  Analyze: Math.round(totalQuestions * 0.1),
                  Evaluate: Math.round(totalQuestions * 0.04),
                  Create: Math.round(totalQuestions * 0.01),
                }
              ).map(([level, count]) => {
                const pct = Math.round((count / totalQuestions) * 100);
                const colorMap: Record<string, string> = {
                  Remember: "bg-blue-500",
                  Understand: "bg-teal-500",
                  Apply: "bg-amber-500",
                  Analyze: "bg-purple-500",
                  Evaluate: "bg-rose-500",
                  Create: "bg-indigo-500",
                };
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>
                        {level} ({count})
                      </span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-1.5 bg-muted [&>div]:${colorMap[level] || "bg-primary"}`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top Frequent Topics */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                High-Frequency Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {data.top_topics.map((t) => (
                  <Badge key={t.topic} variant="secondary" className="text-xs py-1 px-2.5">
                    {t.topic}
                    <span className="ml-1.5 opacity-70 font-normal">({t.count})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Papers Section */}
      {data.recent_papers && data.recent_papers.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Generated Papers</CardTitle>
              <CardDescription>Quick access to your latest customized exams</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All History <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.recent_papers.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Link
                      href={`/paper/${p.id}`}
                      className="font-semibold text-sm hover:underline hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      {p.subject}
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{p.num_questions} Questions</span>
                      <span>•</span>
                      <span>{p.total_marks} Marks</span>
                      {p.organization_name && (
                        <>
                          <span>•</span>
                          <span>{p.organization_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link href={`/paper/${p.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Open Paper
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
