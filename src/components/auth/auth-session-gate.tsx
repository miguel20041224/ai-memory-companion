"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type AuthSessionGateMode = "guest-only" | "authenticated-only";

interface AuthSessionGateProps {
  mode: AuthSessionGateMode;
  redirectTo: string;
  children: React.ReactNode;
}

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label={label} />
    </div>
  );
}

/**
 * guest-only: redirige si ya hay sesión (login/register).
 * authenticated-only: redirige si no hay sesión (rutas de la app).
 */
export function AuthSessionGate({
  mode,
  redirectTo,
  children,
}: AuthSessionGateProps) {
  const router = useRouter();
  const { user, loading, authError } = useAuth();

  const shouldRedirect =
    !loading &&
    !authError &&
    ((mode === "guest-only" && user) || (mode === "authenticated-only" && !user));

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (loading) {
    return <CenteredSpinner label="Cargando sesión" />;
  }

  if (authError) {
    return (
      <p className="text-center text-sm text-destructive" role="alert">
        {authError}
      </p>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Redirigiendo" />
        <p className="text-sm text-muted-foreground">Redirigiendo…</p>
      </div>
    );
  }

  return <>{children}</>;
}
