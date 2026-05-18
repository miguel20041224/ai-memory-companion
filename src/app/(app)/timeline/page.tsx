"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMemories } from "@/hooks/use-memories";
import { TimelineView } from "@/components/timeline/timeline-view";

export default function TimelinePage() {
  const { user } = useAuth();
  const { memories, loading, error } = useMemories(user?.uid);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Línea de tiempo</h2>
        <p className="text-sm text-muted-foreground">
          Tus momentos, organizados por fecha
        </p>
      </div>
      <TimelineView memories={memories} loading={loading} error={error} />
    </div>
  );
}
