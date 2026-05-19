import type { Memory } from "@/types/memory";
import { memoryMood, memoryTags, memoryTitle } from "@/types/memory";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function searchMemories(
  memories: Memory[],
  query: string,
  limit = 12,
): Memory[] {
  const q = normalize(query.trim());
  if (!q) return memories.slice(0, limit);

  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = memories.map((memory) => {
    const haystack = normalize(
      [
        memory.content,
        memory.transcription ?? "",
        memory.title ?? "",
        memoryTitle(memory),
        memory.category ?? "",
        memoryMood(memory) ?? "",
        ...memoryTags(memory),
      ].join(" "),
    );

    let score = 0;
    for (const token of tokens) {
      if (haystack.includes(token)) score += 2;
    }
    if (haystack.includes(q)) score += 5;

    const monthMatch = q.match(
      /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/,
    );
    if (monthMatch) {
      const monthNames = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];
      const idx = monthNames.indexOf(monthMatch[1]);
      if (memory.createdAt.getMonth() === idx) score += 4;
    }

    return { memory, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.memory);
}
