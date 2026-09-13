"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { Copy, Check, Maximize2, Minimize2, Network } from "lucide-react";
import { Button } from "./button";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const rawId = useId();
  const diagramId = `mermaid_${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart || !chart.trim()) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "var(--font-geist-mono), monospace",
          themeVariables: {
            darkMode: true,
            background: "transparent",
            mainBkg: "#1e1e2e",
            nodeBorder: "#6366f1",
            lineColor: "#94a3b8",
            primaryColor: "#312e81",
            primaryTextColor: "#f8fafc",
            primaryBorderColor: "#6366f1",
            secondaryColor: "#0f172a",
            tertiaryColor: "#1e293b",
          },
        });

        // Clean any residual elements
        const cleanChart = chart.trim();
        const { svg } = await mermaid.render(diagramId, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("Mermaid rendering warning:", err);
          const msg = err instanceof Error ? err.message : "Failed to render diagram";
          setError(msg);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
      const leftover = document.getElementById(diagramId);
      if (leftover) leftover.remove();
    };
  }, [chart, diagramId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative my-4 rounded-xl border border-indigo-500/20 bg-slate-950/80 shadow-md backdrop-blur-sm overflow-hidden transition-all duration-200 ${
        isExpanded ? "fixed inset-4 z-50 flex flex-col bg-slate-950/95" : ""
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-indigo-500/10 bg-indigo-950/20 text-xs font-mono text-indigo-300">
        <div className="flex items-center gap-1.5 font-medium">
          <Network className="h-3.5 w-3.5 text-indigo-400" />
          <span>Architecture Blueprint</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Render canvas */}
      <div
        ref={containerRef}
        className={`p-4 overflow-x-auto flex items-center justify-center min-h-[140px] ${
          isExpanded ? "flex-1 overflow-auto p-8" : ""
        }`}
      >
        {error ? (
          <div className="text-left w-full">
            <p className="text-xs text-amber-400 mb-2 font-mono">⚠️ Diagram format preview:</p>
            <pre className="text-xs font-mono text-slate-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto border border-slate-800">
              {chart}
            </pre>
          </div>
        ) : svgContent ? (
          <div
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:filter [&_svg]:drop-shadow-sm"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-xs text-muted-foreground font-mono animate-pulse flex items-center gap-2">
            <Network className="h-4 w-4 animate-spin text-indigo-400" />
            Rendering architecture topology...
          </div>
        )}
      </div>
    </div>
  );
};
