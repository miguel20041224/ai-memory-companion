import {
  ALLOWED_AUDIO_MIMES,
  ALLOWED_IMAGE_MIMES,
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_MEMORY,
} from "./constants";

export type UploadKind = "image" | "audio";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function validateImageFile(file: File): ValidationResult {
  const ext = extensionOf(file.name);
  if (
    !ALLOWED_IMAGE_MIMES.includes(file.type as (typeof ALLOWED_IMAGE_MIMES)[number]) &&
    !IMAGE_EXTENSIONS.includes(ext as (typeof IMAGE_EXTENSIONS)[number])
  ) {
    return {
      valid: false,
      error: "Formato no válido. Usa JPG, PNG o WebP.",
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `La imagen supera ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }
  if (file.size === 0) {
    return { valid: false, error: "El archivo está vacío." };
  }
  return { valid: true };
}

export function validateAudioFile(file: File): ValidationResult {
  const ext = extensionOf(file.name);
  const typeOk =
    ALLOWED_AUDIO_MIMES.includes(file.type as (typeof ALLOWED_AUDIO_MIMES)[number]) ||
    AUDIO_EXTENSIONS.includes(ext as (typeof AUDIO_EXTENSIONS)[number]) ||
    file.type.startsWith("audio/");

  if (!typeOk) {
    return {
      valid: false,
      error: "Formato no válido. Usa MP3, WAV, M4A o WebM.",
    };
  }
  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      valid: false,
      error: `El audio supera ${MAX_AUDIO_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }
  if (file.size === 0) {
    return { valid: false, error: "El archivo está vacío." };
  }
  return { valid: true };
}

export function validateImageCount(count: number): ValidationResult {
  if (count > MAX_IMAGES_PER_MEMORY) {
    return {
      valid: false,
      error: `Máximo ${MAX_IMAGES_PER_MEMORY} imágenes por recuerdo.`,
    };
  }
  return { valid: true };
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}
