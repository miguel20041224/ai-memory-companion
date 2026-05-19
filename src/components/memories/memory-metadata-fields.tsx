"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  MEMORY_CATEGORIES,
  MEMORY_MOODS,
} from "@/lib/memory/constants";
import { cn } from "@/lib/utils";

interface MemoryMetadataFieldsProps {
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  mood: string;
  onMoodChange: (value: string) => void;
  favorite: boolean;
  onFavoriteChange: (value: boolean) => void;
  disabled?: boolean;
}

export function MemoryMetadataFields({
  tagsInput,
  onTagsInputChange,
  category,
  onCategoryChange,
  mood,
  onMoodChange,
  favorite,
  onFavoriteChange,
  disabled = false,
}: MemoryMetadataFieldsProps) {
  return (
    <section className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="text-sm font-medium">Organiza tu recuerdo</p>

      <div className="space-y-2">
        <Label htmlFor="tags">Etiquetas</Label>
        <Input
          id="tags"
          value={tagsInput}
          onChange={(e) => onTagsInputChange(e.target.value)}
          disabled={disabled}
          placeholder="familia, viaje, verano…"
        />
        <p className="text-xs text-muted-foreground">
          Separa con comas. Máximo 12 etiquetas.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Emoción</Label>
        <div className="flex flex-wrap gap-2">
          {MEMORY_MOODS.map((m) => (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => onMoodChange(mood === m ? "" : m)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                mood === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <div className="flex flex-wrap gap-2">
          {MEMORY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => onCategoryChange(category === c ? "" : c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                category === c
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={favorite}
          onChange={(e) => onFavoriteChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Marcar como favorito
      </label>
    </section>
  );
}
