"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";
import { compressImage, readFileAsDataUrl } from "@/lib/upload/image-compress";
import {
  MAX_IMAGES_PER_MEMORY,
} from "@/lib/upload/constants";
import {
  validateImageCount,
  validateImageFile,
} from "@/lib/upload/validation";
import { DropZone } from "@/components/upload/drop-zone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ImagePreviewItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageUploaderProps {
  items: ImagePreviewItem[];
  onChange: (items: ImagePreviewItem[]) => void;
  disabled?: boolean;
}

export function ImageUploader({ items, onChange, disabled }: ImageUploaderProps) {
  const [processing, setProcessing] = useState(false);

  const addFiles = useCallback(
    async (files: File[]) => {
      const countCheck = validateImageCount(items.length + files.length);
      if (!countCheck.valid) {
        toast.error(countCheck.error);
        return;
      }

      setProcessing(true);
      const next: ImagePreviewItem[] = [...items];

      try {
        for (const raw of files) {
          const validation = validateImageFile(raw);
          if (!validation.valid) {
            toast.error(validation.error);
            continue;
          }

          let file = raw;
          try {
            file = await compressImage(raw);
          } catch {
            file = raw;
          }

          const previewUrl = await readFileAsDataUrl(file);
          next.push({
            id: crypto.randomUUID(),
            file,
            previewUrl,
          });

          if (next.length >= MAX_IMAGES_PER_MEMORY) break;
        }
        onChange(next);
      } finally {
        setProcessing(false);
      }
    },
    [items, onChange],
  );

  function remove(id: string) {
    const removed = items.find((i) => i.id === id);
    onChange(items.filter((i) => i.id !== id));
    if (removed?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  return (
    <section className="space-y-4">
      <DropZone
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        disabled={disabled || processing || items.length >= MAX_IMAGES_PER_MEMORY}
        inputLabel="Añadir imágenes"
        onFiles={(files) => void addFiles(files)}
      >
        {items.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {items.length}/{MAX_IMAGES_PER_MEMORY} imágenes
          </p>
        )}
      </DropZone>

      {items.length > 0 && (
        <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3")}>
          {items.map((item) => (
            <li
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/20"
            >
              <Image
                src={item.previewUrl}
                alt="Vista previa"
                fill
                className="object-cover"
                unoptimized
                sizes="160px"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-90 shadow-md"
                disabled={disabled}
                onClick={() => remove(item.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Quitar imagen</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
