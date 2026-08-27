import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { steps } from "./constants";

export const HowItWorks: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <Card
            key={s.step}
            className="border-l-4 border-l-primary hover:shadow-md hover:border-primary/50 transition-all bg-card/80 backdrop-blur"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
                  {s.step}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Step {s.step}
                </span>
              </div>
              <h3 className="font-bold text-base leading-snug">{s.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
