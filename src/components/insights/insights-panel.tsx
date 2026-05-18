"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Memory } from "@/types/memory";
import { serializeMemory } from "@/lib/api-memory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsPanelProps {
  memories: Memory[];
}

function parseBulletInsights(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function InsightsPanel({ memories }: InsightsPanelProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [monthlySummary, setMonthlySummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memories: memories.map(serializeMemory),
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Error al cargar insights");
      }

      const data = (await res.json()) as {
        insights: string;
        monthlySummary: string;
      };
      setInsights(parseBulletInsights(data.insights));
      setMonthlySummary(data.monthlySummary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los insights.",
      );
    } finally {
      setLoading(false);
    }
  }, [memories]);

  useEffect(() => {
    if (memories.length > 0) {
      void fetchInsights();
    }
  }, [memories, fetchInsights]);

  if (memories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Guarda más recuerdos para descubrir patrones en tu vida.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tus insights</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchInsights()}
          disabled={loading}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Actualizar
        </Button>
      </div>

      {loading && insights.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {monthlySummary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Resumen del mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {monthlySummary}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {insights.map((item, i) => (
          <motion.div
            key={`${i}-${item.slice(0, 20)}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="border-primary/10 bg-primary/5">
              <CardContent className="p-4 text-sm leading-relaxed">
                {item}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
