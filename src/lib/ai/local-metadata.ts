import type { MemoryAnalysis } from "@/types/ai";

const STOP_WORDS = new Set([
  "a",
  "al",
  "algo",
  "como",
  "con",
  "de",
  "del",
  "el",
  "en",
  "es",
  "esta",
  "este",
  "fue",
  "fui",
  "ha",
  "hoy",
  "la",
  "las",
  "le",
  "lo",
  "los",
  "me",
  "mi",
  "mis",
  "muy",
  "no",
  "nos",
  "o",
  "para",
  "por",
  "que",
  "se",
  "si",
  "sin",
  "su",
  "sus",
  "te",
  "tu",
  "un",
  "una",
  "uno",
  "y",
  "ya",
  "yo",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * Extrae palabras clave locales sin llamar a ninguna API.
 * Mejora búsqueda básica y etiquetas hasta que el usuario pida análisis con IA.
 */
export function extractLocalMetadata(text: string): MemoryAnalysis {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();

  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  return {
    summary: "",
    keywords,
    entities: [],
  };
}

export function mergeAnalysis(
  base: MemoryAnalysis,
  ai: MemoryAnalysis,
): MemoryAnalysis {
  return {
    summary: ai.summary.trim() || base.summary,
    keywords: ai.keywords.length > 0 ? ai.keywords : base.keywords,
    entities: ai.entities.length > 0 ? ai.entities : base.entities,
    emotionalTone: ai.emotionalTone ?? base.emotionalTone,
    insights: ai.insights?.length ? ai.insights : base.insights,
  };
}
