"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  children?: React.ReactNode;
  className?: string;
  inputLabel: string;
}

export function DropZone({
  accept,
  multiple,
  disabled,
  onFiles,
  children,
  className,
  inputLabel,
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <section
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-all duration-200",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border/80 bg-muted/20 hover:border-primary/40 hover:bg-muted/30",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      }}
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-6 w-6" />
        </span>
        <span className="space-y-1 block">
          <span className="block text-sm font-medium">{inputLabel}</span>
          <span className="block text-xs text-muted-foreground">
            Arrastra aquí o toca para seleccionar
          </span>
        </span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {children}
      </label>
    </section>
  );
}
