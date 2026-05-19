"use client";

import { useMemo } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMemories } from "@/hooks/use-memories";
import { FirestoreErrorPanel } from "@/components/firestore/firestore-error-panel";
import { TimelineView } from "@/components/timeline/timeline-view";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { memories, loading, error } = useMemories(user?.uid);

  const favorites = useMemo(
    () => memories.filter((m) => m.favorite),
    [memories],
  );

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Heart className="h-5 w-5 fill-primary text-primary" />
          Favoritos
        </h2>
        <p className="text-sm text-muted-foreground">
          Los momentos que más quieres revivir
        </p>
      </header>
      <TimelineView
        memories={favorites}
        loading={loading}
        error={error}
        showOnThisDay={false}
      />
    </div>
  );
}
