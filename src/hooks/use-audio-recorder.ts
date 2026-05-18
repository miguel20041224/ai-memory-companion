"use client";

import { useCallback, useRef, useState } from "react";
import {
  extensionForMime,
  getPreferredAudioMimeType,
  micErrorMessage,
} from "@/lib/upload/audio-utils";

export type RecorderStatus = "idle" | "recording" | "stopped" | "error";

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Tu navegador no soporta grabación de audio.");
      setStatus("error");
      return;
    }

    const mimeType = getPreferredAudioMimeType();
    if (!mimeType && typeof MediaRecorder === "undefined") {
      setError("Grabación no disponible en este dispositivo.");
      setStatus("error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = () => {
        setError("Error durante la grabación.");
        setStatus("error");
        stopTracks();
      };

      recorder.start(200);
      startTimeRef.current = Date.now();
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 200);
      setStatus("recording");
    } catch (err) {
      setError(micErrorMessage(err));
      setStatus("error");
      stopTracks();
    }
  }, [stopTracks]);

  const stopRecording = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        stopTracks();
        setStatus("idle");
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        stopTracks();
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const ext = extensionForMime(type);
        const file = new File([blob], `grabacion-${Date.now()}.${ext}`, {
          type,
          lastModified: Date.now(),
        });
        setStatus("stopped");
        resolve(file);
      };

      recorder.stop();
    });
  }, [stopTracks]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    stopTracks();
    setStatus("idle");
    setDuration(0);
    setError(null);
  }, [stopTracks]);

  const reset = useCallback(() => {
    cancelRecording();
    setStatus("idle");
  }, [cancelRecording]);

  return {
    status,
    error,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
    isRecording: status === "recording",
  };
}
