"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ImageIcon, Mic, Type } from "lucide-react";
import { motion } from "framer-motion";
import type { Memory } from "@/types/memory";
import { memoryDisplayContent } from "@/types/memory";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const typeIcons = {
  text: Type,
  image: ImageIcon,
  audio: Mic,
} as const;

interface MemoryCardProps {
  memory: Memory;
  index?: number;
}

export function MemoryCard({ memory, index = 0 }: MemoryCardProps) {
  const Icon = typeIcons[memory.type];
  const preview = memory.aiSummary ?? memoryDisplayContent(memory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/memories/${memory.id}`}>
        <Card className="transition-colors hover:border-primary/30 hover:bg-card/90">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <time className="text-xs" dateTime={memory.createdAt.toISOString()}>
                {format(memory.createdAt, "d MMM yyyy, HH:mm", { locale: es })}
              </time>
            </div>
            {memory.emotionalTone && (
              <Badge variant="secondary">{memory.emotionalTone}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <CardTitle className="line-clamp-2 text-base font-medium leading-snug">
              {preview}
            </CardTitle>
            {memory.aiKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {memory.aiKeywords.slice(0, 4).map((kw) => (
                  <Badge key={kw} variant="outline">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
