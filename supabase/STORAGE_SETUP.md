# Supabase Storage — configuración

## 1. Crear bucket

En [Supabase Dashboard](https://supabase.com/dashboard) → **Storage** → **New bucket**:

| Campo | Valor |
|-------|--------|
| Name | `memories` |
| Public bucket | **Sí** (lectura pública de URLs) |
| File size limit | 26 MB (opcional) |

## 2. Estructura de rutas

Los archivos se guardan en:

```
memories/
  users/{userId}/images/{timestamp}-{id}-{filename}
  users/{userId}/audio/{timestamp}-{id}-{filename}
```

## 3. Variables de entorno

**Cliente (Vercel + local):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Solo servidor (Vercel, sin prefijo NEXT_PUBLIC):**

- `SUPABASE_SERVICE_ROLE_KEY`

## 4. Seguridad

- Las subidas usan **signed upload URLs** generadas en `/api/media/signed-upload`.
- El servidor verifica el **Firebase ID token** antes de firmar.
- Solo se permiten rutas bajo `users/{uid}/images/` y `users/{uid}/audio/`.
- Las eliminaciones pasan por `/api/media/delete` con la misma verificación.

## 5. Ya no se usa Firebase Storage

No necesitas plan Blaze ni reglas en `storage.rules` de Firebase.
