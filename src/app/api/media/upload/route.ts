import { NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/auth/token-utils";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-token";
import { buildMediaStoragePath } from "@/lib/media/storage-paths";
import { extensionForMime } from "@/lib/upload/audio-utils";
import { sanitizeFileName } from "@/lib/upload/validation";
import { getSupabaseAdmin, SUPABASE_MEDIA_BUCKET } from "@/supabase/admin";
import { getSupabasePublicMediaUrl } from "@/supabase/config";
import { mapSupabaseKeyError } from "@/supabase/keys";

import { SERVER_DIRECT_UPLOAD_MAX_BYTES } from "@/lib/upload/constants";
import type { StorageMediaKind } from "@/lib/media/types";

function resolveExtension(
  originalName: string,
  mimeType: string,
  kind: StorageMediaKind,
): string {
  const fromName = originalName.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (kind === "audio") return extensionForMime(mimeType) || "webm";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { uid } = await verifyFirebaseIdToken(token);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !file.size) {
      return NextResponse.json(
        { error: "Archivo de audio o imagen requerido." },
        { status: 400 },
      );
    }

    if (file.size > SERVER_DIRECT_UPLOAD_MAX_BYTES) {
      return NextResponse.json(
        {
          error: `Archivo demasiado grande para subida directa (máx. ${SERVER_DIRECT_UPLOAD_MAX_BYTES / (1024 * 1024)} MB). Usa URL firmada.`,
          useSignedUpload: true,
        },
        { status: 413 },
      );
    }

    const kind = formData.get("kind");
    if (kind !== "images" && kind !== "audio") {
      return NextResponse.json(
        { error: "Tipo de medio inválido." },
        { status: 400 },
      );
    }

    const mimeType = file.type?.trim() || "application/octet-stream";
    const baseName =
      sanitizeFileName(file.name ?? "").replace(/\.[^.]+$/, "") || kind;
    const ext = resolveExtension(file.name ?? "", mimeType, kind);
    const fileName = `${baseName}.${ext}`;
    const path = buildMediaStoragePath(uid, kind, fileName);

    const supabase = getSupabaseAdmin();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .upload(path, bytes, {
        contentType: mimeType,
        upsert: false,
        cacheControl: "3600",
      });

    if (error) {
      const message = mapSupabaseKeyError(error.message);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      path,
      publicUrl: getSupabasePublicMediaUrl(path),
      fileName,
    });
  } catch (error) {
    const raw =
      error instanceof Error ? error.message : "Error al subir el archivo.";
    const message = mapSupabaseKeyError(raw);
    const status =
      message.includes("autorizado") ||
      message.includes("Token") ||
      message.includes("sesión")
        ? 401
        : message.includes("SUPABASE_SERVICE_ROLE")
          ? 500
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
