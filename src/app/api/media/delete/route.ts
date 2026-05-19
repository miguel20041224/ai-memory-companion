import { NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/auth/token-utils";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-token";
import { mapSupabaseKeyError } from "@/supabase/keys";
import { isPathOwnedByUser } from "@/lib/media/storage-paths";
import { getSupabaseAdmin, SUPABASE_MEDIA_BUCKET } from "@/supabase/admin";

export async function POST(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { uid } = await verifyFirebaseIdToken(token);
    const body = (await request.json()) as { paths?: string[] };
    const paths = Array.isArray(body.paths) ? body.paths : [];

    if (!paths.length) {
      return NextResponse.json({ ok: true });
    }

    const owned = paths.filter((p) => isPathOwnedByUser(p, uid));
    if (!owned.length) {
      return NextResponse.json({ ok: true });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .remove(owned);

    if (error) {
      return NextResponse.json(
        { error: mapSupabaseKeyError(error.message) },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, deleted: owned.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar archivos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
