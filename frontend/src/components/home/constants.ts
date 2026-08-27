import {
  BookOpen,
  Database,
  Brain,
  Shield,
  KeyRound,
  Edit3,
  BarChart3,
  FileCode,
  Layers,
} from "lucide-react";

export const features = [
  {
    icon: BookOpen,
    title: "Syllabus-Based Topic Extraction",
    description:
      "Input any DevOps, AWS, or Cloud syllabus. NLP tokenizes units and uses TF-IDF to identify high-weightage topics.",
  },
  {
    icon: Database,
    title: "2,500+ PYQ Question Bank",
    description:
      "Explore curated previous-year questions with full model solutions across Terraform, AWS, Kubernetes, Docker, and Linux.",
  },
  {
    icon: Brain,
    title: "T5 & BERT AI Pipeline",
    description:
      "T5 generates contextual questions while BERT embeddings eliminate duplicates and evaluate semantic relevance.",
  },
  {
    icon: Shield,
    title: "Cognitive Difficulty Balancing",
    description:
      "Precisely controls Easy, Medium, and Hard question proportions according to examination requirements.",
  },
  {
    icon: KeyRound,
    title: "Teacher Solution Key Mode",
    description:
      "Instantly toggle to view comprehensive model answers, key architectural concepts, and grading rubrics for instructors.",
  },
  {
    icon: Edit3,
    title: "Interactive Exam Editor",
    description:
      "Customize generated papers on the fly: modify text, update marks, rebalance sections, or add new questions.",
  },
  {
    icon: BarChart3,
    title: "Platform Analytics & PYQ Stats",
    description:
      "Visualize domain question volume, cognitive difficulty ratios, and high-frequency topics in real time.",
  },
  {
    icon: FileCode,
    title: "Multi-Format Export",
    description:
      "Export your completed papers as print-ready PDF, Markdown (.md), raw JSON, or one-click formatted clipboard text.",
  },
];

export const steps = [
  {
    step: "01",
    title: "Select & Configure",
    desc: "Choose your subject or paste syllabus text with marks & difficulty preferences.",
  },
  {
    step: "02",
    title: "AI Generation",
    desc: "NLP extracts key topics; T5 and PYQ engines generate candidate questions.",
  },
  {
    step: "03",
    title: "Smart Balancing",
    desc: "BERT removes duplicates and structures sections into standard exam format.",
  },
  {
    step: "04",
    title: "Customize & Export",
    desc: "Review, edit inline, view model solution keys, and export to PDF or Markdown.",
  },
];

export const quickStats = [
  {
    label: "PYQ Questions",
    value: "2,550+",
    icon: Database,
    trend: "Verified Bank",
  },
  {
    label: "Cloud Domains",
    value: "18",
    icon: Layers,
    trend: "AWS & DevOps",
  },
  {
    label: "AI Intelligence",
    value: "T5 + BERT",
    icon: Brain,
    trend: "Live Inference",
  },
  {
    label: "Multi-Export",
    value: "PDF & MD",
    icon: FileCode,
    trend: "Instant Download",
  },
];
