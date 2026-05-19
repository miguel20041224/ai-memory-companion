export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const timer = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Tiempo de espera al leer la duración del audio."));
    }, 12_000);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la duración del audio."));
    };
    audio.src = url;
  });
}

export function getPreferredAudioMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function extensionForMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

export type MicPermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

export async function queryMicPermission(): Promise<MicPermissionState> {
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return status.state as MicPermissionState;
  } catch {
    return "prompt";
  }
}

export function micErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return "Permiso de micrófono denegado. Actívalo en ajustes del navegador.";
    }
    if (error.name === "NotFoundError") {
      return "No se detectó ningún micrófono en este dispositivo.";
    }
    if (error.name === "NotReadableError") {
      return "El micrófono está en uso por otra aplicación.";
    }
  }
  return "No se pudo acceder al micrófono.";
}
