"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarHeart, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { Memory } from "@/types/memory";
import { findOnThisDayMemories } from "@/lib/memory/on-this-day";
import { buildMemoryStats, buildStatsBullets } from "@/lib/memory/stats";
import { searchMemories } from "@/lib/memory-search";
import { MemoryCard } from "@/components/memories/memory-card";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExplorePanelProps {
  memories: Memory[];
}

export function ExplorePanel({ memories }: ExplorePanelProps) {
  const [query, setQuery] = useState("");
  const stats = useMemo(() => buildMemoryStats(memories), [memories]);
  const bullets = useMemo(() => buildStatsBullets(stats), [stats]);
  const onThisDay = useMemo(() => findOnThisDayMemories(memories), [memories]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchMemories(memories, query, 8);
  }, [memories, query]);

  if (memories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Guarda recuerdos para explorar estadísticas y buscar momentos.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tu colección</h2>
        <div className="space-y-2">
          {bullets.map((item) => (
            <Card key={item} className="border-border/60 bg-muted/30">
              <CardContent className="p-4 text-sm leading-relaxed">
                {item}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Números</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">{stats.total} recuerdos</Badge>
          <Badge variant="outline">{stats.favorites} favoritos</Badge>
          <Badge variant="outline">{stats.byType.image} fotos</Badge>
          <Badge variant="outline">{stats.byType.audio} audios</Badge>
          <Badge variant="outline">{stats.thisMonth} este mes</Badge>
        </CardContent>
      </Card>

      {stats.topMoods.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Emociones más frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.topMoods.map(({ mood, count }) => (
              <Badge key={mood} variant="secondary">
                {mood} · {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {onThisDay.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarHeart className="h-5 w-5 text-primary" />
            En este día
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "d 'de' MMMM", { locale: es })} — años anteriores
          </p>
          <ul className="space-y-3">
            {onThisDay.map((m, i) => (
              <li key={m.id}>
                <MemoryCard memory={m} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Buscar recuerdos</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Por texto, etiqueta, emoción o mes…"
            className="pl-9"
          />
        </div>
        {query.trim() && searchResults.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay coincidencias para «{query}».
          </p>
        )}
        {searchResults.length > 0 && (
          <ul className="space-y-3">
            {searchResults.map((m, i) => (
              <li key={m.id}>
                <MemoryCard memory={m} index={i} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}
