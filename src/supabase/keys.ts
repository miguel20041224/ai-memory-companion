/**
 * Normaliza y valida claves Supabase para evitar errores tipo "Invalid Compact JWS"
 * (p. ej. pegar el JWT Secret en lugar de la service_role key).
 */

export function normalizeSupabaseKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw.trim();
  if (key.toLowerCase().startsWith("bearer ")) {
    key = key.slice(7).trim();
  }
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

export function isCompactJwtFormat(key: string): boolean {
  const parts = key.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export function decodeJwtPayloadUnsafe(
  key: string,
): Record<string, unknown> | null {
  if (!isCompactJwtFormat(key)) return null;
  try {
    const segment = key.split(".")[1]!;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function assertSupabaseServiceRoleKey(key: string): void {
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está definida en el servidor (Vercel → Environment Variables).",
    );
  }

  if (!isCompactJwtFormat(key)) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no es un JWT válido. En Supabase → Settings → API copia la clave «service_role» (empieza por eyJ…), no el «JWT Secret».",
    );
  }

  const payload = decodeJwtPayloadUnsafe(key);
  const role = payload?.role;
  if (role === "anon") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY contiene la clave «anon». Usa la clave «service_role» del mismo panel de API.",
    );
  }
}

export function mapSupabaseKeyError(message: string): string {
  if (/invalid compact jws/i.test(message)) {
    return (
      "Clave de Supabase incorrecta en el servidor. En Vercel define SUPABASE_SERVICE_ROLE_KEY con la clave «service_role» (eyJ…), no el JWT Secret ni la anon key. Luego redeploy."
    );
  }
  return message;
}
