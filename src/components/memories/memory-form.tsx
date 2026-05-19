"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Mic, Type } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithTimeout } from "@/lib/async-utils";
import { getStorageErrorMessage } from "@/lib/storage-errors";
import { createMemory } from "@/services/memory.service";
import {
  cancelActiveUpload,
  uploadMediaFile,
  uploadMultipleImages,
} from "@/services/storage.service";
import type { MemoryType } from "@/types/memory";
import type { MemoryAnalysis } from "@/types/ai";
import type { MemoryMediaFile } from "@/types/memory";
import {
  ImageUploader,
  type ImagePreviewItem,
} from "@/components/upload/image-uploader";
import {
  AudioUploader,
  type AudioPreviewState,
} from "@/components/upload/audio-uploader";
import { UploadProgress } from "@/components/upload/upload-progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const types: { value: MemoryType; label: string; icon: typeof Type }[] = [
  { value: "text", label: "Texto", icon: Type },
  { value: "image", label: "Imagen", icon: ImageIcon },
  { value: "audio", label: "Audio", icon: Mic },
];

type SubmitPhase = "idle" | "uploading" | "analyzing" | "saving";

export function MemoryForm() {
  const router = useRouter();
  const { user } = useAuth();
  const cancelledRef = useRef(false);
  const [type, setType] = useState<MemoryType>("text");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImagePreviewItem[]>([]);
  const [audio, setAudio] = useState<AudioPreviewState | null>(null);
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const loading = phase !== "idle";

  function resetMediaForType(next: MemoryType) {
    if (next !== "image") setImages([]);
    if (next !== "audio") {
      if (audio?.previewUrl) URL.revokeObjectURL(audio.previewUrl);
      setAudio(null);
    }
  }

  function handleTypeChange(next: MemoryType) {
    resetMediaForType(next);
    setType(next);
    setError(null);
  }

  function handleCancel() {
    cancelledRef.current = true;
    cancelActiveUpload();
    setPhase("idle");
    setUploadProgress(0);
    toast.info("Operación cancelada");
  }

  function buildAnalyzeText(caption: string, mediaNote: string): string {
    const parts = [caption.trim(), mediaNote.trim()].filter(Boolean);
    return parts.join("\n\n") || caption;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Inicia sesión para guardar recuerdos.");
      return;
    }

    const caption = content.trim();

    if (type === "text" && !caption) {
      setError("Escribe algo sobre tu recuerdo.");
      return;
    }
    if (type === "image" && images.length === 0 && !caption) {
      setError("Añade al menos una imagen o una descripción.");
      return;
    }
    if (type === "audio" && !audio && !caption) {
      setError("Graba o sube un audio, o añade una descripción.");
      return;
    }

    cancelledRef.current = false;
    setError(null);
    setUploadProgress(0);
    try {
      let mediaFiles: MemoryMediaFile[] = [];
      let mediaUrls: string[] = [];
      let primaryUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let duration: number | undefined;
      let mimeType: string | undefined;

      if (type === "image" && images.length > 0) {
        setPhase("uploading");
        setUploadProgress(1);
        const uploaded = await uploadMultipleImages(
          user.uid,
          images.map((i) => i.file),
          (p) => {
            if (!cancelledRef.current) setUploadProgress(p);
          },
        );
        if (cancelledRef.current) return;

        mediaFiles = uploaded.map((u) => ({
          url: u.downloadUrl,
          storagePath: u.storagePath,
          fileName: u.fileName,
          fileSize: u.fileSize,
          mimeType: u.mimeType,
        }));
        mediaUrls = uploaded.map((u) => u.downloadUrl);
        primaryUrl = mediaUrls[0];
        fileName = uploaded.map((u) => u.fileName).join(", ");
        fileSize = uploaded.reduce((s, u) => s + u.fileSize, 0);
        mimeType = uploaded[0]?.mimeType;
      }

      if (type === "audio" && audio) {
        setPhase("uploading");
        setUploadProgress(1);
        const uploaded = await uploadMediaFile(user.uid, audio.file, "audio", {
          onProgress: (p) => {
            if (!cancelledRef.current) setUploadProgress(p);
          },
          duration: audio.duration,
        });
        if (cancelledRef.current) return;

        mediaFiles = [
          {
            url: uploaded.downloadUrl,
            storagePath: uploaded.storagePath,
            fileName: uploaded.fileName,
            fileSize: uploaded.fileSize,
            mimeType: uploaded.mimeType,
            duration: uploaded.duration,
          },
        ];
        mediaUrls = [uploaded.downloadUrl];
        primaryUrl = uploaded.downloadUrl;
        fileName = uploaded.fileName;
        fileSize = uploaded.fileSize;
        duration = uploaded.duration;
        mimeType = uploaded.mimeType;
      }

      setPhase("analyzing");
      setUploadProgress(type === "text" ? 50 : 92);

      const mediaNote =
        type === "image"
          ? `El usuario adjuntó ${images.length} imagen(es).`
          : type === "audio"
            ? `Nota de voz${duration ? ` (${Math.round(duration)}s)` : ""}.`
            : "";

      const analyzeText = buildAnalyzeText(
        caption || (type === "image" ? "Recuerdo con imágenes" : "Nota de voz"),
        mediaNote,
      );

      const analyzeRes = await fetchWithTimeout("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: analyzeText }),
        timeoutMs: 90_000,
      });

      if (cancelledRef.current) return;

      if (!analyzeRes.ok) {
        const err = (await analyzeRes.json()) as { error?: string };
        throw new Error(err.error ?? "Error al analizar con IA");
      }

      const analysis = (await analyzeRes.json()) as MemoryAnalysis;

      setPhase("saving");
      setUploadProgress(98);

      await createMemory(
        user.uid,
        {
          content: caption || analysis.summary,
          type,
          mediaUrl: primaryUrl,
          mediaUrls,
          mediaFiles,
          fileName,
          fileSize,
          duration,
          mimeType,
          transcription: type === "audio" ? caption || undefined : undefined,
        },
        analysis,
      );

      toast.success("Recuerdo guardado");
      router.push("/timeline");
    } catch (err) {
      if (cancelledRef.current) return;
      const message =
        err instanceof Error
          ? getStorageErrorMessage(err)
          : "No se pudo guardar el recuerdo.";
      setError(message);
      toast.error(message);
    } finally {
      if (!cancelledRef.current) {
        setPhase("idle");
        setUploadProgress(0);
      }
    }
  }

  const phaseLabel =
    phase === "uploading"
      ? "Subiendo archivos…"
      : phase === "analyzing"
        ? "Analizando con IA…"
        : phase === "saving"
          ? "Guardando recuerdo…"
          : "";

  const displayProgress =
    phase === "uploading"
      ? uploadProgress
      : phase === "analyzing"
        ? 92
        : phase === "saving"
          ? 98
          : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-2">
        <Label>Tipo de recuerdo</Label>
        <section className="grid grid-cols-3 gap-2">
          {types.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              disabled={loading}
              onClick={() => handleTypeChange(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                type === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </section>
      </section>

      {type === "image" && (
        <ImageUploader items={images} onChange={setImages} disabled={loading} />
      )}

      {type === "audio" && (
        <AudioUploader audio={audio} onChange={setAudio} disabled={loading} />
      )}

      <section className="space-y-2">
        <Label htmlFor="content">
          {type === "text"
            ? "¿Qué quieres recordar?"
            : "Descripción (opcional)"}
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          placeholder={
            type === "audio"
              ? "Transcripción o notas sobre la grabación…"
              : type === "image"
                ? "Describe el momento capturado en las fotos…"
                : "Hoy fui al parque con María y…"
          }
          rows={type === "text" ? 6 : 4}
        />
      </section>

      {loading && (
        <UploadProgress
          progress={displayProgress}
          label={phaseLabel}
          onCancel={handleCancel}
        />
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            {phaseLabel || "Procesando…"}
          </>
        ) : (
          "Guardar recuerdo"
        )}
      </Button>
    </form>
  );
}
