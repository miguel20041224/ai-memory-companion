import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_MEDIA_BUCKET,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "./config";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase no está configurado en el servidor. Añade NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  adminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

export { SUPABASE_MEDIA_BUCKET };
