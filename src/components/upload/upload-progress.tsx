"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  progress: number;
  label?: string;
  className?: string;
}

export function UploadProgress({
  progress,
  label = "Subiendo archivos…",
  className,
}: UploadProgressProps) {
  return (
    <section
      className={cn(
        "space-y-3 rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm",
        className,
      )}
    >
      <header className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{label}</span>
        <span className="ml-auto tabular-nums font-medium text-foreground">
          {progress}%
        </span>
      </header>
      <Progress value={progress} />
    </section>
  );
}
