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
        <div className="container mx-auto relative px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
            <div className="flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Powered by T5 &amp; BERT Models
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              AI-Based Question
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Paper Generator
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              An intelligent system that automatically generates university-style
              question papers using NLP and Machine Learning techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link href="/generate">
                <Button size="lg" className="gap-2 text-base px-8">
                  <Brain className="h-5 w-5" />
                  Generate Paper
                </Button>
              </Link>
              <Link href="/history">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  <FileText className="h-5 w-5" />
                  View History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to generate professional question papers in minutes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="group hover:shadow-lg transition-all duration-300 border-muted"
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Four simple steps from syllabus input to a complete question paper.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-5 w-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 text-lg mb-6 max-w-xl mx-auto">
            Generate your first AI-powered question paper in minutes. No expensive
            training required — runs on standard CPU.
          </p>
          <Link href="/generate">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-8"
            >
              <Brain className="h-5 w-5" />
              Start Generating
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            AI Question Paper Generator — Built with Next.js, Flask, T5 &amp; BERT.
            Developed as an academic semester project.
          </p>
        </div>
      </footer>
    </div>
  );
}
