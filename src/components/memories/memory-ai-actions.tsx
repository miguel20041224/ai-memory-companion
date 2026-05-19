"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { callAiApi } from "@/lib/ai/client";
import { extractLocalMetadata, mergeAnalysis } from "@/lib/ai/local-metadata";
import { updateMemoryAiMetadata } from "@/services/memory.service";
import type { Memory } from "@/types/memory";
import type { MemoryAnalysis } from "@/types/ai";
import { memoryDisplayContent } from "@/types/memory";
import { Button } from "@/components/ui/button";

interface MemoryAiActionsProps {
  memory: Memory;
  userId: string;
  onUpdated: (memory: Memory) => void;
}

function buildAnalyzeText(memory: Memory): string {
  const body = memoryDisplayContent(memory);
  const mediaNote =
    memory.type === "image"
      ? "El usuario adjuntó imágenes."
      : memory.type === "audio"
        ? `Nota de voz${memory.duration ? ` (${Math.round(memory.duration)}s)` : ""}.`
        : "";
  return [body.trim(), mediaNote].filter(Boolean).join("\n\n");
}

export function MemoryAiActions({
  memory,
  userId,
  onUpdated,
}: MemoryAiActionsProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const hasAi = Boolean(memory.aiSummary?.trim());

  async function handleAnalyze() {
    const text = buildAnalyzeText(memory);
    if (!text.trim()) {
      toast.error("Añade texto o descripción antes de analizar con IA.");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await callAiApi<MemoryAnalysis>(
        "/api/ai/analyze",
        { text },
        "analyze",
      );

      if (!result.ok || !result.data) {
        toast.error(result.error ?? "No se pudo analizar el recuerdo.");
        return;
      }

      const base = extractLocalMetadata(text);
      const merged = mergeAnalysis(base, result.data);

      await updateMemoryAiMetadata(userId, memory.id, merged);
      onUpdated({
        ...memory,
        aiSummary: merged.summary || undefined,
        aiKeywords: merged.keywords,
        aiEntities: merged.entities,
        emotionalTone: merged.emotionalTone,
      });
      toast.success("Recuerdo analizado con IA");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <Button
      type="button"
      variant={hasAi ? "outline" : "default"}
      className="w-full"
      disabled={analyzing}
      onClick={() => void handleAnalyze()}
    >
      {analyzing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {analyzing
        ? "Analizando con IA…"
        : hasAi
          ? "Volver a analizar con IA"
          : "Analizar con IA"}
    </Button>
  );
}
