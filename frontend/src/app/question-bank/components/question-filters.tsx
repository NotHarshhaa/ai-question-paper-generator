import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS_LIST } from "../constants";

interface QuestionFiltersProps {
  search: string;
  subject: string;
  difficulty: string;
  questionType: string;
  onSearchChange: (val: string) => void;
  onSubjectChange: (val: string) => void;
  onDifficultyChange: (val: string) => void;
  onQuestionTypeChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onResetFilters: () => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  search,
  subject,
  difficulty,
  questionType,
  onSearchChange,
  onSubjectChange,
  onDifficultyChange,
  onQuestionTypeChange,
  onSearchSubmit,
  onResetFilters,
}) => {
  const isFiltered =
    subject !== "All" || difficulty !== "All" || questionType !== "All" || Boolean(search);

  return (
    <Card className="mb-8 border shadow-sm">
      <CardContent className="p-4 md:p-6 space-y-4">
        <form onSubmit={onSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by keyword, concept, command, or topic..."
              className="pl-9"
            />
          </div>
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>

        {/* Filter dropdowns & pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-1">
            <Filter className="h-3.5 w-3.5" />
            Filters:
          </div>

          {/* Subject Select */}
          <Select value={subject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS_LIST.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty Select */}
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Question Type Select */}
          <Select value={questionType} onValueChange={onQuestionTypeChange}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Question Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="short">Short Answer</SelectItem>
              <SelectItem value="long">Long Answer</SelectItem>
              <SelectItem value="descriptive">Descriptive</SelectItem>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
              onClick={onResetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
