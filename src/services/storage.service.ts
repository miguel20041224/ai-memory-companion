import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTask,
} from "firebase/storage";
import { getFirebaseStorage } from "@/firebase/client";
import { sanitizeFileName } from "@/lib/upload/validation";
import { extensionForMime } from "@/lib/upload/audio-utils";

export interface UploadedMedia {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
}

export type StorageMediaKind = "images" | "audio";

function buildStoragePath(
  userId: string,
  kind: StorageMediaKind,
  fileName: string,
): string {
  const safe = sanitizeFileName(fileName);
  const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  return `users/${userId}/memories/${kind}/${unique}-${safe}`;
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
  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;

  const ext = resolveExtension(file, kind);
  const baseName =
    sanitizeFileName(file.name).replace(/\.[^.]+$/, "") || kind;
  const fileName = `${baseName}.${ext}`;
  const storagePath = buildStoragePath(userId, kind, fileName);
  const storageRef = ref(getFirebaseStorage(), storagePath);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const url = await runUpload(storageRef, file, options?.onProgress);
      return {
        downloadUrl: url,
        storagePath,
        fileName,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        duration: options?.duration,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Error de subida");
      if (attempt < maxRetries) {
        options?.onProgress?.(0);
        await delay(800 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error("No se pudo subir el archivo.");
}

function runUpload(
  storageRef: ReturnType<typeof ref>,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const task: UploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || undefined,
      customMetadata: {
        originalName: sanitizeFileName(file.name),
      },
    });

    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        onProgress?.(pct);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          onProgress?.(100);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      },
    );
  });
}

export async function uploadMultipleImages(
  userId: string,
  files: File[],
  onProgress?: (overallPercent: number) => void,
): Promise<UploadedMedia[]> {
  const results: UploadedMedia[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
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
