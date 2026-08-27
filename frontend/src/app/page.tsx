import Link from "next/link";
import {
  Brain,
  FileText,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  Mail,
  User,
  Code,
  Heart,
  Database,
  TrendingUp,
  CheckCircle,
  KeyRound,
  Edit3,
  FileCode,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
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

const steps = [
  { step: "01", title: "Select & Configure", desc: "Choose your subject or paste syllabus text with marks & difficulty preferences." },
  { step: "02", title: "AI Generation", desc: "NLP extracts key topics; T5 and PYQ engines generate candidate questions." },
  { step: "03", title: "Smart Balancing", desc: "BERT removes duplicates and structures sections into standard exam format." },
  { step: "04", title: "Customize & Export", desc: "Review, edit inline, view model solution keys, and export to PDF or Markdown." },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="container mx-auto relative px-4 py-12 md:py-20 lg:py-24 max-w-6xl">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-4 md:gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/80 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>AI-Powered DevOps &amp; AWS Certification Question Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Intelligent Question Paper
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                &amp; Practice Generator
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Generate standardized university and certification exam papers with automated topic extraction, difficulty balancing, interactive question editing, and complete teacher answer keys.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full sm:w-auto">
              <Link href="/generate">
                <Button size="lg" className="gap-2 text-sm px-6 shadow-md">
                  <Brain className="h-4 w-4" />
                  Generate Paper
                </Button>
              </Link>
              <Link href="/question-bank">
                <Button size="lg" variant="outline" className="gap-2 text-sm px-6">
                  <Database className="h-4 w-4 text-primary" />
                  Question Bank (2.5K+)
                </Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="outline" className="gap-2 text-sm px-6">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Analytics &amp; Insights
                </Button>
              </Link>
            </div>

            {/* Quick stats chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-4 pt-4 border-t text-center">
              <div className="p-2 rounded-lg bg-muted/40 border">
                <div className="text-lg font-bold text-primary">2,500+</div>
                <div className="text-xs text-muted-foreground">PYQ Questions</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 border">
                <div className="text-lg font-bold text-amber-500">15+</div>
                <div className="text-xs text-muted-foreground">Cloud Domains</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 border">
                <div className="text-lg font-bold text-emerald-500">T5 + BERT</div>
                <div className="text-xs text-muted-foreground">AI Intelligence</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 border">
                <div className="text-lg font-bold text-indigo-500">PDF &amp; MD</div>
                <div className="text-xs text-muted-foreground">Multi-Export</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            End-to-End Capabilities
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Everything You Need for Exams &amp; Practice
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            From automated syllabus parsing and difficulty calibration to interactive editing and model solutions.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="group hover:shadow-md hover:border-primary/40 transition-all duration-300 border bg-card"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base leading-snug">{f.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Advanced Modules Showcase */}
      <section className="bg-muted/40 py-12 md:py-16 border-y">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Explore Our Core Features
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Integrated modules designed for students, instructors, and certification candidates.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Module 1: Question Bank */}
            <Card className="flex flex-col justify-between border shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Database className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">2.5K+ Question Bank</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Browse, filter, and search questions across AWS, Terraform, Docker, Kubernetes, Linux, and CI/CD with full model solutions.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Free-text search &amp; subject filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Model answers &amp; source citations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>One-click Markdown &amp; text copying</span>
                  </li>
                </ul>
                <Link href="/question-bank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline pt-2">
                  Browse Question Bank <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Module 2: Analytics & Insights */}
            <Card className="flex flex-col justify-between border shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">PYQ Analytics &amp; Insights</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Real-time telemetry on subject distributions, difficulty ratios, and top recurring keywords across exams.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Domain-wise question volume metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Cognitive difficulty ratio charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>High-frequency topic tag cloud</span>
                  </li>
                </ul>
                <Link href="/analytics" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline pt-2">
                  View Analytics Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Module 3: Paper Editor & Teacher Keys */}
            <Card className="flex flex-col justify-between border shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Paper Editor &amp; Solutions</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Fine-tune generated exams inline, view grading criteria in Teacher Solution Mode, and export across multiple formats.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Inline text, marks &amp; difficulty editing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Teacher Solution Key &amp; grading rubrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Export to PDF, Markdown &amp; JSON</span>
                  </li>
                </ul>
                <Link href="/generate" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline pt-2">
                  Create New Paper <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            Simple 4-Step Workflow
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            How It Works
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            From raw syllabus text to a formatted, balanced exam paper in seconds.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center text-center p-4 rounded-xl border bg-card/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold mb-3 shadow-sm">
                {s.step}
              </div>
              <h3 className="font-bold text-sm md:text-base mb-1">{s.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creator Section */}
      <section className="bg-muted/30 py-12 md:py-16 border-t">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
              <span>Created by Harshhaa</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Meet the Creator
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              DevOps &amp; MLOps platform built to streamline cloud engineering education.
            </p>
          </div>

          <Card className="overflow-hidden border shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="grid sm:grid-cols-5 gap-6 items-center">
                <div className="sm:col-span-2 flex flex-col items-center justify-center text-center">
                  <img
                    src="https://github.com/NotHarshhaa.png"
                    alt="H A R S H H A A"
                    className="h-28 w-28 md:h-36 md:w-36 rounded-full border-4 border-primary/20 shadow-md object-cover"
                  />
                  <h3 className="text-lg font-bold mt-3">H A R S H H A A</h3>
                  <p className="text-xs text-muted-foreground">DevOps &amp; Platform Engineer</p>
                </div>

                <div className="sm:col-span-3 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Passionate DevOps Engineer and Platform specialist dedicated to automating infrastructure, scaling cloud architectures, and building intelligent developer tools.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
                      <a href="https://github.com/NotHarshhaa" target="_blank" rel="noopener noreferrer">
                        <Code className="h-3.5 w-3.5" /> GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
                      <a href="https://linkedin.com/in/notharshhaa" target="_blank" rel="noopener noreferrer">
                        <User className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
                      <a href="mailto:contact@harshhaa.dev">
                        <Mail className="h-3.5 w-3.5" /> Contact
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 text-primary-foreground shadow-lg space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ready to Generate Your Paper?</h2>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Create AI-powered question papers, explore 2.5K+ practice questions, or analyze domain topic weights.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/generate">
              <Button size="lg" variant="secondary" className="gap-2 font-semibold shadow">
                <Brain className="h-4 w-4" /> Start Generating
              </Button>
            </Link>
            <Link href="/question-bank">
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10">
                <Database className="h-4 w-4 mr-2" /> Explore Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} AI Question Paper Generator — Built with Next.js, Flask, T5 &amp; BERT.</p>
        </div>
      </footer>
    </div>
  );
}
