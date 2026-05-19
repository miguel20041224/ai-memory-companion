import type { Memory } from "@/types/memory";
import { memoryDisplayContent } from "@/types/memory";

/** Estadísticas locales sin IA — siempre disponibles en Insights. */
export function buildMemoryStats(memories: Memory[]): string {
  const now = new Date();
  const thisMonth = memories.filter(
    (m) =>
      m.createdAt.getFullYear() === now.getFullYear() &&
      m.createdAt.getMonth() === now.getMonth(),
  ).length;

  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = memories.filter(
    (m) =>
      m.createdAt.getFullYear() === prev.getFullYear() &&
      m.createdAt.getMonth() === prev.getMonth(),
  ).length;

  const weekend = memories.filter((m) => {
    const d = m.createdAt.getDay();
    return d === 0 || d === 6;
  }).length;

  const byType = { text: 0, image: 0, audio: 0 };
  for (const m of memories) {
    byType[m.type] += 1;
  }

  const entities: Record<string, number> = {};
  for (const m of memories) {
    for (const e of m.aiEntities) {
      entities[e] = (entities[e] ?? 0) + 1;
    }
  }
  const topEntities = Object.entries(entities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k}(${v})`)
    .join(", ");

  const tones: Record<string, number> = {};
  for (const m of memories) {
    if (m.emotionalTone) {
      tones[m.emotionalTone] = (tones[m.emotionalTone] ?? 0) + 1;
    }
  }
  const topTones = Object.entries(tones)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k}(${v})`)
    .join(", ");

  const withAi = memories.filter((m) => m.aiSummary?.trim()).length;

  return `
Total recuerdos: ${memories.length}
Este mes: ${thisMonth} | Mes anterior: ${lastMonth}
Recuerdos en fin de semana: ${weekend}
Por tipo — texto: ${byType.text}, imagen: ${byType.image}, audio: ${byType.audio}
Con análisis IA: ${withAi}
Entidades frecuentes: ${topEntities || "ninguna (usa «Analizar con IA» en un recuerdo)"}
Tonos emocionales: ${topTones || "sin datos"}
`;
}

export function buildLocalInsightBullets(memories: Memory[]): string[] {
  if (memories.length === 0) return [];

  const now = new Date();
  const thisMonth = memories.filter(
    (m) =>
      m.createdAt.getFullYear() === now.getFullYear() &&
      m.createdAt.getMonth() === now.getMonth(),
  ).length;

  const bullets: string[] = [
    `Tienes ${memories.length} recuerdo${memories.length === 1 ? "" : "s"} guardado${memories.length === 1 ? "" : "s"}.`,
  ];

  if (thisMonth > 0) {
    bullets.push(
      `Este mes has capturado ${thisMonth} momento${thisMonth === 1 ? "" : "s"}.`,
    );
  }

  const images = memories.filter((m) => m.type === "image").length;
  const audios = memories.filter((m) => m.type === "audio").length;
  if (images > 0) {
    bullets.push(`${images} recuerdo${images === 1 ? "" : "s"} incluyen imágenes.`);
  }
  if (audios > 0) {
    bullets.push(`${audios} nota${audios === 1 ? "" : "s"} de voz guardada${audios === 1 ? "" : "s"}.`);
  }

  const withoutAi = memories.filter((m) => !m.aiSummary?.trim()).length;
  if (withoutAi > 0) {
    bullets.push(
      `${withoutAi} recuerdo${withoutAi === 1 ? "" : "s"} sin análisis IA — puedes mejorarlos desde el detalle.`,
    );
  }

  return bullets;
}

export function recentMemorySnippets(memories: Memory[], limit = 30): string {
  return memories
    .slice(0, limit)
    .map((m) => m.aiSummary?.trim() || memoryDisplayContent(m))
    .filter(Boolean)
    .join("\n- ");
}
