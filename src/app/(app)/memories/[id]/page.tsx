"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { deleteMemory, getMemory } from "@/services/memory.service";
import type { Memory } from "@/types/memory";
import {
  memoryDisplayContent,
  memoryPrimaryImageUrl,
} from "@/types/memory";
import { AudioPlayerPreview } from "@/components/upload/audio-player-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || !params.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    void getMemory(user.uid, params.id)
      .then((m) => {
        setMemory(m);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setLoadError(
          err instanceof Error ? err.message : "No se pudo cargar el recuerdo.",
        );
        setLoading(false);
      });
  }, [user, params.id]);

  async function handleDelete() {
    if (!user || !memory) return;
    if (!confirm("¿Eliminar este recuerdo?")) return;
    setDeleting(true);
    try {
      await deleteMemory(user.uid, memory);
      router.push("/timeline");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  if (loadError) {
    return (
      <p className="py-12 text-center text-sm text-destructive" role="alert">
        {loadError}
      </p>
    );
  }

  if (!memory) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Recuerdo no encontrado.
      </p>
    );
  }

  const body = memoryDisplayContent(memory);
  const imageUrls =
    memory.mediaUrls?.length
      ? memory.mediaUrls
      : memoryPrimaryImageUrl(memory)
        ? [memoryPrimaryImageUrl(memory)!]
        : [];

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Volver</span>
        </Button>
        <time className="text-sm text-muted-foreground">
          {format(memory.createdAt, "EEEE d MMMM yyyy, HH:mm", { locale: es })}
        </time>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-snug">
            {memory.aiSummary ?? body}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {body && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          )}

          {memory.type === "image" && imageUrls.length > 0 && (
            <ul
              className={
                imageUrls.length === 1
                  ? "grid grid-cols-1"
                  : "grid grid-cols-2 gap-2"
              }
            >
              {imageUrls.map((url) => (
                <li
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-xl sm:aspect-video"
                >
                  <Image
                    src={url}
                    alt="Recuerdo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 100vw, 512px"
                  />
                </li>
              ))}
            </ul>
          )}

          {memory.type === "audio" && memory.mediaUrl && (
            <AudioPlayerPreview
              src={memory.mediaUrl}
              duration={memory.duration}
              fileName={memory.fileName}
            />
          )}

          {(memory.fileName || memory.fileSize) && (
            <p className="text-xs text-muted-foreground">
              {memory.fileName}
              {memory.fileSize
                ? ` · ${(memory.fileSize / 1024).toFixed(0)} KB`
                : ""}
              {memory.duration
                ? ` · ${Math.round(memory.duration)}s`
                : ""}
            </p>
          )}

          <section className="flex flex-wrap gap-2">
            {memory.emotionalTone && (
              <Badge>{memory.emotionalTone}</Badge>
            )}
            {memory.aiKeywords.map((kw) => (
              <Badge key={kw} variant="outline">
                {kw}
              </Badge>
            ))}
          </section>

          {memory.aiEntities.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Entidades: {memory.aiEntities.join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full"
        onClick={() => void handleDelete()}
        disabled={deleting}
      >
        <Trash2 className="h-4 w-4" />
        {deleting ? "Eliminando…" : "Eliminar recuerdo"}
      </Button>
    </section>
  );
}
