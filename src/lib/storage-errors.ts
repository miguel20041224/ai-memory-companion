export function getStorageErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;

    if (/supabase|storage|bucket|upload|compact jws|jws/i.test(msg)) {
      if (/invalid compact jws/i.test(msg)) {
        return "Configuración de Supabase incorrecta en el servidor. Usa la clave «service_role» (eyJ…) en SUPABASE_SERVICE_ROLE_KEY, no el JWT Secret. Si el error persiste al subir, redeploy en Vercel.";
      }
      if (/not found|does not exist|Bucket/i.test(msg)) {
        return "Bucket de Supabase no encontrado. Crea el bucket «memories» como público en Supabase Storage.";
      }
      if (/unauthorized|401|jwt|token/i.test(msg)) {
        return "Sin permiso para subir. Verifica SUPABASE_SERVICE_ROLE_KEY y la sesión de Firebase.";
      }
      if (/timeout|tardó demasiado/i.test(msg)) {
        return msg;
      }
      if (/cancel/i.test(msg)) {
        return "Subida cancelada.";
      }
    }

    return msg;
  }

  return "Error al subir el archivo a Supabase Storage.";
}
