"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMemories } from "@/hooks/use-memories";
import { TimelineView } from "@/components/timeline/timeline-view";
import { cn } from "@/lib/utils";

type Filter = "all" | "favorites";

export default function TimelinePage() {
  const { user } = useAuth();
  const { memories, loading, error } = useMemories(user?.uid);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "favorites") return memories.filter((m) => m.favorite);
    return memories;
  }, [memories, filter]);

  return (
    <div className="space-y-4">
      <header className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Línea de tiempo</h2>
          <p className="text-sm text-muted-foreground">
            Tus momentos, organizados por fecha
          </p>
        </div>
        <div className="flex gap-2">
          {(
            [
              { id: "all" as const, label: "Todos" },
              { id: "favorites" as const, label: "Favoritos" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                filter === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <TimelineView memories={filtered} loading={loading} error={error} />
    </div>
  );
}
