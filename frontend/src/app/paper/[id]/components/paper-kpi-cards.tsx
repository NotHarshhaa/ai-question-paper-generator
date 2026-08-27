import React from "react";
import { GraduationCap, Clock, FileText, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedPaper } from "@/lib/api";
import { difficultyColors } from "../constants";

interface PaperKpiCardsProps {
  paper: GeneratedPaper;
}

export const PaperKpiCards: React.FC<PaperKpiCardsProps> = ({ paper }) => {
  const easyCount = paper.questions.filter((q) => q.difficulty === "easy").length;
  const mediumCount = paper.questions.filter((q) => q.difficulty === "medium").length;
  const hardCount = paper.questions.filter((q) => q.difficulty === "hard").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <GraduationCap className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{paper.total_marks}</p>
            <p className="text-xs text-muted-foreground">Total Marks</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold">{paper.duration_minutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">{paper.questions.length}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
            <p className="text-2xl font-bold">{paper.sections.length}</p>
            <p className="text-xs text-muted-foreground">Sections</p>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground font-medium mr-1">Difficulty Distribution:</span>
        <Badge variant="outline" className={difficultyColors.easy}>
          Easy: {easyCount}
        </Badge>
        <Badge variant="outline" className={difficultyColors.medium}>
          Medium: {mediumCount}
        </Badge>
        <Badge variant="outline" className={difficultyColors.hard}>
          Hard: {hardCount}
        </Badge>
      </div>
    </div>
  );
};
