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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Syllabus-Based Generation",
    description:
      "Input your syllabus and let AI extract key topics to generate relevant questions automatically.",
  },
  {
    icon: BarChart3,
    title: "PYQ Pattern Analysis",
    description:
      "Analyzes previous year papers to understand question patterns and topic weightage.",
  },
  {
    icon: Brain,
    title: "AI-Powered (T5 + BERT)",
    description:
      "Uses T5 for question generation and BERT for similarity checking and classification.",
  },
  {
    icon: Shield,
    title: "Difficulty Balancing",
    description:
      "Automatically balances questions across Easy, Medium, and Hard difficulty levels.",
  },
  {
    icon: FileText,
    title: "Exam Paper Formatting",
    description:
      "Structures questions into proper exam format with sections, marks, and instructions.",
  },
  {
    icon: Zap,
    title: "PDF Export",
    description:
      "Export the generated question paper as a professional PDF ready for printing.",
  },
];

const steps = [
  { step: "01", title: "Input Syllabus", desc: "Enter your subject syllabus and exam pattern preferences." },
  { step: "02", title: "AI Processes", desc: "NLP extracts topics, AI generates and classifies questions." },
  { step: "03", title: "Smart Selection", desc: "Engine removes duplicates and balances difficulty levels." },
  { step: "04", title: "Get Your Paper", desc: "Download a formatted question paper as PDF." },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="container mx-auto relative px-4 py-8 md:py-12 lg:py-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-3 md:gap-4">
            <div className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              Powered by T5 &amp; BERT Models
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              AI-Based Question
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Paper Generator
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              An intelligent system that automatically generates university-style
              question papers using NLP and Machine Learning techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full sm:w-auto">
              <Link href="/generate" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 text-sm px-4 md:px-6 w-full sm:w-auto">
                  <Brain className="h-4 w-4" />
                  Generate Paper
                </Button>
              </Link>
              <Link href="/question-bank" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 text-sm px-4 md:px-6 w-full sm:w-auto">
                  <Database className="h-4 w-4" />
                  Question Bank
                </Button>
              </Link>
              <Link href="/analytics" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 text-sm px-4 md:px-6 w-full sm:w-auto">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto px-4">
            Everything you need to generate professional question papers in minutes.
          </p>
        </div>
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="group hover:shadow-lg transition-all duration-300 border-muted"
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* New Features Section */}
      <section className="bg-muted/50 py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Advanced Management Tools
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto px-4">
              Take control of your question generation workflow with powerful management features.
            </p>
          </div>
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 md:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Question Bank Management</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                  Build and maintain a comprehensive database of questions with advanced filtering, 
                  categorization, and quality rating system.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Organize questions by subject and difficulty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Rate and review question quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Track usage statistics and patterns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Import/export question collections</span>
                  </div>
                </div>
                <Link href="/question-bank" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Explore Question Bank <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 md:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                  Gain valuable insights into usage patterns, performance metrics, and user behavior 
                  with comprehensive analytics and reporting.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Track generation statistics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Monitor AI performance metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Analyze subject-wise usage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Export detailed reports</span>
                  </div>
                </div>
                <Link href="/analytics" className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View Analytics <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto px-4">
              Four simple steps from syllabus input to a complete question paper.
            </p>
          </div>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm md:text-lg font-bold mb-2 md:mb-3">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-5 -right-3 h-4 w-4 text-muted-foreground" />
                )}
                <h3 className="font-semibold text-sm md:text-base mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground mb-3">
              <Heart className="h-3 w-3 text-red-500" />
              Made with passion
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Meet the Creator
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto px-4">
              Developed as an academic project to revolutionize question paper generation.
            </p>
          </div>

          <Card className="overflow-hidden border-2 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="grid sm:grid-cols-5 gap-0">
                <div className="sm:col-span-2 from-primary/10 via-primary/5 to-background p-4 md:p-6 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-xl opacity-20 animate-pulse" />
                    <img
                      src="https://github.com/NotHarshhaa.png"
                      alt="H A R S H H A A"
                      className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-primary/20 object-cover"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 p-4 md:p-6 flex flex-col justify-center">
                  <div className="mb-3 md:mb-4">
                    <h3 className="text-lg md:text-xl font-bold mb-1">H A R S H H A A</h3>
                    <p className="text-sm text-muted-foreground mb-1">DevOps Engineer &amp; MLOps Specialist</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Code className="h-4 w-4" />
                      <span>Platform Engineering Expert</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 md:mb-4">
                    A passionate DevOps Engineer, MLOps specialist, and Platform Engineering expert on a mission to automate everything, scale cloud infrastructures efficiently, and build internal development platforms that empower engineering teams.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href="https://github.com/NotHarshhaa" target="_blank" rel="noopener noreferrer">
                        <Code className="h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href="https://linkedin.com/in/notharshhaa" target="_blank" rel="noopener noreferrer">
                        <User className="h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href="mailto:contact@harshhaa.dev">
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-center">
            <div className="p-2 md:p-3 rounded-lg bg-muted/50">
              <div className="text-base md:text-lg font-bold text-primary mb-1">T5 + BERT</div>
              <div className="text-xs text-muted-foreground">AI Models</div>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-muted/50">
              <div className="text-base md:text-lg font-bold text-primary mb-1">Next.js</div>
              <div className="text-xs text-muted-foreground">Frontend</div>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-muted/50">
              <div className="text-base md:text-lg font-bold text-primary mb-1">Flask</div>
              <div className="text-xs text-muted-foreground">Backend</div>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-muted/50">
              <div className="text-base md:text-lg font-bold text-primary mb-1">NLP</div>
              <div className="text-xs text-muted-foreground">Technology</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="bg-primary rounded-xl p-4 md:p-6 lg:p-8 text-center text-primary-foreground max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 text-sm md:text-base mb-3 md:mb-4 max-w-xl mx-auto">
            Generate your first AI-powered question paper in minutes. No expensive
            training required — runs on standard CPU.
          </p>
          <Link href="/generate">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-sm px-4 md:px-6"
            >
              <Brain className="h-4 w-4" />
              Start Generating
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-4 md:py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            AI Question Paper Generator — Built with Next.js, Flask, T5 &amp; BERT.
          </p>
        </div>
      </footer>
    </div>
  );
}
