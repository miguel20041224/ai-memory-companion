"use client";

import { useCallback, useEffect, useState } from "react";
import { Mic, Square, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import {
  formatDuration,
  getAudioDuration,
  queryMicPermission,
} from "@/lib/upload/audio-utils";
import { validateAudioFile } from "@/lib/upload/validation";
import { DropZone } from "@/components/upload/drop-zone";
import { AudioPlayerPreview } from "@/components/upload/audio-player-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AudioPreviewState {
  file: File;
  previewUrl: string;
  duration: number;
}

interface AudioUploaderProps {
  audio: AudioPreviewState | null;
  onChange: (audio: AudioPreviewState | null) => void;
  disabled?: boolean;
}

export function AudioUploader({ audio, onChange, disabled }: AudioUploaderProps) {
  const recorder = useAudioRecorder();
  const [micHint, setMicHint] = useState<string | null>(null);

  useEffect(() => {
    void queryMicPermission().then((state) => {
      if (state === "denied") {
        setMicHint("Micrófono bloqueado. Permítelo en ajustes del navegador.");
      } else if (state === "unsupported") {
        setMicHint("Grabación no disponible en este navegador.");
      }
    });
  }, []);

  const setFile = useCallback(
    async (file: File) => {
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      let duration = 0;
      try {
        duration = await getAudioDuration(file);
      } catch {
        toast.warning("No se pudo leer la duración del audio.");
      }

      if (audio?.previewUrl) URL.revokeObjectURL(audio.previewUrl);
      const previewUrl = URL.createObjectURL(file);
      onChange({ file, previewUrl, duration });
    },
    [audio?.previewUrl, onChange],
  );

  function clearAudio() {
    if (audio?.previewUrl) URL.revokeObjectURL(audio.previewUrl);
    onChange(null);
    recorder.reset();
  }

  async function handleStopRecording() {
    const file = await recorder.stopRecording();
    if (!file) {
      toast.info("Grabación cancelada.");
      return;
    }
    await setFile(file);
    toast.success("Audio grabado.");
  }

  return (
    <section className="space-y-4">
      {audio ? (
        <section className="space-y-3">
          <AudioPlayerPreview
            src={audio.previewUrl}
            duration={audio.duration}
            fileName={audio.file.name}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={clearAudio}
          >
            Quitar audio
          </Button>
        </section>
      ) : (
        <>
          <DropZone
            accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/webm,audio/ogg,.mp3,.wav,.m4a,.webm"
            disabled={disabled || recorder.isRecording}
            inputLabel="Seleccionar archivo de audio"
            onFiles={(files) => {
              const file = files[0];
              if (file) void setFile(file);
            }}
          />

          <section className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-center text-sm text-muted-foreground">
              o graba desde el micrófono
            </p>
            {micHint && (
              <p className="text-center text-xs text-amber-500/90">{micHint}</p>
            )}
            {recorder.error && (
              <p className="text-center text-xs text-destructive">{recorder.error}</p>
            )}

            {recorder.isRecording ? (
              <section className="flex w-full flex-col items-center gap-3">
                <span
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full",
                    "bg-destructive/15 text-destructive animate-pulse",
                  )}
                >
                  <Mic className="h-7 w-7" />
                </span>
                <p className="text-lg font-medium tabular-nums">
                  {formatDuration(recorder.duration)}
                </p>
                <section className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={disabled}
                    onClick={() => void handleStopRecording()}
                  >
                    <Square className="h-4 w-4 fill-current" />
                    Detener y guardar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    onClick={recorder.cancelRecording}
                  >
                    Cancelar
                  </Button>
                </section>
              </section>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                disabled={disabled || Boolean(micHint?.includes("no disponible"))}
                onClick={() => void recorder.startRecording()}
              >
                <Mic className="h-4 w-4" />
                Grabar audio
              </Button>
            )}
          </section>
        </>
      )}

      {!audio && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Upload className="h-3.5 w-3.5" />
          MP3, WAV, M4A o WebM · máx. 25 MB
        </p>
      )}
    </section>
  );
}
