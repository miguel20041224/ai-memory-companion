import type { StorageMediaKind } from "@/lib/media/types";
import { sanitizeFileName } from "@/lib/upload/validation";

function uniqueId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export function buildMediaStoragePath(
  userId: string,
  kind: StorageMediaKind,
  fileName: string,
): string {
  const safe = sanitizeFileName(fileName) || kind;
  const folder = kind === "images" ? "images" : "audio";
  return `users/${userId}/${folder}/${Date.now()}-${uniqueId()}-${safe}`;
}

export function isPathOwnedByUser(path: string, userId: string): boolean {
  const normalized = path.replace(/^\/+/, "");
  return (
    normalized.startsWith(`users/${userId}/images/`) ||
    normalized.startsWith(`users/${userId}/audio/`)
  );
}
