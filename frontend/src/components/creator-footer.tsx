import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CreatorFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Creator Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl" />
            <Image
              src="https://github.com/NotHarshhaa.png"
              alt="H A R S H H A A"
              width={120}
              height={120}
              className="relative rounded-full border-4 border-background shadow-lg"
              priority
            />
          </div>
          
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            H A R S H H A A
          </h3>
          
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mb-6">
            A passionate DevOps Engineer, MLOps specialist, and Platform Engineering expert on a mission to automate everything, scale cloud infrastructures efficiently, and build internal development platforms that empower engineering teams.
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/NotHarshhaa"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://linkedin.com/in/harshhaa"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://twitter.com/NotHarshhaa"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Twitter
              </a>
            </Button>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="font-medium">
            AI Question Paper Generator — Built with Next.js, Flask, T5 &amp; BERT
          </p>
          <p>
            Developed as an academic semester project demonstrating NLP, Machine Learning, and AI in Education
          </p>
          <p className="text-xs">
            © {new Date().getFullYear()} All rights reserved. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
