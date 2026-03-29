"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Brain,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  Filter,
  Clock,
  Star,
  TrendingUp,
  Upload,
  Settings,
  BarChart3,
  FolderOpen,
  FileSymlink,
  Loader2,
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
// import { Switch } from "@/components/ui/switch";
// import { Slider } from "@/components/ui/slider";
import { api } from "@/lib/api";

const subjects = [
  { id: "ml", name: "Machine Learning", category: "AI/ML", difficulty: "Hard", credits: 4, popularity: 91 },
  { id: "bigdata", name: "Big Data Analytics", category: "AI/ML", difficulty: "Hard", credits: 3, popularity: 86 },
  { id: "r_prog", name: "R Programming", category: "Programming", difficulty: "Easy", credits: 2, popularity: 65 },
  { id: "ds", name: "Data Structures", category: "Core CS", difficulty: "Hard", credits: 4, popularity: 98 },
  { id: "cn", name: "Computer Networks", category: "Core CS", difficulty: "Medium", credits: 4, popularity: 92 },
  { id: "os", name: "Operating Systems", category: "Core CS", difficulty: "Hard", credits: 4, popularity: 95 },
  { id: "db", name: "Database Systems", category: "Core CS", difficulty: "Medium", credits: 4, popularity: 90 },
  { id: "ai", name: "Artificial Intelligence", category: "AI/ML", difficulty: "Hard", credits: 3, popularity: 87 },
  { id: "se", name: "Software Engineering", category: "Software", difficulty: "Easy", credits: 3, popularity: 88 },
  { id: "web", name: "Web Development", category: "Software", difficulty: "Easy", credits: 3, popularity: 82 },
];

const bloomLevels = [
  { value: "remember", label: "Remember", description: "Define, list, identify" },
  { value: "understand", label: "Understand", description: "Explain, describe, summarize" },
  { value: "apply", label: "Apply", description: "Solve, implement, use" },
  { value: "analyze", label: "Analyze", description: "Compare, examine, differentiate" },
  { value: "evaluate", label: "Evaluate", description: "Judge, assess, critique" },
  { value: "create", label: "Create", description: "Design, construct, develop" },
];

const paperTypes = [
  { value: "important", label: "Important Topics Focus", description: "Focus on high-frequency topics" },
  { value: "balanced", label: "Balanced Paper", description: "Even distribution across topics" },
  { value: "challenging", label: "Challenging Paper", description: "More analytical questions" },
];

const questionTypes = [
  { value: "short", label: "Short Questions", description: "2-5 marks, concise answers" },
  { value: "long", label: "Long Questions", description: "10-15 marks, detailed answers" },
  { value: "mixed", label: "Mixed", description: "Combination of short and long" },
];

const categories = ["All", "Core CS", "Programming", "AI/ML", "Software", "Systems", "Security", "Networks", "Emerging"];

const quickStats = [
  { label: "Total Papers Generated", value: "1,284", icon: FileText, trend: "+12%" },
  { label: "Active Subjects", value: "18", icon: BookOpen, trend: "+2" },
  { label: "Average Time", value: "2.3 min", icon: Clock, trend: "-18%" },
  { label: "Success Rate", value: "98.5%", icon: TrendingUp, trend: "+0.3%" },
];

const examPatterns = [
  { 
    value: "university", 
    label: "University Pattern", 
    description: "Standard university format with short questions and unit-based long questions",
    structure: {
      shortQuestions: { count: 5, marks: 2, total: 10, choice: { generate: 7, attempt: 5 } },
      longQuestions: { count: 8, marks: 15, total: 60, units: 4, questionsPerUnit: 2 },
      totalMarks: 70
    }
  },
  { 
    value: "custom", 
    label: "Custom Pattern", 
    description: "Design your own paper structure",
    structure: {
      sections: [],
      totalMarks: 80
    }
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

  // Form state
  const [form, setForm] = useState<FormState>({
    subject: "",
    syllabus: "",
    exam_pattern: "university",
    pattern_type: "university",
    total_marks: 70,
    duration_minutes: 180,
    difficulty_distribution: { easy: 30, medium: 40, hard: 30 },
    num_questions: 13,
    university_name: "",
    semester: "",
    choice_based: { enabled: false, generate: 7, attempt: 5 },
    sub_parts: { enabled: false, format: "(a)(b)" },
    pyq_percentage: 20,
    bloom_level: "apply",
    paper_type: "balanced",
    question_type: "mixed",
    custom_sections: [],
    units: [],
    topics: [],
    keywords: [],
  });

  // Syllabus templates
  const syllabusTemplates = [
    {
      id: "ml-template",
      name: "Machine Learning Template",
      subject: "ml",
      content: `Unit 1: Introduction to Machine Learning
- Definition and Overview
- Types of Learning: Supervised, Unsupervised, Reinforcement
- Applications and Real-world Examples

Unit 2: Supervised Learning
- Linear Regression
- Logistic Regression
- Decision Trees and Random Forests
- Support Vector Machines

Unit 3: Unsupervised Learning
- Clustering Algorithms
- Dimensionality Reduction
- Association Rule Mining

Unit 4: Neural Networks
- Perceptron and Multi-layer Perceptrons
- Backpropagation Algorithm
- Convolutional Neural Networks
- Recurrent Neural Networks`,
    },
  ];

  const handleTemplateSelect = (template: any) => {
    setForm((prev) => ({ ...prev, syllabus: template.content }));
    setSelectedTemplate(template.id);
    setShowTemplates(false);
    processSyllabus(template.content);
    toast.success(`Template "${template.name}" applied successfully!`);
  };

  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

interface ProcessedSyllabus {
  number: number;
  title: string;
  topics: string[];
}

interface FormState {
  subject: string;
  syllabus: string;
  exam_pattern: string;
  pattern_type: string;
  total_marks: number;
  duration_minutes: number;
  difficulty_distribution: { easy: number; medium: number; hard: number };
  num_questions: number;
  university_name: string;
  semester: string;
  // Advanced Settings
  choice_based: { enabled: boolean; generate: number; attempt: number };
  sub_parts: { enabled: boolean; format: string };
  pyq_percentage: number;
  bloom_level: string;
  paper_type: string;
  question_type: string;
  // Custom Pattern (if selected)
  custom_sections: any[];
  // Derived from syllabus (auto-generated)
  units: ProcessedSyllabus[];
  topics: string[];
  keywords: string[];
}

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

  const handleSyllabusImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setForm((prev) => ({ ...prev, syllabus: content }));
        processSyllabus(content);
        toast.success("Syllabus imported successfully!");
      };
      reader.readAsText(file);
    }
  };

  const processSyllabus = (syllabusText: string) => {
    // Step 1: Unit Detection - Support multiple formats including typos
    const unitPatterns = [
      /Unit\s*[-\s]*([IVXL]+|[ivxl]+|[IVXLivxl]+)/gi,  // Unit-I, Unit II, unit-iii, etc.
      /Unit\s*[-\s]*(\d+)/gi,                         // Unit-1, Unit 2, etc.
      /\bUnit[-\s]*([IVXL]+|[ivxl]+|\d+)\b/gi         // More flexible unit detection
    ];
    
    const units: ProcessedSyllabus[] = [];
    const unitMap: { [key: string]: number } = {};
    
    console.log("Processing syllabus:", syllabusText.substring(0, 200) + "...");
    
    // Try each pattern
    unitPatterns.forEach((pattern, patternIndex) => {
      let match;
      // Reset regex lastIndex to ensure we catch all matches
      pattern.lastIndex = 0;
      while ((match = pattern.exec(syllabusText)) !== null) {
        console.log(`Pattern ${patternIndex} matched:`, match[0], "Unit ID:", match[1]);
        
        let unitIdentifier = match[1].toLowerCase(); // Convert to lowercase for easier handling
        
        // Fix common typos: ll -> ii, etc.
        if (unitIdentifier === 'll') unitIdentifier = 'ii';
        if (unitIdentifier === 'l') unitIdentifier = 'i';
        if (unitIdentifier === 'v') unitIdentifier = 'v';
        
        let unitNumber: number;
        
        // Convert Roman numerals to numbers
        if (/^[ivxl]+$/.test(unitIdentifier)) {
          const romanMap: { [key: string]: number } = { 
            i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
            I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10
          };
          unitNumber = romanMap[unitIdentifier] || 1;
        } else {
          unitNumber = parseInt(unitIdentifier) || 1;
        }
        
        const unitTitle = match[0].trim();
        
        if (!unitMap[unitTitle]) {
          units.push({
            number: unitNumber,
            title: unitTitle,
            topics: []
          });
          unitMap[unitTitle] = units.length - 1;
          console.log(`Added unit:`, unitTitle, `as unit number ${unitNumber}`);
        }
      }
    });

    console.log("Total units detected:", units.length);
    units.forEach((unit, index) => {
      console.log(`Unit ${index}:`, unit.title, "Number:", unit.number);
    });

    // If no units detected, create a default unit
    if (units.length === 0 && syllabusText.trim().length > 10) {
      units.push({
        number: 1,
        title: "Unit 1",
        topics: []
      });
    }

    // Step 2: Topic Extraction
    const lines = syllabusText.split('\n');
    let currentUnitIndex = 0;
    
    lines.forEach((line: string) => {
      const trimmedLine = line.trim();
      
      // Check if this is a unit line using any pattern
      let isUnitLine = false;
      unitPatterns.forEach((pattern) => {
        const unitMatch = trimmedLine.match(pattern);
        if (unitMatch) {
          isUnitLine = true;
          // Find the corresponding unit index
          for (let i = 0; i < units.length; i++) {
            if (units[i].title === unitMatch[0]) {
              currentUnitIndex = i;
              break;
            }
          }
        }
      });
      
      if (isUnitLine) return;
      
      // Extract topics (lines starting with • or -, or containing important keywords)
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || 
          trimmedLine.match(/^(definition|explain|describe|compare|analyze|evaluate)/i)) {
        const topic = trimmedLine.replace(/^[•\-]\s*/, '').trim();
        if (topic && currentUnitIndex >= 0 && currentUnitIndex < units.length) {
          units[currentUnitIndex].topics.push(topic);
        }
      } else if (trimmedLine.length > 5 && !trimmedLine.toLowerCase().includes('unit') && units.length > 0) {
        // Add non-unit lines as topics if they're substantial enough
        if (currentUnitIndex >= 0 && currentUnitIndex < units.length) {
          units[currentUnitIndex].topics.push(trimmedLine);
        }
      }
    });

    // Step 3: Extract keywords
    const keywords: string[] = [];
    const technicalTerms = syllabusText.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
    const commonWords = ['The', 'And', 'Or', 'But', 'For', 'With', 'This', 'That', 'From', 'They', 'Have', 'Been'];
    
    technicalTerms.forEach((term: string) => {
      if (!commonWords.includes(term) && term.length > 3) {
        keywords.push(term);
      }
    });

    // Update form with processed data
    setForm((prev: FormState) => ({
      ...prev,
      units: units,
      topics: units.flatMap((unit: ProcessedSyllabus) => unit.topics),
      keywords: keywords.slice(0, 20) // Limit to top 20 keywords
    }));
  };

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
  const canProceedStep2 = form.syllabus.trim().length > 10 && form.units.length > 0;
  const canProceedStep3 = form.exam_pattern.length > 0;
  const canProceedStep4 = totalDifficulty === 100;
  const canSubmit = canProceedStep1 && canProceedStep2 && canProceedStep3 && canProceedStep4;

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
      // Find the selected exam pattern structure
      const selectedPattern = examPatterns.find(pattern => pattern.value === form.exam_pattern);
      
      // Prepare the request with exam structure
      const requestData = {
        ...form,
        exam_structure: selectedPattern?.structure
      };
      
      console.log("Sending request with exam structure:", requestData);
      
      const paper = await api.generatePaper(requestData);
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
        {[1, 2, 3, 4, 5].map((s) => (
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
              {s === 1 ? "Subject" : s === 2 ? "Syllabus" : s === 3 ? "Pattern" : s === 4 ? "Settings" : "Generate"}
            </span>
            {s < 5 && <Separator className="flex-1 min-w-4" />}
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
                    onClick={() => updateForm({ subject: form.subject === subject.name ? "" : subject.name })}
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
                onChange={(e) => {
                  updateForm({ syllabus: e.target.value });
                  processSyllabus(e.target.value);
                }}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{form.syllabus.length} characters entered (minimum 10 required)</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                  setForm((prev) => ({ 
                    ...prev, 
                    syllabus: "", 
                    units: [], 
                    topics: [], 
                    keywords: [] 
                  }));
                }}
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
            {form.units.length > 0 && (
              <div className="p-4 bg-muted border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm text-foreground">Syllabus Analysis</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-primary font-medium">Units:</span>
                    <span className="ml-1 text-foreground">{form.units.length}</span>
                  </div>
                  <div>
                    <span className="text-primary font-medium">Topics:</span>
                    <span className="ml-1 text-foreground">{form.topics.length}</span>
                  </div>
                  <div>
                    <span className="text-primary font-medium">Keywords:</span>
                    <span className="ml-1 text-foreground">{form.keywords.length}</span>
                  </div>
                  <div>
                    <span className="text-primary font-medium">Complexity:</span>
                    <span className="ml-1 text-foreground">
                      {form.syllabus.length > 500 ? "High" : form.syllabus.length > 200 ? "Medium" : "Low"}
                    </span>
                  </div>
                </div>
                
                {/* Units Breakdown */}
                <div className="mt-3 space-y-2">
                  <h5 className="font-medium text-xs text-foreground">Detected Units:</h5>
                  <div className="space-y-1">
                    {form.units.map((unit: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-card p-2 rounded border">
                        <span className="font-medium text-foreground">{unit.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {unit.topics?.length || 0} topics
                        </Badge>
                      </div>
                    ))}
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

      {/* Step 3: Exam Pattern Configuration */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exam Pattern Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pattern Type Selection */}
            <div className="space-y-4">
              <Label>Choose Exam Pattern</Label>
              <div className="grid gap-3">
                {examPatterns.map((pattern) => (
                  <Card
                    key={pattern.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      form.pattern_type === pattern.value
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => updateForm({ pattern_type: pattern.value, exam_pattern: pattern.value })}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{pattern.label}</h4>
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                          {form.pattern_type === pattern.value && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      
                      {pattern.value === "university" && (
                        <div className="bg-muted/50 rounded p-3">
                          <h5 className="text-xs font-semibold mb-2">University Pattern Structure:</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">Short Questions:</span>
                              <span>5 questions × 2 marks = 10 marks</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Long Questions:</span>
                              <span>8 questions × 15 marks = 60 marks</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Total:</span>
                              <span className="font-bold">70 marks</span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>• Attempt 1 question per unit (4 units)</p>
                              <p>• Short questions: Generate 7, attempt any 5</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {pattern.value === "custom" && (
                        <div className="bg-muted/50 rounded p-3">
                          <p className="text-xs text-muted-foreground">
                            Design your own paper structure with custom sections, marks distribution, and question types.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Step 4: Advanced Settings */}
      {step === 4 && (
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
                <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">AI Control</TabsTrigger>
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
                          duration_minutes: parseInt(e.target.value) || 180,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select value={form.question_type} onValueChange={(value) => updateForm({ question_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
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
                    {/* <Switch
                      checked={form.choice_based.enabled}
                      onCheckedChange={(enabled: any) => 
                        updateForm({ choice_based: { ...form.choice_based, enabled } })
                      }
                    /> */}
                  </div>
                  {/* {form.choice_based.enabled && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded">
                      <div className="space-y-2">
                        <Label className="text-xs">Generate Questions</Label>
                        <Input
                          type="number"
                          min={5}
                          max={10}
                          value={form.choice_based.generate}
                          onChange={(e: any) => 
                            updateForm({ choice_based: { ...form.choice_based, generate: parseInt(e.target.value) || 7 } })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Attempt Questions</Label>
                        <Input
                          type="number"
                          min={3}
                          max={8}
                          value={form.choice_based.attempt}
                          onChange={(e: any) => 
                            updateForm({ choice_based: { ...form.choice_based, attempt: parseInt(e.target.value) || 5 } })
                          }
                        />
                      </div>
                    </div>
                  )} */}
                </div>

                {/* Sub-Part Questions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Sub-Part Questions (a/b)</Label>
                    {/* <Switch
                      checked={form.sub_parts.enabled}
                      onCheckedChange={(enabled: any) => 
                        updateForm({ sub_parts: { ...form.sub_parts, enabled } })
                      }
                    /> */}
                  </div>
                  {/* {form.sub_parts.enabled && (
                    <Select value={form.sub_parts.format} onValueChange={(value: any) => updateForm({ sub_parts: { ...form.sub_parts, format: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="(a)(b)">(a)(b)</SelectItem>
                        <SelectItem value="(a) OR (b)">(a) OR (b)</SelectItem>
                        <SelectItem value="(a)/(b)">(a)/(b)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) */}
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
                  <Select value={form.bloom_level} onValueChange={(value) => updateForm({ bloom_level: value })}>
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
                  <Select value={form.paper_type} onValueChange={(value) => updateForm({ paper_type: value })}>
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
                        onChange={(e) => updateDifficulty("easy", parseInt(e.target.value) || 0)}
                      />
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${form.difficulty_distribution.easy}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-yellow-600">Medium (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.difficulty_distribution.medium}
                        onChange={(e) => updateDifficulty("medium", parseInt(e.target.value) || 0)}
                      />
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: `${form.difficulty_distribution.medium}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-red-600">Hard (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.difficulty_distribution.hard}
                        onChange={(e) => updateDifficulty("hard", parseInt(e.target.value) || 0)}
                      />
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full transition-all duration-300" style={{ width: `${form.difficulty_distribution.hard}%` }} />
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
                    <Button variant="outline" size="sm" onClick={() => updateForm({ difficulty_distribution: { easy: 30, medium: 50, hard: 20 } })} className="gap-2">
                      <Settings className="h-3 w-3" />
                      Balanced
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateForm({ difficulty_distribution: { easy: 50, medium: 30, hard: 20 } })} className="gap-2">
                      <Settings className="h-3 w-3" />
                      Easy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateForm({ difficulty_distribution: { easy: 20, medium: 30, hard: 50 } })} className="gap-2">
                      <Settings className="h-3 w-3" />
                      Hard
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(5)} disabled={!canProceedStep4} className="gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 5: Generate */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Question Paper
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review your settings and generate the AI-powered question paper
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Paper Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{form.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Marks:</span>
                    <span className="font-medium">{form.total_marks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{form.duration_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pattern:</span>
                    <span className="font-medium">{form.exam_pattern}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Syllabus Overview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units:</span>
                    <span className="font-medium">{form.units.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Topics:</span>
                    <span className="font-medium">{form.topics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keywords:</span>
                    <span className="font-medium">{form.keywords.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="font-medium">
                      {form.difficulty_distribution.easy}% Easy / {form.difficulty_distribution.medium}% Medium / {form.difficulty_distribution.hard}% Hard
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Units Preview */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Units & Topics</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {form.units.map((unit, index) => (
                  <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                    <div className="font-medium text-xs mb-1">{unit.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {unit.topics.slice(0, 3).join(", ")}
                      {unit.topics.length > 3 && `... +${unit.topics.length - 3} more`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating paper...</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="w-full" />
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={!canSubmit || loading} 
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
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
