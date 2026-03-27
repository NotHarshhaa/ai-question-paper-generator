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
        <div className="container mx-auto relative px-4 py-12 md:py-20 lg:py-32">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-4 md:gap-6">
            <div className="flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Powered by T5 &amp; BERT Models
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              AI-Based Question
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Paper Generator
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl">
              An intelligent system that automatically generates university-style
              question papers using NLP and Machine Learning techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-1 md:mt-2 w-full sm:w-auto">
              <Link href="/generate" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 text-sm md:text-base px-6 md:px-8 w-full sm:w-auto">
                  <Brain className="h-5 w-5" />
                  Generate Paper
                </Button>
              </Link>
              <Link href="/history" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 text-sm md:text-base px-6 md:px-8 w-full sm:w-auto">
                  <FileText className="h-5 w-5" />
                  View History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
            Everything you need to generate professional question papers in minutes.
          </p>
        </div>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="group hover:shadow-lg transition-all duration-300 border-muted"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Four simple steps from syllabus input to a complete question paper.
            </p>
          </div>
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg md:text-xl font-bold mb-3 md:mb-4">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-5 w-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold text-base md:text-lg mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <Heart className="h-4 w-4 text-red-500" />
              Made with passion
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3">
              Meet the Creator
            </h2>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Developed as an academic project to revolutionize question paper generation.
            </p>
          </div>

          <Card className="overflow-hidden border-2 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="grid sm:grid-cols-5 gap-0">
                <div className="sm:col-span-2 from-primary/10 via-primary/5 to-background p-6 md:p-8 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <img
                      src="https://github.com/NotHarshhaa.png"
                      alt="H A R S H H A A"
                      className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-primary/20 object-cover"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">H A R S H H A A</h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-1">DevOps Engineer & MLOps Specialist</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Code className="h-4 w-4" />
                      <span>Platform Engineering Expert</span>
                    </div>
                  </div>

                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                    A passionate DevOps Engineer, MLOps specialist, and Platform Engineering expert on a mission to automate everything, scale cloud infrastructures efficiently, and build internal development platforms that empower engineering teams.
                  </p>

                  <div className="flex flex-wrap gap-3">
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

          <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
            <div className="p-3 md:p-4 rounded-lg bg-muted/50">
              <div className="text-lg md:text-2xl font-bold text-primary mb-1">T5 + BERT</div>
              <div className="text-xs md:text-sm text-muted-foreground">AI Models</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-muted/50">
              <div className="text-lg md:text-2xl font-bold text-primary mb-1">Next.js</div>
              <div className="text-xs md:text-sm text-muted-foreground">Frontend</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-muted/50">
              <div className="text-lg md:text-2xl font-bold text-primary mb-1">Flask</div>
              <div className="text-xs md:text-sm text-muted-foreground">Backend</div>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-muted/50">
              <div className="text-lg md:text-2xl font-bold text-primary mb-1">NLP</div>
              <div className="text-xs md:text-sm text-muted-foreground">Technology</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="bg-primary rounded-2xl p-6 md:p-8 lg:p-12 text-center text-primary-foreground max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 text-sm md:text-base lg:text-lg mb-4 md:mb-6 max-w-xl mx-auto">
            Generate your first AI-powered question paper in minutes. No expensive
            training required — runs on standard CPU.
          </p>
          <Link href="/generate">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-sm md:text-base px-6 md:px-8"
            >
              <Brain className="h-5 w-5" />
              Start Generating
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8 text-center text-xs md:text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            AI Question Paper Generator — Built with Next.js, Flask, T5 &amp; BERT.
          </p>
        </div>
      </footer>
    </div>
  );
}
