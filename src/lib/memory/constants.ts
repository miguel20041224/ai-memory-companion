export const MEMORY_MOODS = [
  "Feliz",
  "Tranquilo",
  "Nostálgico",
  "Agradecido",
  "Triste",
  "Emocionado",
  "Reflexivo",
  "Orgulloso",
] as const;

export type MemoryMood = (typeof MEMORY_MOODS)[number];

export const MEMORY_CATEGORIES = [
  "Familia",
  "Amigos",
  "Viajes",
  "Trabajo",
  "Salud",
  "Hobbies",
  "Hitos",
  "Cotidiano",
] as const;

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

export function parseTagsInput(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,#]/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length >= 2 && t.length <= 32),
    ),
  ].slice(0, 12);
}
