"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, ImageIcon, Mic, Type } from "lucide-react";
import { motion } from "framer-motion";
import type { Memory } from "@/types/memory";
import {
  memoryMood,
  memoryPrimaryImageUrl,
  memoryTags,
  memoryTitle,
} from "@/types/memory";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  const [imageError, setImageError] = useState(false);
  const Icon = typeIcons[memory.type];
  const preview = memoryTitle(memory);
  const thumb = memoryPrimaryImageUrl(memory);
  const tags = memoryTags(memory);
  const mood = memoryMood(memory);

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
              <Icon className="h-4 w-4 shrink-0" />
              <time className="text-xs" dateTime={memory.createdAt.toISOString()}>
                {format(memory.createdAt, "d MMM yyyy, HH:mm", { locale: es })}
              </time>
            </div>
            <div className="flex items-center gap-1.5">
              {memory.favorite && (
                <Heart
                  className="h-4 w-4 fill-primary text-primary"
                  aria-label="Favorito"
                />
              )}
              {mood && <Badge variant="secondary">{mood}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {memory.type === "image" && thumb && !imageError && (
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                <Image
                  src={thumb}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            <CardTitle className="line-clamp-2 text-base font-medium leading-snug">
              {preview}
            </CardTitle>
            {(tags.length > 0 || memory.category) && (
              <div className="flex flex-wrap gap-1.5">
                {memory.category && (
                  <Badge variant="default" className="text-xs">
                    {memory.category}
                  </Badge>
                )}
                {tags.slice(0, 4).map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs">
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
