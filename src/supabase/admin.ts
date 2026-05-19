import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_MEDIA_BUCKET,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "./config";
import {
  assertSupabaseServiceRoleKey,
  normalizeSupabaseKey,
} from "./keys";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = getSupabaseUrl();
  const serviceKey = normalizeSupabaseKey(getSupabaseServiceRoleKey());

  if (!url) {
    throw new Error(
      "Supabase no está configurado en el servidor. Añade NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  assertSupabaseServiceRoleKey(serviceKey);

  adminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

export { SUPABASE_MEDIA_BUCKET };
