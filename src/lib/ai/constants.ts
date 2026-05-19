import type { MemoryAnalysis } from "@/types/ai";

/** Metadatos vacíos cuando el recuerdo se guarda sin IA. */
export const EMPTY_MEMORY_ANALYSIS: MemoryAnalysis = {
  summary: "",
  keywords: [],
  entities: [],
};
