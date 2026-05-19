"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMemories } from "@/hooks/use-memories";
import { FirestoreErrorPanel } from "@/components/firestore/firestore-error-panel";
import { GuidedAiPanel } from "@/components/ai/guided-ai-panel";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const { memories, loading, error } = useMemories(user?.uid);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Acciones inteligentes</h2>
        <p className="text-sm text-muted-foreground">
          Herramientas guiadas sobre tus recuerdos — sin chat libre
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
        <GuidedAiPanel memories={memories} userId={user?.uid} />
      )}
    </div>
  );
}
