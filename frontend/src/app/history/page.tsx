"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  History,
  FileText,
  Trash2,
  Eye,
  Loader2,
  BookOpen,
  Calendar,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, type PaperHistoryItem } from "@/lib/api";

export default function HistoryPage() {
  const [papers, setPapers] = useState<PaperHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPapers = async () => {
    try {
      const data = await api.getPaperHistory();
      setPapers(data);
    } catch {
      toast.error("Failed to load paper history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deletePaper(deleteId);
      setPapers((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Paper deleted successfully");
    } catch {
      toast.error("Failed to delete paper");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <History className="h-8 w-8" />
            Paper History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your previously generated question papers.
          </p>
        </div>
        <Link href="/generate">
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            New Paper
          </Button>
        </Link>
      </div>

      {papers.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No papers yet</h2>
            <p className="text-muted-foreground mb-6">
              Generate your first AI-powered question paper to see it here.
            </p>
            <Link href="/generate">
              <Button className="gap-2">
                <Brain className="h-4 w-4" />
                Generate Paper
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {papers.map((paper) => (
            <Card
              key={paper.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{paper.subject}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {paper.university_name && (
                        <Badge variant="secondary">
                          {paper.university_name}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {paper.total_marks} marks
                      </Badge>
                      <Badge variant="outline">
                        {paper.num_questions} questions
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(paper.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/paper/${paper.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Dialog
                    open={deleteId === paper.id}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                  >
                    <DialogTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(paper.id)}
                        />
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Paper</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete the &ldquo;
                          {paper.subject}&rdquo; question paper? This action
                          cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
