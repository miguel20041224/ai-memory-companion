"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { formatDuration } from "@/lib/upload/audio-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerPreviewProps {
  src: string;
  duration?: number;
  fileName?: string;
  className?: string;
}

export function AudioPlayerPreview({
  src,
  duration: durationProp,
  fileName,
  className,
}: AudioPlayerPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationProp ?? 0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => {
      if (Number.isFinite(el.duration)) setDuration(el.duration);
    };
    const onEnd = () => setPlaying(false);

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [src]);

  useEffect(() => {
    if (durationProp != null) setDuration(durationProp);
  }, [durationProp]);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  }

  const total = duration || 1;
  const pct = Math.min(100, (current / total) * 100);

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="h-10 w-10 shrink-0 rounded-full"
        onClick={togglePlay}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        <span className="sr-only">{playing ? "Pausar" : "Reproducir"}</span>
      </Button>
      <section className="min-w-0 flex-1 space-y-1">
        {fileName && (
          <p className="truncate text-xs font-medium text-foreground">{fileName}</p>
        )}
        <span
          className="block h-1 overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <span
            className="block h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </span>
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatDuration(current)} / {formatDuration(duration)}
        </p>
      </section>
    </article>
  );
}
