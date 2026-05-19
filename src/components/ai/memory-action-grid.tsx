"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  AI_ACTIONS,
  FULL_ANALYZE_ACTION,
  LOCAL_ACTION,
  type AiActionId,
} from "@/lib/ai/actions";
import { callAiApi } from "@/lib/ai/client";
import { extractLocalMetadata, mergeAnalysis } from "@/lib/ai/local-metadata";
import { searchMemories } from "@/lib/memory-search";
import { serializeMemory } from "@/lib/api-memory";
import { updateMemoryAiMetadata } from "@/services/memory.service";
import type { Memory } from "@/types/memory";
import type { MemoryAnalysis } from "@/types/ai";
import { memoryDisplayContent, memoryTitle } from "@/types/memory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MemoryActionGridProps {
  memory: Memory;
  allMemories: Memory[];
  userId?: string;
  onMemoryUpdated?: (memory: Memory) => void;
  compact?: boolean;
}

interface ActionResult {
  label: string;
  content: string;
  actionId: string;
  similarMemories?: Memory[];
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

export function MemoryActionGrid({
  memory,
  allMemories,
  userId,
  onMemoryUpdated,
  compact = false,
}: MemoryActionGridProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function runGeminiAction(actionId: AiActionId, label: string) {
    setLoadingId(actionId);
    setResult(null);
    try {
      const res = await callAiApi<{ result: string }>(
        "/api/ai/action",
        { action: actionId, memory: serializeMemory(memory) },
        actionId,
      );

      if (!res.ok || !res.data) {
        toast.error(res.error ?? "No se pudo completar la acción.");
        return;
      }

      setResult({ label, content: res.data.result, actionId });
    } finally {
      setLoadingId(null);
    }
  }

  async function runOrganize() {
    if (!userId || !onMemoryUpdated) {
      toast.error("Inicia sesión para guardar el análisis.");
      return;
    }

    const text = buildAnalyzeText(memory);
    if (!text.trim()) {
      toast.error("Añade texto o descripción antes de organizar.");
      return;
    }

    setLoadingId(FULL_ANALYZE_ACTION.id);
    setResult(null);
    try {
      const res = await callAiApi<MemoryAnalysis>(
        "/api/ai/analyze",
        { text },
        "analyze",
      );

      if (!res.ok || !res.data) {
        toast.error(res.error ?? "No se pudo organizar el recuerdo.");
        return;
      }

      const merged = mergeAnalysis(extractLocalMetadata(text), res.data);
      await updateMemoryAiMetadata(userId, memory.id, merged);
      onMemoryUpdated({
        ...memory,
        aiSummary: merged.summary || undefined,
        aiKeywords: merged.keywords,
        aiEntities: merged.entities,
        emotionalTone: merged.emotionalTone,
      });
      setResult({
        label: FULL_ANALYZE_ACTION.label,
        content: merged.summary || "Memoria organizada y guardada.",
        actionId: FULL_ANALYZE_ACTION.id,
      });
      toast.success("Recuerdo organizado y guardado");
    } finally {
      setLoadingId(null);
    }
  }

  function runSimilar() {
    setLoadingId(LOCAL_ACTION.id);
    const query = [
      memoryDisplayContent(memory),
      ...memory.aiKeywords,
      ...memory.aiEntities,
    ]
      .join(" ")
      .trim();

    const similar = searchMemories(
      allMemories.filter((m) => m.id !== memory.id),
      query || memory.type,
      5,
    );

    if (similar.length === 0) {
      setResult({
        label: LOCAL_ACTION.label,
        content: "No encontré recuerdos relacionados con palabras clave similares.",
        actionId: LOCAL_ACTION.id,
      });
    } else {
      const lines = similar
        .map(
          (m) =>
            `• ${memoryTitle(m)} (${format(m.createdAt, "d MMM yyyy", { locale: es })})`,
        )
        .join("\n");
      setResult({
        label: LOCAL_ACTION.label,
        content: lines,
        actionId: LOCAL_ACTION.id,
        similarMemories: similar,
      });
    }
    setLoadingId(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {AI_ACTIONS.map(({ id, label, description, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            disabled={loadingId !== null}
            className="h-auto flex-col items-start gap-1 px-3 py-3 text-left"
            onClick={() => void runGeminiAction(id, label)}
          >
            {loadingId === id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium leading-tight">{label}</span>
            {!compact && (
              <span className="text-xs font-normal text-muted-foreground">
                {description}
              </span>
            )}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          disabled={loadingId !== null}
          className="h-auto flex-col items-start gap-1 px-3 py-3 text-left"
          onClick={runSimilar}
        >
          {loadingId === LOCAL_ACTION.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LOCAL_ACTION.icon className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm font-medium leading-tight">
            {LOCAL_ACTION.label}
          </span>
          {!compact && (
            <span className="text-xs font-normal text-muted-foreground">
              {LOCAL_ACTION.description}
            </span>
          )}
        </Button>

        {userId && onMemoryUpdated && (
          <Button
            type="button"
            variant="default"
            disabled={loadingId !== null}
            className="h-auto flex-col items-start gap-1 px-3 py-3 text-left"
            onClick={() => void runOrganize()}
          >
            {loadingId === FULL_ANALYZE_ACTION.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FULL_ANALYZE_ACTION.icon className="h-4 w-4" />
            )}
            <span className="text-sm font-medium leading-tight">
              {FULL_ANALYZE_ACTION.label}
            </span>
            {!compact && (
              <span className="text-xs font-normal opacity-90">
                {FULL_ANALYZE_ACTION.description}
              </span>
            )}
          </Button>
        )}
      </div>

      {result && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{result.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {result.content}
            </p>
            {result.similarMemories && result.similarMemories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.similarMemories.map((m) => (
                  <Button key={m.id} variant="secondary" size="sm" asChild>
                    <Link href={`/memories/${m.id}`}>
                      {memoryTitle(m).slice(0, 28)}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
