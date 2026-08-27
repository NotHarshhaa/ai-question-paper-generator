import { toast } from "sonner";
import { api, GeneratedPaper } from "@/lib/api";

export async function exportPaperPdf(
  paper: GeneratedPaper,
  setExporting: (val: boolean) => void
) {
  setExporting(true);
  try {
    const blob = await api.exportPdf(paper.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paper.subject.replace(/\s+/g, "_")}_Question_Paper.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("PDF downloaded successfully!");
  } catch {
    toast.error("Failed to export PDF");
  } finally {
    setExporting(false);
  }
}

export function exportPaperMarkdown(paper: GeneratedPaper) {
  let md = `# ${paper.organization_name ? `${paper.organization_name}\n` : ""}${paper.subject}\n`;
  if (paper.semester) md += `**Semester:** ${paper.semester}\n`;
  md += `**Total Marks:** ${paper.total_marks} | **Duration:** ${paper.duration_minutes} Minutes\n\n---\n\n`;

  paper.sections.forEach((sec) => {
    md += `## ${sec.name} (${sec.total_marks} Marks)\n`;
    if (sec.instructions) md += `*${sec.instructions}*\n\n`;
    sec.questions.forEach((q, qi) => {
      md += `${qi + 1}. **[${q.marks}M - ${q.difficulty.toUpperCase()} | Bloom: ${q.bloom_level || "Understand"}]** ${q.text}\n`;
    });
    md += `\n`;
  });

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${paper.subject.replace(/\s+/g, "_")}_Paper.md`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Markdown file exported!");
}

export function copyPaperPlainText(
  paper: GeneratedPaper,
  setCopied: (val: boolean) => void
) {
  let text = `${paper.subject} Examination\nTotal Marks: ${paper.total_marks} | Duration: ${paper.duration_minutes} Mins\n\n`;
  paper.sections.forEach((sec) => {
    text += `--- ${sec.name} (${sec.total_marks} Marks) ---\n`;
    sec.questions.forEach((q, i) => {
      text += `Q${i + 1}. (${q.marks}M - ${q.bloom_level || "Understand"}) ${q.text}\n`;
    });
    text += `\n`;
  });

  navigator.clipboard.writeText(text);
  setCopied(true);
  toast.success("Paper copied to clipboard!");
  setTimeout(() => setCopied(false), 2000);
}
