export function isGeminiRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /429|quota|rate.?limit|RESOURCE_EXHAUSTED|too many requests/i.test(
    msg,
  );
}

export function isGeminiUnavailableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /503|UNAVAILABLE|overloaded|timeout/i.test(msg);
}

export function toUserFacingAiError(error: unknown): string {
  if (isGeminiRateLimitError(error)) {
    return "La IA está muy solicitada ahora mismo. Espera unos minutos e inténtalo de nuevo.";
  }
  if (isGeminiUnavailableError(error)) {
    return "El servicio de IA no está disponible temporalmente. Inténtalo más tarde.";
  }
  if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
    return "La función de IA no está configurada en el servidor.";
  }
  return "No se pudo completar la solicitud de IA. Inténtalo de nuevo.";
}
