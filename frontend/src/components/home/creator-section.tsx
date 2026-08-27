import React from "react";
import { Heart, Code, User, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CreatorSection: React.FC = () => {
  return (
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
  );
};
