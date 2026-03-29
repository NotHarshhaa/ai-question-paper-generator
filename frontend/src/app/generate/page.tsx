"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Brain,
  BookOpen,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  Filter,
  Clock,
  Star,
  TrendingUp,
  Download,
  Upload,
  Settings,
  BarChart3,
  Users,
  Calendar,
  Tag,
  FolderOpen,
  FileSymlink,
  History,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type GenerateRequest } from "@/lib/api";

const subjects = [
  { id: "cs_arch", name: "Computer Architecture and Parallel Processing", category: "Core CS", difficulty: "Medium", credits: 4, popularity: 85 },
  { id: "cn", name: "Computer Networks", category: "Core CS", difficulty: "Medium", credits: 4, popularity: 92 },
  { id: "se", name: "Software Engineering", category: "Software", difficulty: "Easy", credits: 3, popularity: 88 },
  { id: "os", name: "Operating Systems", category: "Core CS", difficulty: "Hard", credits: 4, popularity: 95 },
  { id: "languages", name: "Java and .NET and C#", category: "Programming", difficulty: "Medium", credits: 3, popularity: 75 },
  { id: "ds", name: "Data Structures", category: "Core CS", difficulty: "Hard", credits: 4, popularity: 98 },
  { id: "db", name: "Database Systems", category: "Core CS", difficulty: "Medium", credits: 4, popularity: 90 },
  { id: "ai", name: "Artificial Intelligence", category: "AI/ML", difficulty: "Hard", credits: 3, popularity: 87 },
  { id: "web", name: "Web Development", category: "Software", difficulty: "Easy", credits: 3, popularity: 82 },
  { id: "iot", name: "IoT and Cloud Computing", category: "Emerging", difficulty: "Medium", credits: 3, popularity: 78 },
  { id: "linux", name: "Linux and Shell Scripts", category: "Systems", difficulty: "Easy", credits: 2, popularity: 70 },
  { id: "security", name: "Network Security", category: "Security", difficulty: "Hard", credits: 3, popularity: 83 },
  { id: "wireless", name: "Wireless Networks", category: "Networks", difficulty: "Medium", credits: 3, popularity: 72 },
  { id: "python", name: "Python Programming", category: "Programming", difficulty: "Easy", credits: 3, popularity: 94 },
  { id: "r", name: "R Programming", category: "Programming", difficulty: "Easy", credits: 2, popularity: 65 },
  { id: "ml", name: "Machine Learning", category: "AI/ML", difficulty: "Hard", credits: 4, popularity: 91 },
  { id: "bigdata", name: "Big Data Analytics", category: "AI/ML", difficulty: "Hard", credits: 3, popularity: 86 },
  { id: "dw", name: "Data Mining and Date Warehousing", category: "AI/ML", difficulty: "Medium", credits: 3, popularity: 79 },
];

const categories = ["All", "Core CS", "Programming", "AI/ML", "Software", "Systems", "Security", "Networks", "Emerging"];

const syllabusTemplates = [
  {
    id: "ds_template",
    name: "Data Structures Standard",
    subject: "Data Structures",
    content: `Unit 1: Introduction to Data Structures
- Overview, Types of Data Structures
- Arrays: Operations, Applications
- Linked Lists: Singly, Doubly, Circular

Unit 2: Stacks and Queues
- Stack Operations and Applications
- Queue Types and Implementations
- Expression Evaluation

Unit 3: Trees
- Binary Trees, BST
- Tree Traversals
- AVL Trees, Red-Black Trees

Unit 4: Graphs
- Graph Representations
- BFS, DFS Algorithms
- Shortest Path Algorithms`,
  },
  {
    id: "cn_template",
    name: "Computer Networks",
    subject: "Computer Networks",
    content: `Unit 1: Introduction and Physical Layer
- Network Models, OSI, TCP/IP
- Transmission Media, Switching

Unit 2: Data Link Layer
- Framing, Error Detection
- Flow Control, Protocols

Unit 3: Network Layer
- Routing Algorithms
- IPv4, IPv6 Addressing

Unit 4: Transport Layer
- UDP, TCP Protocols
- Congestion Control`,
  },
];

const quickStats = [
  { label: "Total Papers Generated", value: "1,284", icon: FileText, trend: "+12%" },
  { label: "Active Subjects", value: "18", icon: BookOpen, trend: "+2" },
  { label: "Average Time", value: "2.3 min", icon: Clock, trend: "-18%" },
  { label: "Success Rate", value: "98.5%", icon: TrendingUp, trend: "+0.3%" },
];

const examPatterns = [
  { 
    value: "standard", 
    label: "Standard (Q1-Q9)", 
    description: "9 questions with equal marks distribution",
    preview: [
      { question: "Q1", marks: 10, type: "Long Answer" },
      { question: "Q2", marks: 10, type: "Long Answer" },
      { question: "Q3", marks: 10, type: "Long Answer" },
      { question: "Q4", marks: 10, type: "Long Answer" },
      { question: "Q5", marks: 10, type: "Long Answer" },
      { question: "Q6", marks: 10, type: "Long Answer" },
      { question: "Q7", marks: 10, type: "Long Answer" },
      { question: "Q8", marks: 10, type: "Long Answer" },
      { question: "Q9", marks: 10, type: "Long Answer" },
    ]
  },
  { 
    value: "choice", 
    label: "With Internal Choice", 
    description: "Questions with internal choice (answer any 2 out of 3)",
    preview: [
      { question: "Q1(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
      { question: "Q2(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
      { question: "Q3(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
      { question: "Q4(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
      { question: "Q5(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
      { question: "Q6(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
      { question: "Q7(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
      { question: "Q8(a)(b)(c)", marks: 10, type: "Choice - Answer any 2" },
    ]
  },
  { 
    value: "sections", 
    label: "Section-wise (A, B, C)", 
    description: "Divided into sections with different mark values",
    preview: [
      { question: "Section A", marks: 20, type: "2x10=20" },
      { question: "Section B", marks: 30, type: "3x10=30" },
      { question: "Section C", marks: 30, type: "3x10=30" },
    ]
  },
];

export default function GeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState<GenerateRequest>({
    subject: "",
    syllabus: "",
    exam_pattern: "standard",
    total_marks: 80,
    duration_minutes: 180,
    difficulty_distribution: { easy: 30, medium: 40, hard: 30 },
    num_questions: 9,
    university_name: "",
    semester: "",
  });

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleTemplateSelect = (template: typeof syllabusTemplates[0]) => {
    setForm((prev) => ({ ...prev, syllabus: template.content }));
    setSelectedTemplate(template.id);
    setShowTemplates(false);
    toast.success("Template loaded successfully!");
  };

  const handleSyllabusImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setForm((prev) => ({ ...prev, syllabus: content }));
        toast.success("Syllabus imported successfully!");
      };
      reader.readAsText(file);
    }
  };

  const updateForm = (updates: Partial<GenerateRequest>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const updateDifficulty = (key: "easy" | "medium" | "hard", value: number) => {
    setForm((prev) => ({
      ...prev,
      difficulty_distribution: {
        ...prev.difficulty_distribution,
        [key]: value,
      },
    }));
  };

  const totalDifficulty =
    form.difficulty_distribution.easy +
    form.difficulty_distribution.medium +
    form.difficulty_distribution.hard;

  const canProceedStep1 = form.subject.length > 0;
  const canProceedStep2 = form.syllabus.trim().length > 10;
  const canSubmit = totalDifficulty === 100;

  const handleGenerate = async () => {
    if (!canSubmit) {
      toast.error("Difficulty distribution must add up to 100%");
      return;
    }
    setLoading(true);
    setProgressValue(0);

    const interval = setInterval(() => {
      setProgressValue((prev) => Math.min(prev + Math.random() * 10, 85));
    }, 800);

    try {
      const paper = await api.generatePaper(form);
      setProgressValue(100);
      clearInterval(interval);
      toast.success("Question paper generated successfully!");
      router.push(`/paper/${paper.id}`);
    } catch (err: unknown) {
      clearInterval(interval);
      setProgressValue(0);
      const message = err instanceof Error ? err.message : "Failed to generate paper";
      toast.error(message, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                  <Icon className="h-6 w-6 text-primary/20 flex-shrink-0" />
                </div>
                <div className="flex items-center mt-1 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Generate Question Paper
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details below to generate an AI-powered question paper.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            <span className="text-xs font-medium hidden sm:inline truncate">
              {s === 1 ? "Subject" : s === 2 ? "Syllabus" : "Settings"}
            </span>
            {s < 3 && <Separator className="flex-1 min-w-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Subject */}
      {step === 1 && (
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
                <Label htmlFor="university">University Name</Label>
                <Input
                  id="university"
                  placeholder="e.g., Anna University"
                  value={form.university_name}
                  onChange={(e) =>
                    updateForm({ university_name: e.target.value })
                  }
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
                        : subjects.filter(s => s.category === category).length}
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
                    onClick={() => updateForm({ subject: subject.name })}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm leading-tight flex-1 pr-2">{subject.name}</h3>
                        <Star className={`h-4 w-4 flex-shrink-0 ${subject.popularity > 85 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
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
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Syllabus */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Enter Syllabus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template and Import Options */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="gap-2 flex-1"
                >
                  <FolderOpen className="h-4 w-4" />
                  {showTemplates ? "Hide Templates" : "Use Template"}
                </Button>
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".txt,.md,.doc,.docx"
                    onChange={handleSyllabusImport}
                    className="hidden"
                    id="syllabus-import"
                  />
                  <Button
                    variant="outline"
                    asChild
                    className="gap-2 w-full"
                  >
                    <label htmlFor="syllabus-import" className="cursor-pointer flex items-center justify-center">
                      <Upload className="h-4 w-4" />
                      Import File
                    </label>
                  </Button>
                </div>
              </div>

              {/* Template Selection */}
              {showTemplates && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm">Quick Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {syllabusTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedTemplate === template.id
                            ? "ring-2 ring-primary border-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-sm">{template.name}</h5>
                            <Badge variant="outline" className="text-xs">
                              {template.subject}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.content.split('\n').slice(0, 3).join(' ')}...
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Syllabus Input */}
            <div className="space-y-2">
              <Label htmlFor="syllabus">
                Syllabus Content *{" "}
                <span className="text-muted-foreground font-normal">
                  (Paste your syllabus topics, unit-wise)
                </span>
              </Label>
              <Textarea
                id="syllabus"
                placeholder={`Unit 1: Introduction to Data Structures\n- Arrays, Linked Lists, Stacks, Queues\n\nUnit 2: Trees\n- Binary Trees, BST, AVL Trees\n\nUnit 3: Graphs\n- BFS, DFS, Shortest Path Algorithms`}
                rows={12}
                value={form.syllabus}
                onChange={(e) => updateForm({ syllabus: e.target.value })}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{form.syllabus.length} characters entered (minimum 10 required)</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateForm({ syllabus: "" })}
                    className="gap-1"
                  >
                    <FileSymlink className="h-3 w-3" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(form.syllabus)}
                    className="gap-1"
                  >
                    <FileSymlink className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Syllabus Analysis */}
            {form.syllabus.length > 50 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-sm text-blue-800">Syllabus Analysis</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-blue-600 font-medium">Units:</span>
                    <span className="ml-1">{form.syllabus.split(/Unit\s+\d+:/i).length - 1}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Topics:</span>
                    <span className="ml-1">{form.syllabus.split('\n-').length - 1}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Words:</span>
                    <span className="ml-1">{form.syllabus.split(/\s+/).length}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Complexity:</span>
                    <span className="ml-1">
                      {form.syllabus.length > 500 ? "High" : form.syllabus.length > 200 ? "Medium" : "Low"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Settings */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Exam Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min={3}
                  max={30}
                  value={form.num_questions}
                  onChange={(e) =>
                    updateForm({ num_questions: parseInt(e.target.value) || 9 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min={10}
                  max={200}
                  value={form.total_marks}
                  onChange={(e) =>
                    updateForm({ total_marks: parseInt(e.target.value) || 80 })
                  }
                />
              </div>
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
                      duration_minutes: parseInt(e.target.value) || 180,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Marks per Question</Label>
                <div className="text-sm text-muted-foreground">
                  {form.total_marks > 0 && form.num_questions > 0
                    ? `${(form.total_marks / form.num_questions).toFixed(1)} marks each`
                    : "N/A"}
                </div>
              </div>
            </div>

            <Separator />

            {/* Exam Pattern Selection with Preview */}
            <div className="space-y-4">
              <Label>Exam Pattern</Label>
              <div className="space-y-3">
                {examPatterns.map((pattern) => (
                  <Card
                    key={pattern.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      form.exam_pattern === pattern.value
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateForm({ exam_pattern: pattern.value })}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{pattern.label}</h4>
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                          {form.exam_pattern === pattern.value && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded p-3">
                        <h5 className="text-xs font-semibold mb-2 text-muted-foreground">Preview:</h5>
                        <div className="space-y-1">
                          {pattern.preview.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <span className="font-medium">{item.question}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{item.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.marks} marks
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Difficulty Distribution</Label>
                <Badge
                  variant={totalDifficulty === 100 ? "default" : "destructive"}
                >
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
                    onChange={(e) =>
                      updateDifficulty("easy", parseInt(e.target.value) || 0)
                    }
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
                    onChange={(e) =>
                      updateDifficulty("medium", parseInt(e.target.value) || 0)
                    }
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
                    onChange={(e) =>
                      updateDifficulty("hard", parseInt(e.target.value) || 0)
                    }
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
                  onClick={() => updateForm({ difficulty_distribution: { easy: 30, medium: 40, hard: 30 } })}
                  className="gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Balanced
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateForm({ difficulty_distribution: { easy: 50, medium: 30, hard: 20 } })}
                  className="gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Easy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateForm({ difficulty_distribution: { easy: 20, medium: 30, hard: 50 } })}
                  className="gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Hard
                </Button>
              </div>
            </div>

            <Separator />

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progressValue < 20
                      ? "Connecting to AI backend..."
                      : progressValue < 50
                      ? "Loading AI models (may take a minute on first run)..."
                      : progressValue < 80
                      ? "Generating questions from syllabus..."
                      : "Structuring paper..."}
                  </span>
                  <span className="font-medium">
                    {Math.round(progressValue)}%
                  </span>
                </div>
                <Progress value={progressValue} />
                {progressValue > 5 && progressValue < 90 && (
                  <p className="text-xs text-muted-foreground">
                    This may take 1–3 minutes while AI models load. Please keep this tab open.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="gap-2"
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading || !canSubmit}
                className="gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Generate Paper
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
