import type { Memory } from "@/types/memory";

/** Recuerdos del mismo día y mes en años anteriores. */
export function findOnThisDayMemories(
  memories: Memory[],
  referenceDate: Date = new Date(),
): Memory[] {
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();
  const year = referenceDate.getFullYear();

  return memories
    .filter((m) => {
      const d = m.createdAt;
      return (
        d.getMonth() === month &&
        d.getDate() === day &&
        d.getFullYear() < year
      );
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function groupMemoriesByYear(
  memories: Memory[],
): Map<number, Memory[]> {
  const groups = new Map<number, Memory[]>();
  for (const m of memories) {
    const y = m.createdAt.getFullYear();
    const list = groups.get(y) ?? [];
    list.push(m);
    groups.set(y, list);
  }
  return new Map(
    [...groups.entries()].sort((a, b) => b[0] - a[0]),
  );
}
