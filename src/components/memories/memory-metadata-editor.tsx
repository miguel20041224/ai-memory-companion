"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { parseTagsInput } from "@/lib/memory/constants";
import { updateMemoryMetadata } from "@/services/memory.service";
import type { Memory } from "@/types/memory";
import { memoryMood, memoryTags } from "@/types/memory";
import { MemoryMetadataFields } from "@/components/memories/memory-metadata-fields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MemoryMetadataEditorProps {
  memory: Memory;
  userId: string;
  onUpdated: (memory: Memory) => void;
}

export function MemoryMetadataEditor({
  memory,
  userId,
  onUpdated,
}: MemoryMetadataEditorProps) {
  const [title, setTitle] = useState(memory.title ?? "");
  const [tagsInput, setTagsInput] = useState(memoryTags(memory).join(", "));
  const [category, setCategory] = useState(memory.category ?? "");
  const [mood, setMood] = useState(memoryMood(memory) ?? "");
  const [favorite, setFavorite] = useState(memory.favorite);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const update = {
        title: title.trim() || undefined,
        tags: parseTagsInput(tagsInput),
        category: category || null,
        mood: mood || null,
        favorite,
      };
      await updateMemoryMetadata(userId, memory.id, update);
      onUpdated({
        ...memory,
        title: update.title,
        tags: update.tags,
        category: category || undefined,
        mood: mood || undefined,
        favorite,
      });
      toast.success("Cambios guardados");
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título (opcional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          placeholder="Un título para este momento…"
        />
      </div>

      <MemoryMetadataFields
        tagsInput={tagsInput}
        onTagsInputChange={setTagsInput}
        category={category}
        onCategoryChange={setCategory}
        mood={mood}
        onMoodChange={setMood}
        favorite={favorite}
        onFavoriteChange={setFavorite}
        disabled={saving}
      />

      <Button
        type="button"
        className="w-full"
        disabled={saving}
        onClick={() => void handleSave()}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Guardar organización
      </Button>
    </section>
  );
}
