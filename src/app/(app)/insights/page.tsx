"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMemories } from "@/hooks/use-memories";
import { FirestoreErrorPanel } from "@/components/firestore/firestore-error-panel";
import { InsightsPanel } from "@/components/insights/insights-panel";
import { Loader2 } from "lucide-react";

export default function InsightsPage() {
  const { user } = useAuth();
  const { memories, loading, error } = useMemories(user?.uid);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Insights</h2>
        <p className="text-sm text-muted-foreground">
          Estadísticas al instante; insights con IA cuando tú quieras
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <FirestoreErrorPanel error={error} title="No se pudieron cargar los recuerdos" />
      ) : (
        <InsightsPanel memories={memories} />
      )}
    </div>
  );
}
