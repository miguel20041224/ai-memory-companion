export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
/** Subida directa servidor → Supabase (límite body Vercel). */
export const SERVER_DIRECT_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGES_PER_MEMORY = 6;

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/webm",
  "audio/ogg",
] as const;

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "webm", "ogg"] as const;

export const IMAGE_COMPRESS_MAX_WIDTH = 1920;
export const IMAGE_COMPRESS_QUALITY = 0.85;
