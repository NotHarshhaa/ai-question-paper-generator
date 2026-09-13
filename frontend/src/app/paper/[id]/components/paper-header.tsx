import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Save,
  Edit3,
  Copy,
  Check,
  FileCode,
  Download,
  Loader2,
  FileText,
  GraduationCap,
  BookOpen,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeneratedPaper } from "@/lib/api";

interface PaperHeaderProps {
  paper: GeneratedPaper;
  isEditing: boolean;
  isSaving: boolean;
  exporting: boolean;
  copied: boolean;
  onEditToggle: (val: boolean) => void;
  onSaveChanges: () => void;
  onCopyText: () => void;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
  onExportDocx?: () => void;
  onExportMoodle?: () => void;
  onExportQti?: () => void;
  onExportGoogleForms?: () => void;
}

export const PaperHeader: React.FC<PaperHeaderProps> = ({
  paper,
  isEditing,
  isSaving,
  exporting,
  copied,
  onEditToggle,
  onSaveChanges,
  onCopyText,
  onExportMarkdown,
  onExportPdf,
  onExportDocx,
  onExportMoodle,
  onExportQti,
  onExportGoogleForms,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{paper.subject}</h1>
            {isEditing && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                Editing Mode
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-3.5 w-3.5" />
            Generated on{" "}
            {new Date(paper.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditToggle(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSaveChanges}
              disabled={isSaving}
              className="gap-1.5"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditToggle(true)}
              className="gap-1.5"
            >
              <Edit3 className="h-4 w-4 text-primary" />
              Edit Paper
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyText}
              className="gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </Button>
            {onExportDocx && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportDocx}
                className="gap-1.5 text-xs border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                title="Download Microsoft Word (.docx) Exam"
              >
                <FileText className="h-3.5 w-3.5" />
                Word
              </Button>
            )}
            {onExportMoodle && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportMoodle}
                className="gap-1.5 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                title="Download Moodle Quiz XML"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Moodle
              </Button>
            )}
            {onExportQti && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportQti}
                className="gap-1.5 text-xs border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                title="Download Canvas / Blackboard IMS QTI 2.1 Package"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Canvas QTI
              </Button>
            )}
            {onExportGoogleForms && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportGoogleForms}
                className="gap-1.5 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                title="Export Google Forms JSON Schema"
              >
                <Share2 className="h-3.5 w-3.5" />
                G-Forms
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExportMarkdown}
              className="gap-1.5 text-xs text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/10"
              title="Download Markdown (.md)"
            >
              <FileCode className="h-3.5 w-3.5" />
              MD
            </Button>
            <Button
              onClick={onExportPdf}
              disabled={exporting}
              size="sm"
              className="gap-1.5 text-xs shadow-sm bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Export PDF
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
