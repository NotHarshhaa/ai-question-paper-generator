import React from "react";
import Link from "next/link";
import { Sparkles, Brain, Database, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { quickStats } from "./constants";

export const HomeHero: React.FC = () => {
  return (
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

          {/* Metric Cards Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-3xl mt-4 pt-6 border-t">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-l-4 border-l-primary text-left bg-card/80 backdrop-blur">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                      </div>
                      <Icon className="h-5 w-5 text-primary/20 flex-shrink-0" />
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
        </div>
      </div>
    </section>
  );
};
