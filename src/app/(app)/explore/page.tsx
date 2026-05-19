"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMemories } from "@/hooks/use-memories";
import { FirestoreErrorPanel } from "@/components/firestore/firestore-error-panel";
import { ExplorePanel } from "@/components/explore/explore-panel";
import { Loader2 } from "lucide-react";

export default function ExplorePage() {
  const { user } = useAuth();
  const { memories, loading, error } = useMemories(user?.uid);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Explorar</h2>
        <p className="text-sm text-muted-foreground">
          Estadísticas, búsqueda y momentos del pasado
        </p>
      </header>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <FirestoreErrorPanel
          error={error}
          title="No se pudieron cargar los recuerdos"
        />
      ) : (
        <ExplorePanel memories={memories} />
      )}
    </div>
  );
}
