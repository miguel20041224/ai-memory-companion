import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Memory } from "@/types/memory";
import { memoryDisplayContent } from "@/types/memory";

const MAX_CONTENT_CHARS = 480;

/** Contexto compacto para prompts — limita tokens de entrada. */
export function buildMemoryContextText(memory: Memory): string {
  const body = memoryDisplayContent(memory).trim();
  const snippet =
    body.length > MAX_CONTENT_CHARS
      ? `${body.slice(0, MAX_CONTENT_CHARS)}…`
      : body;

  const mediaNote =
    memory.type === "image"
      ? "Incluye imágenes."
      : memory.type === "audio"
        ? `Nota de voz${memory.duration ? ` (${Math.round(memory.duration)}s)` : ""}.`
        : "";

  return [
    `Fecha: ${format(memory.createdAt, "d MMM yyyy", { locale: es })}`,
    `Tipo: ${memory.type}`,
    mediaNote,
    `Contenido: ${snippet || "(sin texto)"}`,
    memory.aiKeywords.length > 0
      ? `Etiquetas: ${memory.aiKeywords.slice(0, 6).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
