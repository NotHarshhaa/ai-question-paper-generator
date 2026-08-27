import React from "react";
import { Loader2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionBankItem, QuestionBankResponse } from "../types";
import { QuestionCard } from "./question-card";

interface QuestionGridProps {
  loading: boolean;
  data: QuestionBankResponse | null;
  expandedId: number | null;
  copiedId: number | null;
  onToggleExpand: (id: number) => void;
  onCopy: (item: QuestionBankItem, type: "question" | "markdown") => void;
  onTestAI: (item: QuestionBankItem) => void;
  onPageChange: (targetPage: number) => void;
  onResetFilters: () => void;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  loading,
  data,
  expandedId,
  copiedId,
  onToggleExpand,
  onCopy,
  onTestAI,
  onPageChange,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          Fetching question bank entries...
        </p>
      </div>
    );
  }

  if (!data || data.questions.length === 0) {
    return (
      <Card className="text-center p-12">
        <CardContent className="space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No questions found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We couldn't find any questions matching your current search criteria. Try adjusting your search query or filters.
          </p>
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.questions.map((item) => (
          <QuestionCard
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            isCopied={copiedId === item.id}
            onToggleExpand={() => onToggleExpand(item.id)}
            onCopy={(type) => onCopy(item, type)}
            onTestAI={() => onTestAI(item)}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-xs text-muted-foreground">
            Showing page <span className="font-semibold">{data.page}</span> of{" "}
            <span className="font-semibold">{data.total_pages}</span> ({data.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => onPageChange(data.page - 1)}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.total_pages}
              onClick={() => onPageChange(data.page + 1)}
              className="gap-1 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
