"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/layout/bottom-nav";
import { APP_NAME } from "@/lib/constants";

function CenteredStatus({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4">
      {children}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, authError } = useAuth();

  useEffect(() => {
    if (!loading && !user && !authError) {
      router.replace("/login");
    }
  }, [user, loading, authError, router]);

  if (loading) {
    return (
      <CenteredStatus>
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando" />
      </CenteredStatus>
    );
  }

  if (authError) {
    return (
      <CenteredStatus>
        <p className="max-w-sm text-center text-sm text-destructive" role="alert">
          {authError}
        </p>
      </CenteredStatus>
    );
  }

  if (!user) {
    return (
      <CenteredStatus>
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Redirigiendo" />
        <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
      </CenteredStatus>
    );
  }

  return (
    <div className="app-shell mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="glass sticky top-0 z-40 border-b border-border/60 px-4 py-3">
        <h1 className="text-center text-sm font-semibold tracking-wide text-foreground">
          {APP_NAME}
        </h1>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
