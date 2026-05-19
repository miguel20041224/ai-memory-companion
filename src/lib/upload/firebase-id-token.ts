import { getFirebaseAuth } from "@/firebase/client";

/** Token fresco de Firebase para autorizar API routes de media. */
export async function getFirebaseIdToken(): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("No hay sesión activa. Inicia sesión para subir archivos.");
  }
  return user.getIdToken(true);
}

export async function ensureFirebaseSession(expectedUid: string): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user?.uid) {
    throw new Error("No hay sesión activa.");
  }
  if (user.uid !== expectedUid) {
    throw new Error("La sesión no coincide con el usuario actual.");
  }
  await user.getIdToken(true);
}
