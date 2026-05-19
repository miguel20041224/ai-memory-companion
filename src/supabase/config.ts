export const SUPABASE_MEDIA_BUCKET = "memories";

export const SUPABASE_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type SupabasePublicEnvKey = (typeof SUPABASE_PUBLIC_ENV_KEYS)[number];

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
}

export function getMissingSupabasePublicEnvVars(): SupabasePublicEnvKey[] {
  return SUPABASE_PUBLIC_ENV_KEYS.filter((key) => {
    if (key === "NEXT_PUBLIC_SUPABASE_URL") return !getSupabaseUrl();
    return !getSupabaseAnonKey();
  });
}

export function isSupabaseConfigured(): boolean {
  return getMissingSupabasePublicEnvVars().length === 0;
}

export function getSupabasePublicMediaUrl(storagePath: string): string {
  const base = getSupabaseUrl().replace(/\/$/, "");
  const path = storagePath.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${path}`;
}
