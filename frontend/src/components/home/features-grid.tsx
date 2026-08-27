import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { features } from "./constants";

export const FeaturesGrid: React.FC = () => {
  return (
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
  );
};
