"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  Clock,
  BookOpen,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type GeneratedPaper } from "@/lib/api";

const difficultyColors = {
  easy: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  hard: "bg-red-100 text-red-800 border-red-200",
};

export default function PaperViewPage() {
  const params = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await api.getPaper(params.id as string);
        setPaper(data);
      } catch {
        toast.error("Failed to load paper");
        router.push("/history");
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [params.id, router]);

  const handleExportPdf = async () => {
    if (!paper) return;
    setExporting(true);
    try {
      const blob = await api.exportPdf(paper.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paper.subject.replace(/\s+/g, "_")}_Question_Paper.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!paper) return null;

  const easyCount = paper.questions.filter((q) => q.difficulty === "easy").length;
  const mediumCount = paper.questions.filter((q) => q.difficulty === "medium").length;
  const hardCount = paper.questions.filter((q) => q.difficulty === "hard").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {paper.subject}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Generated on{" "}
              {new Date(paper.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Button onClick={handleExportPdf} disabled={exporting} className="gap-2">
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export PDF
        </Button>
      </div>

      {/* Paper Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{paper.total_marks}</p>
            <p className="text-xs text-muted-foreground">Total Marks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{paper.duration_minutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{paper.questions.length}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{paper.sections.length}</p>
            <p className="text-xs text-muted-foreground">Sections</p>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Stats */}
      <div className="flex gap-3 mb-8">
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          Easy: {easyCount}
        </Badge>
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          Medium: {mediumCount}
        </Badge>
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          Hard: {hardCount}
        </Badge>
      </div>

      {/* Paper Content */}
      <Tabs defaultValue="formatted" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="formatted">Formatted Paper</TabsTrigger>
          <TabsTrigger value="questions">All Questions</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="formatted">
          {/* Formatted Paper View */}
          <Card>
            <CardHeader className="text-center border-b">
              {paper.university_name && (
                <p className="text-lg font-semibold">{paper.university_name}</p>
              )}
              <CardTitle className="text-xl">{paper.subject}</CardTitle>
              {paper.semester && (
                <p className="text-muted-foreground">{paper.semester}</p>
              )}
              <div className="flex justify-center gap-6 text-sm text-muted-foreground mt-2">
                <span>Total Marks: {paper.total_marks}</span>
                <span>Duration: {paper.duration_minutes} min</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {paper.sections.map((section, si) => (
                <div key={si}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{section.name}</h3>
                    <Badge variant="outline">
                      {section.total_marks} marks
                    </Badge>
                  </div>
                  {section.instructions && (
                    <p className="text-sm text-muted-foreground italic mb-3">
                      {section.instructions}
                    </p>
                  )}
                  <div className="space-y-4">
                    {section.questions.map((q, qi) => (
                      <div
                        key={q.id}
                        className="flex gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="font-semibold text-muted-foreground shrink-0">
                          Q{qi + 1}.
                        </span>
                        <div className="flex-1">
                          <p>{q.text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {q.marks} marks
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                difficultyColors[q.difficulty]
                              }`}
                            >
                              {q.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {q.unit}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {si < paper.sections.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <div className="space-y-3">
            {paper.questions.map((q, i) => (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <span className="font-bold text-lg text-muted-foreground shrink-0">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-base">{q.text}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline">{q.marks} marks</Badge>
                        <Badge
                          variant="outline"
                          className={difficultyColors[q.difficulty]}
                        >
                          {q.difficulty}
                        </Badge>
                        <Badge variant="outline">{q.unit}</Badge>
                        <Badge variant="secondary">{q.topic}</Badge>
                        <Badge variant="secondary">{q.question_type}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Syllabus Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {paper.syllabus_topics.map((topic, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
