"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Database,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Star,
  Clock,
  Tag,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const questionBank = [
  {
    id: 1,
    question: "Explain the concept of time complexity and space complexity in algorithm analysis.",
    subject: "Data Structures",
    difficulty: "Medium",
    marks: 10,
    topic: "Algorithm Analysis",
    rating: 4.5,
    usage: 45,
    status: "approved",
    created: "2024-01-15",
    tags: ["algorithm", "complexity", "analysis"],
  },
  {
    id: 2,
    question: "Design and implement a binary search tree with insertion, deletion, and traversal operations.",
    subject: "Data Structures",
    difficulty: "Hard",
    marks: 15,
    topic: "Trees",
    rating: 4.8,
    usage: 38,
    status: "approved",
    created: "2024-01-20",
    tags: ["bst", "trees", "implementation"],
  },
  {
    id: 3,
    question: "Compare and contrast TCP and UDP protocols in terms of reliability, flow control, and congestion control.",
    subject: "Computer Networks",
    difficulty: "Medium",
    marks: 10,
    topic: "Transport Layer",
    rating: 4.6,
    usage: 52,
    status: "approved",
    created: "2024-01-18",
    tags: ["tcp", "udp", "protocols"],
  },
  {
    id: 4,
    question: "Implement a deadlock detection algorithm for an operating system.",
    subject: "Operating Systems",
    difficulty: "Hard",
    marks: 15,
    topic: "Deadlocks",
    rating: 4.7,
    usage: 29,
    status: "pending",
    created: "2024-01-22",
    tags: ["deadlock", "os", "algorithms"],
  },
  {
    id: 5,
    question: "Explain the ACID properties in database management systems with examples.",
    subject: "Database Systems",
    difficulty: "Easy",
    marks: 8,
    topic: "Database Concepts",
    rating: 4.3,
    usage: 61,
    status: "approved",
    created: "2024-01-10",
    tags: ["acid", "database", "transactions"],
  },
];

const subjects = ["All", "Data Structures", "Computer Networks", "Operating Systems", "Database Systems", "Machine Learning"];
const difficulties = ["All", "Easy", "Medium", "Hard"];
const topics = ["All", "Algorithm Analysis", "Trees", "Transport Layer", "Deadlocks", "Database Concepts"];

export default function QuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    subject: "",
    difficulty: "Medium",
    marks: 10,
    topic: "",
    tags: "",
  });

  const filteredQuestions = questionBank.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === "All" || q.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === "All" || q.topic === selectedTopic;
    return matchesSearch && matchesSubject && matchesDifficulty && matchesTopic;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-3 w-3" />;
      case "pending": return <AlertCircle className="h-3 w-3" />;
      case "rejected": return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.subject || !newQuestion.topic) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Question added successfully!");
    setNewQuestion({
      question: "",
      subject: "",
      difficulty: "Medium",
      marks: 10,
      topic: "",
      tags: "",
    });
    setShowAddDialog(false);
  };

  const handleCopyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    toast.success("Question copied to clipboard!");
  };

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(filteredQuestions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'question-bank.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Questions exported successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Database className="h-6 w-6" />
              Question Bank
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage, review, and organize your question database.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question *</Label>
                    <Textarea
                      id="question"
                      placeholder="Enter the question text..."
                      rows={4}
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={newQuestion.subject} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, subject: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.slice(1).map((subject) => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.slice(1).map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic *</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Algorithm Analysis"
                        value={newQuestion.topic}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, topic: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marks">Marks</Label>
                      <Input
                        id="marks"
                        type="number"
                        min={1}
                        max={20}
                        value={newQuestion.marks}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 10 }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="algorithm, complexity, analysis"
                      value={newQuestion.tags}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddQuestion}>
                      Add Question
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExportQuestions} className="gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Questions</p>
                <p className="text-xl font-bold">{questionBank.length}</p>
              </div>
              <Database className="h-8 w-8 text-primary/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-xl font-bold">{questionBank.filter(q => q.status === 'approved').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{questionBank.filter(q => q.status === 'pending').length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <p className="text-xl font-bold">4.6</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="gap-2 text-sm"
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                {viewMode === "grid" ? "List" : "Grid"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Display */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 gap-4" : "space-y-3"}>
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    <Badge className={`${getDifficultyColor(question.difficulty)} text-xs`}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{question.marks}m</Badge>
                    <Badge className={`${getStatusColor(question.status)} text-xs`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(question.status)}
                        {question.status}
                      </span>
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm mb-2 line-clamp-3 leading-relaxed">{question.question}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {question.subject}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {question.topic}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyQuestion(question.question)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span>{question.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    <span>{question.usage} uses</span>
                  </div>
                </div>
                <span>{question.created}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-8">
          <Database className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-base font-semibold mb-2">No questions found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
