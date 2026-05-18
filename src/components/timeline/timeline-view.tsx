"use client";

import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import type { Memory } from "@/types/memory";
import { FirestoreErrorPanel } from "@/components/firestore/firestore-error-panel";
import { MemoryCard } from "@/components/memories/memory-card";

function groupLabel(date: Date): string {
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  if (isThisWeek(date, { weekStartsOn: 1 })) return "Esta semana";
  if (isThisYear(date)) return format(date, "MMMM", { locale: es });
  return format(date, "MMMM yyyy", { locale: es });
}

function groupMemories(memories: Memory[]): Map<string, Memory[]> {
  const groups = new Map<string, Memory[]>();
  for (const memory of memories) {
    const label = groupLabel(memory.createdAt);
    const list = groups.get(label) ?? [];
    list.push(memory);
    groups.set(label, list);
  }
  return groups;
}

interface TimelineViewProps {
  memories: Memory[];
  loading: boolean;
  error: unknown;
}

export function TimelineView({ memories, loading, error }: TimelineViewProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <FirestoreErrorPanel
        error={error}
        title="No se pudo cargar la línea de tiempo"
      />
    );
  }

  if (memories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">Aún no hay recuerdos.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Toca <strong className="text-foreground">Nuevo</strong> para capturar tu
          primer momento.
        </p>
      </div>
    );
  }

  const groups = groupMemories(memories);
  let cardIndex = 0;

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([label, items]) => (
        <section key={label}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </h2>
          <div className="space-y-3">
            {items.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                index={cardIndex++}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
