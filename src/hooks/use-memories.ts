"use client";

import { useEffect, useState } from "react";
import { subscribeMemories } from "@/services/memory.service";
import type { Memory } from "@/types/memory";

export function useMemories(userId: string | undefined) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setMemories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeMemories(
      userId,
      (data) => {
        setMemories(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId]);

  return { memories, loading, error };
}
