"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Error de autenticación</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error.message || "No se pudo cargar el formulario."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
        <Button asChild variant="secondary">
          <Link href="/login">Volver al login</Link>
        </Button>
      </div>
    </div>
  );
}
