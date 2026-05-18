import { FirebaseNotConfiguredError } from "@/firebase/client";

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseNotConfiguredError) {
    return error.message;
  }

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Credenciales incorrectas. Inténtalo de nuevo.";
    case "auth/email-already-in-use":
      return "Este correo ya está registrado.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    case "auth/network-request-failed":
      return "Error de red. Comprueba tu conexión e inténtalo de nuevo.";
    default:
      return "No se pudo completar la operación. Inténtalo de nuevo.";
  }
}
