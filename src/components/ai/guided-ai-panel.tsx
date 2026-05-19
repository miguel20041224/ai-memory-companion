"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Memory } from "@/types/memory";
import { memoryTitle } from "@/types/memory";
import { MemoryActionGrid } from "@/components/ai/memory-action-grid";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface GuidedAiPanelProps {
  memories: Memory[];
  userId?: string;
}

export function GuidedAiPanel({ memories, userId }: GuidedAiPanelProps) {
  const sorted = useMemo(
    () =>
      [...memories].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    [memories],
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    sorted[0]?.id ?? null,
  );
  const [selectorOpen, setSelectorOpen] = useState(false);

  const selected =
    sorted.find((m) => m.id === selectedId) ?? sorted[0] ?? null;

  if (memories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Guarda recuerdos para usar acciones inteligentes sobre ellos.
      </p>
    );
  }

  if (!selected) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        Elige una acción — cada una usa IA de forma controlada y breve.
      </p>

      <section className="space-y-2">
        <Label>Recuerdo seleccionado</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSelectorOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
          >
            <span className="line-clamp-2 pr-2 font-medium">
              {memoryTitle(selected)}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                selectorOpen && "rotate-180",
              )}
            />
          </button>
          {selectorOpen && (
            <ul
              className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-popover shadow-lg"
              role="listbox"
            >
              {sorted.slice(0, 30).map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={m.id === selected.id}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm hover:bg-accent",
                      m.id === selected.id && "bg-primary/10 text-primary",
                    )}
                    onClick={() => {
                      setSelectedId(m.id);
                      setSelectorOpen(false);
                    }}
                  >
                    <span className="line-clamp-1 font-medium">
                      {memoryTitle(m)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(m.createdAt, "d MMM yyyy", { locale: es })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <MemoryActionGrid
        key={`${selected.id}-${selected.aiSummary ?? ""}`}
        memory={selected}
        allMemories={memories}
        userId={userId}
        onMemoryUpdated={() => {
          /* Firestore actualiza la lista vía useMemories en el padre */
        }}
      />
    </motion.div>
  );
}
