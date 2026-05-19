import { assertFirebaseIdTokenShape } from "@/lib/auth/token-utils";

/**
 * Verifica ID tokens de Firebase Auth sin firebase-admin (vía REST API).
 * Usado en API routes para autorizar uploads a Supabase Storage.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<{ uid: string; email?: string }> {
  assertFirebaseIdTokenShape(idToken);

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY no configurada.");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = (await res.json()) as {
        error?: { message?: string };
      };
      detail = errBody.error?.message ?? "";
    } catch {
      // ignore
    }
    if (/INVALID_ID_TOKEN|invalid/i.test(detail)) {
      throw new Error("Token de Firebase inválido o expirado. Vuelve a iniciar sesión.");
    }
    throw new Error("Token de Firebase inválido o expirado.");
  }

  const data = (await res.json()) as {
    users?: { localId: string; email?: string }[];
  };

  const user = data.users?.[0];
  if (!user?.localId) {
    throw new Error("No autorizado.");
  }

  return { uid: user.localId, email: user.email };
}
