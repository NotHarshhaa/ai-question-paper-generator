import React from "react";
import { Sparkles, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bloomLevels, paperTypes, questionTypes } from "../constants";
import { FormState } from "../types";

interface StepSettingsProps {
  form: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepSettings: React.FC<StepSettingsProps> = ({
  form,
  updateForm,
  onNext,
  onBack,
}) => {
  const updateDifficulty = (key: "easy" | "medium" | "hard", value: number) => {
    updateForm({
      difficulty_distribution: {
        ...form.difficulty_distribution,
        [key]: value,
      },
    });
  };

  const totalDifficulty =
    form.difficulty_distribution.easy +
    form.difficulty_distribution.medium +
    form.difficulty_distribution.hard;

  const canProceed = totalDifficulty === 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Advanced Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="text-xs">
              Basic
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              Advanced
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              AI Control
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={30}
                  max={360}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    updateForm({
                      duration_minutes: parseInt(e.target.value, 10) || 180,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={form.question_type}
                  onValueChange={(value) => updateForm({ question_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {/* Choice-Based Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Choice-Based Questions</Label>
              </div>
            </div>

            {/* Sub-Part Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sub-Part Questions (a/b)</Label>
              </div>
            </div>

            {/* PYQ Percentage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Include Previous Year Questions</Label>
                <span className="text-sm text-muted-foreground">{form.pyq_percentage}%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            {/* Bloom's Taxonomy */}
            <div className="space-y-3">
              <Label>Bloom's Taxonomy Level</Label>
              <Select
                value={form.bloom_level}
                onValueChange={(value) => updateForm({ bloom_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bloomLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paper Type */}
            <div className="space-y-3">
              <Label>Paper Type (Priority Mode)</Label>
              <Select
                value={form.paper_type}
                onValueChange={(value) => updateForm({ paper_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paperTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Distribution */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Difficulty Distribution</Label>
                <Badge variant={totalDifficulty === 100 ? "default" : "destructive"}>
                  Total: {totalDifficulty}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-600">Easy (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.difficulty_distribution.easy}
                    onChange={(e) => updateDifficulty("easy", parseInt(e.target.value, 10) || 0)}
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${form.difficulty_distribution.easy}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-yellow-600">Medium (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.difficulty_distribution.medium}
                    onChange={(e) => updateDifficulty("medium", parseInt(e.target.value, 10) || 0)}
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${form.difficulty_distribution.medium}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-600">Hard (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.difficulty_distribution.hard}
                    onChange={(e) => updateDifficulty("hard", parseInt(e.target.value, 10) || 0)}
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${form.difficulty_distribution.hard}%` }}
                    />
                  </div>
                </div>
              </div>
              {totalDifficulty !== 100 && (
                <p className="text-sm text-destructive">
                  Difficulty distribution must add up to 100% (currently {totalDifficulty}%)
                </p>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-3">
              <Label>Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateForm({ difficulty_distribution: { easy: 30, medium: 50, hard: 20 } })
                  }
                  className="gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Balanced
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateForm({ difficulty_distribution: { easy: 50, medium: 30, hard: 20 } })
                  }
                  className="gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Easy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateForm({ difficulty_distribution: { easy: 20, medium: 30, hard: 50 } })
                  }
                  className="gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Hard
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={onNext} disabled={!canProceed} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
