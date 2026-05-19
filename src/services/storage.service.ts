import { withTimeout } from "@/lib/async-utils";
import { getStorageErrorMessage } from "@/lib/storage-errors";
import {
  ensureFirebaseSession,
  getFirebaseIdToken,
} from "@/lib/upload/firebase-id-token";
import { extensionForMime } from "@/lib/upload/audio-utils";
import { sanitizeFileName } from "@/lib/upload/validation";
import {
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/upload/constants";
import type { StorageMediaKind } from "@/lib/media/types";
import { isSupabaseConfigured } from "@/supabase/config";

export type { StorageMediaKind } from "@/lib/media/types";

export interface UploadedMedia {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
}

const UPLOAD_TIMEOUT_MS = 3 * 60 * 1000;

let activeXhr: XMLHttpRequest | null = null;

export function cancelActiveUpload(): void {
  try {
    activeXhr?.abort();
  } catch {
    // ignore
  }
  activeXhr = null;
}

function resolveExtension(file: File, kind: StorageMediaKind): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (kind === "audio") return extensionForMime(file.type) || "webm";
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  return "jpg";
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function validateFileBeforeUpload(file: File, kind: StorageMediaKind): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase no está configurado. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!file.size) {
    throw new Error("El archivo está vacío y no se puede subir.");
  }

  const max =
    kind === "audio" ? MAX_AUDIO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > max) {
    throw new Error(
      `El archivo supera el límite de ${Math.round(max / (1024 * 1024))} MB.`,
    );
  }
}

async function requestSignedUpload(
  token: string,
  kind: StorageMediaKind,
  file: File,
  fileName: string,
): Promise<{ signedUrl: string; path: string; publicUrl: string; fileName: string }> {
  const res = await fetch("/api/media/signed-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind,
      fileName,
      mimeType: file.type || "application/octet-stream",
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "No se pudo autorizar la subida.");
  }

  return (await res.json()) as {
    signedUrl: string;
    path: string;
    publicUrl: string;
    fileName: string;
  };
}

function uploadToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    activeXhr = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress?.(Math.min(99, pct));
      }
    };

    xhr.onload = () => {
      activeXhr = null;
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(
        new Error(
          `Supabase rechazó la subida (HTTP ${xhr.status}). Comprueba el bucket y las políticas.`,
        ),
      );
    };

    xhr.onerror = () => {
      activeXhr = null;
      reject(new Error("Error de red al subir el archivo."));
    };

    xhr.onabort = () => {
      activeXhr = null;
      reject(new Error("Subida cancelada."));
    };

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.send(file);
  });
}

export async function uploadMediaFile(
  userId: string,
  file: File,
  kind: StorageMediaKind,
  options?: {
    onProgress?: (percent: number) => void;
    duration?: number;
    maxRetries?: number;
  },
): Promise<UploadedMedia> {
  validateFileBeforeUpload(file, kind);
  await ensureFirebaseSession(userId);

  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;

  const ext = resolveExtension(file, kind);
  const baseName =
    sanitizeFileName(file.name).replace(/\.[^.]+$/, "") || kind;
  const fileName = `${baseName}.${ext}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const token = await getFirebaseIdToken();
      const signed = await requestSignedUpload(token, kind, file, fileName);

      options?.onProgress?.(0);

      await withTimeout(
        uploadToSignedUrl(signed.signedUrl, file, options?.onProgress),
        UPLOAD_TIMEOUT_MS,
        "La subida a Supabase tardó demasiado. Comprueba tu conexión.",
      );

      return {
        downloadUrl: signed.publicUrl,
        storagePath: signed.path,
        fileName: signed.fileName,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        duration: options?.duration,
      };
    } catch (err) {
      lastError = new Error(getStorageErrorMessage(err));
      if (attempt < maxRetries) {
        options?.onProgress?.(0);
        await delay(800 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error("No se pudo subir el archivo.");
}

export async function uploadMultipleImages(
  userId: string,
  files: File[],
  onProgress?: (overallPercent: number) => void,
): Promise<UploadedMedia[]> {
  if (!files.length) return [];

  await ensureFirebaseSession(userId);
  const results: UploadedMedia[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i]!;
    const base = (i / total) * 100;
    const slice = 100 / total;

    const uploaded = await uploadMediaFile(userId, file, "images", {
      onProgress: (p) => onProgress?.(Math.round(base + (p / 100) * slice)),
    });
    results.push(uploaded);
  }

  onProgress?.(100);
  return results;
}

export async function deleteMediaPaths(paths: string[]): Promise<void> {
  if (!paths.length) return;

  const token = await getFirebaseIdToken();
  const res = await fetch("/api/media/delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paths }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "No se pudieron eliminar los archivos.");
  }
}
