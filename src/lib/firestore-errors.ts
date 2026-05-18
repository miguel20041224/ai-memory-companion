import { FirebaseError } from "firebase/app";

export function isFirestoreIndexError(error: unknown): boolean {
  if (!(error instanceof FirebaseError)) {
    const message =
      error instanceof Error ? error.message : String(error ?? "");
    return /requires an index|create_composite|FAILED_PRECONDITION/i.test(
      message,
    );
  }

  if (error.code === "failed-precondition") return true;

  return /requires an index|create_composite/i.test(error.message);
}

export function extractFirestoreIndexUrl(error: unknown): string | null {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  const match = message.match(
    /https:\/\/console\.firebase\.google\.com[^\s")\]]+/,
  );
  return match?.[0] ?? null;
}

export function getFirestoreErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Error al conectar con la base de datos.";
  }

  if (isFirestoreIndexError(error)) {
    return "Firestore necesita un índice compuesto para listar tus recuerdos. Despliega los índices del proyecto o usa el enlace de Firebase Console (abajo). Mientras tanto, la app intentará cargar sin orden del servidor.";
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return "No tienes permiso para leer estos datos. Inicia sesión de nuevo.";
      case "unavailable":
        return "Firestore no está disponible. Comprueba tu conexión.";
      case "not-found":
        return "La base de datos no existe o el proyecto Firebase es incorrecto.";
      default:
        return error.message || "Error de Firestore.";
    }
  }

  return error.message || "Error de Firestore.";
}
