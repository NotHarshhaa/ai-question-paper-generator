import { FileText, BookOpen, Clock, TrendingUp } from "lucide-react";
import {
  SubjectItem,
  BloomLevelItem,
  OptionItem,
  QuickStatItem,
  ExamPatternItem,
  SyllabusTemplateItem,
  FormState,
} from "./types";

export const subjects: SubjectItem[] = [
  { id: "aws_fundamentals", name: "AWS Cloud Fundamentals", category: "AWS", difficulty: "Easy", credits: 3, popularity: 95 },
  { id: "aws_compute", name: "AWS Compute (EC2 & Auto Scaling)", category: "AWS", difficulty: "Medium", credits: 4, popularity: 92 },
  { id: "aws_storage", name: "AWS Storage & Databases", category: "AWS", difficulty: "Medium", credits: 4, popularity: 90 },
  { id: "aws_networking", name: "AWS Networking (VPC, Route 53, CloudFront)", category: "AWS", difficulty: "Hard", credits: 4, popularity: 87 },
  { id: "aws_security", name: "AWS Security & IAM", category: "Security", difficulty: "Hard", credits: 3, popularity: 89 },
  { id: "aws_serverless", name: "AWS Serverless (Lambda, API Gateway, Step Functions)", category: "AWS", difficulty: "Hard", credits: 3, popularity: 86 },
  { id: "docker", name: "Docker & Containerization", category: "Containers", difficulty: "Medium", credits: 3, popularity: 98 },
  { id: "kubernetes", name: "Kubernetes & Container Orchestration", category: "Containers", difficulty: "Hard", credits: 4, popularity: 96 },
  { id: "cicd", name: "CI/CD Pipelines", category: "DevOps", difficulty: "Medium", credits: 3, popularity: 94 },
  { id: "jenkins", name: "Jenkins", category: "DevOps", difficulty: "Medium", credits: 2, popularity: 85 },
  { id: "terraform", name: "Terraform & Infrastructure as Code", category: "DevOps", difficulty: "Hard", credits: 4, popularity: 93 },
  { id: "ansible", name: "Ansible & Configuration Management", category: "DevOps", difficulty: "Medium", credits: 3, popularity: 84 },
  { id: "linux", name: "Linux Administration & Shell Scripting", category: "Systems", difficulty: "Medium", credits: 3, popularity: 91 },
  { id: "git", name: "Git & Version Control", category: "DevOps", difficulty: "Easy", credits: 2, popularity: 88 },
  { id: "monitoring", name: "Monitoring & Logging (CloudWatch, Prometheus, Grafana)", category: "Observability", difficulty: "Medium", credits: 3, popularity: 83 },
  { id: "sre", name: "Site Reliability Engineering (SRE)", category: "Observability", difficulty: "Hard", credits: 3, popularity: 80 },
  { id: "devsecops", name: "DevSecOps & Cloud Security", category: "Security", difficulty: "Hard", credits: 3, popularity: 82 },
  { id: "microservices", name: "Microservices Architecture", category: "Architecture", difficulty: "Hard", credits: 3, popularity: 85 },
];

export const bloomLevels: BloomLevelItem[] = [
  { value: "remember", label: "Remember", description: "Define, list, identify" },
  { value: "understand", label: "Understand", description: "Explain, describe, summarize" },
  { value: "apply", label: "Apply", description: "Solve, implement, use" },
  { value: "analyze", label: "Analyze", description: "Compare, examine, differentiate" },
  { value: "evaluate", label: "Evaluate", description: "Judge, assess, critique" },
  { value: "create", label: "Create", description: "Design, construct, develop" },
];

export const paperTypes: OptionItem[] = [
  { value: "important", label: "Important Topics Focus", description: "Focus on high-frequency topics" },
  { value: "balanced", label: "Balanced Paper", description: "Even distribution across topics" },
  { value: "challenging", label: "Challenging Paper", description: "More analytical questions" },
];

export const questionTypes: OptionItem[] = [
  { value: "short", label: "Short Questions", description: "2-5 marks, concise answers" },
  { value: "long", label: "Long Questions", description: "10-15 marks, detailed answers" },
  { value: "mixed", label: "Mixed", description: "Combination of short and long" },
];

export const categories: string[] = [
  "All",
  "AWS",
  "DevOps",
  "Containers",
  "Systems",
  "Security",
  "Observability",
  "Architecture",
];

export const quickStats: QuickStatItem[] = [
  { label: "Total Papers Generated", value: "1,284", icon: FileText, trend: "+12%" },
  { label: "Active Subjects", value: "18", icon: BookOpen, trend: "+2" },
  { label: "Average Time", value: "2.3 min", icon: Clock, trend: "-18%" },
  { label: "Success Rate", value: "98.5%", icon: TrendingUp, trend: "+0.3%" },
];

export const examPatterns: ExamPatternItem[] = [
  { 
    value: "certification", 
    label: "Certification Exam Pattern", 
    description: "Standard certification format with short questions and domain-based long questions",
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

export const syllabusTemplates: SyllabusTemplateItem[] = [
  {
    id: "aws-template",
    name: "AWS Cloud Fundamentals Template",
    subject: "aws_fundamentals",
    content: `Unit 1: Introduction to Cloud Computing and AWS
- Cloud Computing Models: IaaS, PaaS, SaaS
- AWS Global Infrastructure: Regions, Availability Zones, Edge Locations
- AWS Free Tier and Pricing Models

Unit 2: Core AWS Services
- Amazon EC2 and Auto Scaling
- Amazon S3 and Storage Classes
- Amazon VPC and Networking Basics

Unit 3: AWS Identity and Security
- IAM Users, Groups, Roles and Policies
- Security Groups and NACLs
- AWS Shared Responsibility Model

Unit 4: AWS Management and Monitoring
- AWS CloudWatch and CloudTrail
- AWS Billing and Cost Management
- AWS Well-Architected Framework`,
  },
];

export const initialFormState: FormState = {
  subject: "",
  syllabus: "",
  exam_pattern: "certification",
  pattern_type: "certification",
  total_marks: 70,
  duration_minutes: 180,
  difficulty_distribution: { easy: 30, medium: 40, hard: 30 },
  num_questions: 13,
  organization_name: "",
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
};
