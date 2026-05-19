"use client";

import { Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  progress: number;
  label?: string;
  className?: string;
  onCancel?: () => void;
}

export function UploadProgress({
  progress,
  label = "Subiendo archivos…",
  className,
  onCancel,
}: UploadProgressProps) {
  return (
    <section
      className={cn(
        "space-y-3 rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm",
        className,
      )}
    >
      <header className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="shrink-0 tabular-nums font-medium text-foreground">
          {progress}%
        </span>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onCancel}
            aria-label="Cancelar subida"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </header>
      <Progress value={progress} />
    </section>
  );
}
