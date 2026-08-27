import React from "react";
import { BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedPaper } from "@/lib/api";

interface PaperTopicsTabProps {
  paper: GeneratedPaper;
}

export const PaperTopicsTab: React.FC<PaperTopicsTabProps> = ({ paper }) => {
  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Extracted Syllabus Topics
        </CardTitle>
        <CardDescription>
          Core concepts and keywords analyzed from the input syllabus during AI generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {paper.syllabus_topics.map((topic, i) => (
            <Badge key={i} variant="secondary" className="text-xs py-1 px-3">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
