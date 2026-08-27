import React from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Zap,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionBankItem } from "../types";
import { DIFFICULTY_MAP } from "../constants";

interface QuestionCardProps {
  item: QuestionBankItem;
  isExpanded: boolean;
  isCopied: boolean;
  onToggleExpand: () => void;
  onCopy: (type: "question" | "markdown") => void;
  onTestAI: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  item,
  isExpanded,
  isCopied,
  onToggleExpand,
  onCopy,
  onTestAI,
}) => {
  const diffStyle = DIFFICULTY_MAP[item.difficulty] || DIFFICULTY_MAP.medium;

  return (
    <Card className="flex flex-col justify-between border hover:border-primary/40 transition-all duration-200 shadow-sm">
      <CardHeader className="pb-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold text-xs">
              {item.subject}
            </Badge>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}
            >
              {item.difficulty.toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {item.marks} Marks
          </span>
        </div>

        <CardTitle className="text-base font-semibold leading-snug">
          {item.text}
        </CardTitle>

        {item.topic && item.topic !== item.subject && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3 w-3" />
            <span>Topic: {item.topic}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Collapsible Solution Box */}
        {isExpanded && (
          <div className="rounded-lg bg-muted/60 p-4 border text-sm space-y-2 animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Model Answer / Solution
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs md:text-sm">
              {item.answer || "No detailed explanation recorded. Refer to standard documentation."}
            </p>
            {item.source_file && (
              <div className="text-[11px] text-muted-foreground/75 pt-1 border-t">
                Source: {item.source_file}
              </div>
            )}
          </div>
        )}

        {/* Card Actions */}
        <div className="flex items-center justify-between pt-2 border-t text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide Solution
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> View Solution
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs gap-1 font-semibold text-primary"
              onClick={onTestAI}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              Test with AI
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => onCopy("question")}
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => onCopy("markdown")}
            >
              <Zap className="h-3 w-3 text-amber-500" />
              MD
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
