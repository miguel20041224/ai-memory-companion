import { NextResponse } from "next/server";
import {
  isGeminiRateLimitError,
  toUserFacingAiError,
} from "@/lib/ai/gemini-errors";
import { checkRateLimit, getClientIp } from "@/lib/ai/rate-limit";

export type AiRouteKind = "analyze" | "chat" | "insights";

const LIMITS: Record<
  AiRouteKind,
  { maxRequests: number; windowMs: number }
> = {
  analyze: { maxRequests: 15, windowMs: 60 * 60 * 1000 },
  chat: { maxRequests: 30, windowMs: 60 * 60 * 1000 },
  insights: { maxRequests: 8, windowMs: 60 * 60 * 1000 },
};

export function enforceAiRateLimit(
  request: Request,
  kind: AiRouteKind,
): NextResponse | null {
  const ip = getClientIp(request);
  const config = LIMITS[kind];
  const result = checkRateLimit({
    key: `${kind}:${ip}`,
    maxRequests: config.maxRequests,
    windowMs: config.windowMs,
  });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error:
          "Has alcanzado el límite de uso de IA por ahora. Espera un poco antes de volver a intentarlo.",
        code: "RATE_LIMIT",
        retryAfterSec: result.retryAfterSec,
      },
      {
        status: 429,
        headers: result.retryAfterSec
          ? { "Retry-After": String(result.retryAfterSec) }
          : undefined,
      },
    );
  }

  return null;
}

export function aiErrorResponse(error: unknown): NextResponse {
  const status = isGeminiRateLimitError(error) ? 429 : 500;
  const code = status === 429 ? "GEMINI_QUOTA" : "AI_ERROR";

  return NextResponse.json(
    {
      error: toUserFacingAiError(error),
      code,
    },
    { status },
  );
}
