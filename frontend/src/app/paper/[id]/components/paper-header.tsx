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
              className="gap-1.5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportMarkdown}
              className="gap-1.5"
              title="Download Markdown"
            >
              <FileCode className="h-4 w-4 text-indigo-500" />
              MD
            </Button>
            <Button
              onClick={onExportPdf}
              disabled={exporting}
              size="sm"
              className="gap-1.5 shadow-sm"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
