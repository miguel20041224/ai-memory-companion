"use client";

import type { Memory } from "@/types/memory";
import { MemoryActionGrid } from "@/components/ai/memory-action-grid";
import { Label } from "@/components/ui/label";

interface MemoryAiActionsProps {
  memory: Memory;
  allMemories: Memory[];
  userId: string;
  onUpdated: (memory: Memory) => void;
}

export function MemoryAiActions({
  memory,
  allMemories,
  userId,
  onUpdated,
}: MemoryAiActionsProps) {
  return (
    <section className="space-y-3">
      <Label>Acciones inteligentes</Label>
      <MemoryActionGrid
        memory={memory}
        allMemories={allMemories}
        userId={userId}
        onMemoryUpdated={onUpdated}
        compact
      />
    </section>
  );
}
