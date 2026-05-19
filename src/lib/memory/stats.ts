import type { Memory } from "@/types/memory";
import { memoryMood, memoryTags } from "@/types/memory";

export interface MemoryStatsSummary {
  total: number;
  thisMonth: number;
  lastMonth: number;
  favorites: number;
  byType: { text: number; image: number; audio: number };
  topMoods: { mood: string; count: number }[];
  topTags: { tag: string; count: number }[];
  topCategories: { category: string; count: number }[];
}

export function buildMemoryStats(memories: Memory[]): MemoryStatsSummary {
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

  const byType = { text: 0, image: 0, audio: 0 };
  const moodCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  for (const m of memories) {
    byType[m.type] += 1;
    const mood = memoryMood(m);
    if (mood) moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
    if (m.category) {
      categoryCounts[m.category] =
        (categoryCounts[m.category] ?? 0) + 1;
    }
    for (const tag of memoryTags(m)) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  return {
    total: memories.length,
    thisMonth,
    lastMonth,
    favorites: memories.filter((m) => m.favorite).length,
    byType,
    topMoods: Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mood, count]) => ({ mood, count })),
    topTags: Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count })),
    topCategories: Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count })),
  };
}

export function buildStatsBullets(stats: MemoryStatsSummary): string[] {
  if (stats.total === 0) return [];

  const bullets = [
    `Tienes ${stats.total} recuerdo${stats.total === 1 ? "" : "s"} en tu colección.`,
  ];

  if (stats.thisMonth > 0) {
    bullets.push(
      `Este mes has guardado ${stats.thisMonth} momento${stats.thisMonth === 1 ? "" : "s"}.`,
    );
  }
  if (stats.favorites > 0) {
    bullets.push(
      `${stats.favorites} marcado${stats.favorites === 1 ? "" : "s"} como favorito.`,
    );
  }
  if (stats.byType.image > 0) {
    bullets.push(`${stats.byType.image} con fotografías.`);
  }
  if (stats.byType.audio > 0) {
    bullets.push(`${stats.byType.audio} nota${stats.byType.audio === 1 ? "" : "s"} de voz.`);
  }

  return bullets;
}
