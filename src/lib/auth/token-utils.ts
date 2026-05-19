/** Extrae Bearer token y valida formato JWT compacto antes de llamadas externas. */
export function extractBearerToken(
  authHeader: string | null,
): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function assertFirebaseIdTokenShape(token: string): void {
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => !p.length)) {
    throw new Error(
      "Token de sesión inválido. Cierra sesión, vuelve a iniciar sesión e inténtalo de nuevo.",
    );
  }
}
