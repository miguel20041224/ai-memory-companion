import { fetchWithTimeout } from "@/lib/async-utils";

export interface AiFetchResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
  code?: string;
  retryAfterSec?: number;
}

interface AiErrorBody {
  error?: string;
  code?: string;
  retryAfterSec?: number;
}

const MIN_INTERVAL_MS: Record<string, number> = {
  analyze: 5_000,
  action: 4_000,
  summarize: 4_000,
  title: 4_000,
  emotion: 4_000,
  reflection: 4_000,
  insights: 15_000,
};

const lastCallAt = new Map<string, number>();

function checkClientCooldown(action: string): string | null {
  const minMs = MIN_INTERVAL_MS[action] ?? 3_000;
  const last = lastCallAt.get(action) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < minMs) {
    const waitSec = Math.ceil((minMs - elapsed) / 1000);
    return `Espera ${waitSec}s antes de volver a usar la IA.`;
  }
  lastCallAt.set(action, Date.now());
  return null;
}

export async function callAiApi<T>(
  path: string,
  body: unknown,
  action: string,
): Promise<AiFetchResult<T>> {
  const cooldown = checkClientCooldown(action);
  if (cooldown) {
    return { ok: false, error: cooldown, status: 429, code: "CLIENT_COOLDOWN" };
  }

  try {
    const res = await fetchWithTimeout(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeoutMs: 90_000,
    });

    const json = (await res.json()) as T & AiErrorBody;

    if (!res.ok) {
      return {
        ok: false,
        error: json.error ?? "Error en la solicitud de IA",
        status: res.status,
        code: json.code,
        retryAfterSec: json.retryAfterSec,
      };
    }

    return { ok: true, data: json as T, status: res.status };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servidor de IA.",
      status: 0,
    };
  }
}
