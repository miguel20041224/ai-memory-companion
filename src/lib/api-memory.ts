import type { Memory } from "@/types/memory";

export type SerializedMemory = Omit<Memory, "createdAt"> & {
  createdAt: string;
};

export function serializeMemory(memory: Memory): SerializedMemory {
  return {
    ...memory,
    createdAt: memory.createdAt.toISOString(),
  };
}

export function deserializeMemory(data: SerializedMemory): Memory {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
}

export function deserializeMemories(items: SerializedMemory[]): Memory[] {
  return items.map(deserializeMemory);
}
