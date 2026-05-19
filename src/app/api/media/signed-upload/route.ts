import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-token";
import { buildMediaStoragePath } from "@/lib/media/storage-paths";
import { extensionForMime } from "@/lib/upload/audio-utils";
import { sanitizeFileName } from "@/lib/upload/validation";
import { getSupabaseAdmin, SUPABASE_MEDIA_BUCKET } from "@/supabase/admin";
import { getSupabasePublicMediaUrl } from "@/supabase/config";

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
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { uid } = await verifyFirebaseIdToken(token);
    const body = (await request.json()) as {
      kind?: StorageMediaKind;
      fileName?: string;
      mimeType?: string;
    };

    const kind = body.kind;
    if (kind !== "images" && kind !== "audio") {
      return NextResponse.json(
        { error: "Tipo de medio inválido." },
        { status: 400 },
      );
    }

    const mimeType = body.mimeType?.trim() || "application/octet-stream";
    const baseName =
      sanitizeFileName(body.fileName ?? "").replace(/\.[^.]+$/, "") || kind;
    const ext = resolveExtension(body.fileName ?? "", mimeType, kind);
    const fileName = `${baseName}.${ext}`;
    const path = buildMediaStoragePath(uid, kind, fileName);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .createSignedUploadUrl(path, { upsert: false });

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message ?? "No se pudo crear la URL de subida." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path,
      publicUrl: getSupabasePublicMediaUrl(path),
      fileName,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al preparar la subida.";
    const status = message.includes("autorizado") || message.includes("Token")
      ? 401
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
