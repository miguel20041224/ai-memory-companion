"use client";

import { useCallback, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Memory } from "@/types/memory";
import { serializeMemory } from "@/lib/api-memory";
import { callAiApi } from "@/lib/ai/client";
import {
  buildLocalInsightBullets,
  buildMemoryStats,
} from "@/lib/ai/memory-stats";
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
  const localBullets = buildLocalInsightBullets(memories);
  const localStats = buildMemoryStats(memories);

  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [monthlySummary, setMonthlySummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);

  const fetchAiInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callAiApi<{
        insights: string;
        monthlySummary: string;
      }>(
        "/api/ai/insights",
        { memories: memories.map(serializeMemory) },
        "insights",
      );

      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Error al generar insights");
      }

      setAiInsights(parseBulletInsights(result.data.insights));
      setMonthlySummary(result.data.monthlySummary);
      setAiGenerated(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron generar los insights.",
      );
    } finally {
      setLoading(false);
    }
  }, [memories]);

  if (memories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Guarda más recuerdos para descubrir patrones en tu vida.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Resumen rápido</h2>
        <p className="text-xs text-muted-foreground">
          Estadísticas locales — sin consumir cuota de IA.
        </p>
        <div className="space-y-2">
          {localBullets.map((item) => (
            <Card key={item} className="border-border/60 bg-muted/30">
              <CardContent className="p-4 text-sm leading-relaxed">
                {item}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tus números</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
              {localStats.trim()}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-lg font-semibold">Insights con IA</h2>
          <p className="text-sm text-muted-foreground">
            Genera reflexiones y un resumen del mes solo cuando lo necesites.
          </p>
        </motion.div>

        <Button
          className="w-full"
          size="lg"
          disabled={loading}
          onClick={() => void fetchAiInsights()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Generando con IA…" : "Generar insights con IA"}
        </Button>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading && !aiGenerated && (
          <motion.div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        )}

        {monthlySummary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Resumen del mes (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {monthlySummary}
              </p>
            </CardContent>
          </Card>
        )}

        {aiInsights.length > 0 && (
          <div className="space-y-3">
            {aiInsights.map((item, i) => (
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
        )}
      </section>
    </motion.div>
  );
}
