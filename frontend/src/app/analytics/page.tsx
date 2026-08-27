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
  Clock,
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
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics");
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/80 text-xs font-medium text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
              DevOps & AWS Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Platform Analytics & PYQ Insights
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Real-time telemetry on question bank distributions, domain weightages, cognitive difficulty ratios, and exam generation activity.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/generate">
              <Button className="gap-2 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Generate Paper
              </Button>
            </Link>
            <Link href="/question-bank">
              <Button variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Browse Bank
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.total_questions}</div>
            <p className="text-xs text-muted-foreground mt-1">Curated DevOps & Cloud PYQs</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subject Areas</CardTitle>
            <Layers className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.subjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Specialized domains covered</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Papers Generated</CardTitle>
            <FileText className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.papers_generated}</div>
            <p className="text-xs text-muted-foreground mt-1">Saved in local repository</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Paper Marks</CardTitle>
            <Award className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.avg_paper_marks} M</div>
            <p className="text-xs text-muted-foreground mt-1">Standardized exam weightage</p>
          </CardContent>
        </Card>
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
