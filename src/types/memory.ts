export type MemoryType = "text" | "image" | "audio";

export interface MemoryAiMetadata {
  summary: string;
  keywords: string[];
  entities: string[];
  emotionalTone?: string;
  insights?: string[];
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  type: MemoryType;
  createdAt: Date;
  mediaUrl?: string;
  aiSummary?: string;
  aiKeywords: string[];
  aiEntities: string[];
  emotionalTone?: string;
  transcription?: string;
}

export interface MemoryInput {
  content: string;
  type: MemoryType;
  mediaUrl?: string;
  transcription?: string;
}

export function memoryDisplayContent(memory: Memory): string {
  if (memory.type === "audio" && memory.transcription) {
    return memory.transcription;
  }
  return memory.content;
}
