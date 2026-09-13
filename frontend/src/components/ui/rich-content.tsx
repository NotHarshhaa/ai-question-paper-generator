"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Network, Code2 } from "lucide-react";
import { MermaidDiagram } from "./mermaid-diagram";

interface RichContentProps {
  content: string;
  className?: string;
}

export const RichContent: React.FC<RichContentProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Split content by markdown code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-]+)?\s*([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(<TextSection key={`text-${lastIndex}`} text={textBefore} />);
    }

    const language = (match[1] || "code").toLowerCase();
    const codeBody = match[2].trim();
    parts.push(
      <CodeOrDiagramBlock
        key={`code-${match.index}`}
        language={language}
        code={codeBody}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(<TextSection key={`text-${lastIndex}`} text={remainingText} />);
  }

  return <div className={`space-y-3 leading-relaxed ${className}`}>{parts}</div>;
};

const TextSection: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headings: ### or ## or #
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-semibold text-sm text-foreground pt-1.5 pb-0.5">
              {formatInlineStyles(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-bold text-base text-foreground pt-2 pb-1">
              {formatInlineStyles(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        // Bullet points: • or - or *
        if (/^[-•*]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-•*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 text-xs md:text-sm text-muted-foreground">
              <span className="text-primary font-bold mt-1 text-[10px]">•</span>
              <span className="flex-1 leading-normal">{formatInlineStyles(bulletText)}</span>
            </div>
          );
        }

        // Numbered items: 1. or 2.
        const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 text-xs md:text-sm text-muted-foreground">
              <span className="text-primary font-semibold text-xs mt-0.5">{numMatch[1]}</span>
              <span className="flex-1 leading-normal">{formatInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {formatInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
};

const CodeOrDiagramBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const cleanCode = code.trim();
  const isMermaid =
    language === "mermaid" ||
    cleanCode.startsWith("graph ") ||
    cleanCode.startsWith("graph TD") ||
    cleanCode.startsWith("graph LR") ||
    cleanCode.startsWith("flowchart ") ||
    cleanCode.startsWith("flowchart TD") ||
    cleanCode.startsWith("flowchart LR") ||
    cleanCode.startsWith("sequenceDiagram") ||
    cleanCode.startsWith("classDiagram");

  if (isMermaid) {
    return <MermaidDiagram chart={code} />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDiagram =
    language === "ascii" ||
    language === "diagram" ||
    code.includes("+--") ||
    code.includes("|   |") ||
    code.includes("-->");

  return (
    <div className="rounded-xl border border-border/80 overflow-hidden bg-zinc-950 dark:bg-zinc-900 shadow-sm my-2.5">
      {/* Code / Diagram Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900/90 dark:bg-zinc-800/80 border-b border-border/40 text-xs">
        <div className="flex items-center gap-2">
          {/* macOS Style Traffic Dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {isDiagram ? (
            <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold text-[11px]">
              <Network className="h-3.5 w-3.5" />
              <span>ARCHITECTURE DIAGRAM</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-semibold text-[11px] uppercase">
              <Terminal className="h-3.5 w-3.5" />
              <span>{language}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors text-[11px] px-2 py-0.5 rounded hover:bg-zinc-800"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code / ASCII Content */}
      <div className="p-3.5 overflow-x-auto">
        <pre className="font-mono text-xs text-zinc-100 leading-relaxed whitespace-pre font-normal">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

function formatInlineStyles(text: string): React.ReactNode {
  // Format **bold** and `inline-code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary font-medium"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
