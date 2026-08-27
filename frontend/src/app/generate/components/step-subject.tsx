import React, { useState } from "react";
import { BookOpen, Search, Filter, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { subjects, categories } from "../constants";
import { FormState } from "../types";
import { getDifficultyColor } from "../utils/formatters";

interface StepSubjectProps {
  form: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  onNext: () => void;
}

export const StepSubject: React.FC<StepSubjectProps> = ({
  form,
  updateForm,
  onNext,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canProceed = form.subject.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Select Subject &amp; Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-2">
            <Label htmlFor="organization">Organization / Certification Name</Label>
            <Input
              id="organization"
              placeholder="e.g., AWS Certified DevOps Engineer"
              value={form.organization_name}
              onChange={(e) => updateForm({ organization_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              placeholder="e.g., 5th Semester"
              value={form.semester}
              onChange={(e) => updateForm({ semester: e.target.value })}
            />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-1 text-xs"
              >
                <Filter className="h-3 w-3" />
                {category}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category === "All"
                    ? subjects.length
                    : subjects.filter((s) => s.category === category).length}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            {filteredSubjects.map((subject) => (
              <Card
                key={subject.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  form.subject === subject.name
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() =>
                  updateForm({ subject: form.subject === subject.name ? "" : subject.name })
                }
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm leading-tight flex-1 pr-2">{subject.name}</h3>
                    <Star
                      className={`h-4 w-4 flex-shrink-0 ${
                        subject.popularity > 85 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {subject.category}
                    </Badge>
                    <Badge className={`text-xs border ${getDifficultyColor(subject.difficulty)}`}>
                      {subject.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {subject.credits} credits
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Popularity: {subject.popularity}%</span>
                    <div className="w-12 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${subject.popularity}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No subjects found matching your search.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canProceed} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
