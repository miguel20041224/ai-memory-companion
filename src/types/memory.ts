export type MemoryType = "text" | "image" | "audio";

export interface MemoryMediaFile {
  url: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  type: MemoryType;
  createdAt: Date;
  title?: string;
  favorite: boolean;
  tags: string[];
  category?: string;
  mood?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaFiles?: MemoryMediaFile[];
  fileName?: string;
  fileSize?: number;
  duration?: number;
  mimeType?: string;
  transcription?: string;
}

export interface MemoryInput {
  content: string;
  type: MemoryType;
  title?: string;
  favorite?: boolean;
  tags?: string[];
  category?: string;
  mood?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaFiles?: MemoryMediaFile[];
  fileName?: string;
  fileSize?: number;
  duration?: number;
  mimeType?: string;
  transcription?: string;
}

export interface MemoryMetadataUpdate {
  title?: string;
  favorite?: boolean;
  tags?: string[];
  category?: string | null;
  mood?: string | null;
}

export function memoryDisplayContent(memory: Memory): string {
  if (memory.type === "audio" && memory.transcription) {
    return memory.transcription;
  }
  return memory.content;
}

export function memoryPrimaryImageUrl(memory: Memory): string | undefined {
  return memory.mediaUrls?.[0] ?? memory.mediaUrl;
}

/** Etiquetas del usuario; compatibilidad con datos legacy (aiKeywords). */
export function memoryTags(memory: Memory): string[] {
  if (memory.tags.length > 0) return memory.tags;
  const legacy = (memory as Memory & { aiKeywords?: string[] }).aiKeywords;
  return legacy ?? [];
}

/** Emoción manual; compatibilidad con emotionalTone legacy. */
export function memoryMood(memory: Memory): string | undefined {
  if (memory.mood?.trim()) return memory.mood.trim();
  const legacy = (memory as Memory & { emotionalTone?: string }).emotionalTone;
  return legacy?.trim() || undefined;
}

export function memoryTitle(memory: Memory): string {
  if (memory.title?.trim()) return memory.title.trim();

  const body = memoryDisplayContent(memory).trim();
  if (body) {
    return body.length > 100 ? `${body.slice(0, 100)}…` : body;
  }

  if (memory.type === "image") return "Recuerdo con imágenes";
  if (memory.type === "audio") return "Nota de voz";
  return "Recuerdo";
}
