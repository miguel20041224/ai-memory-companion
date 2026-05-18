"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { isFirebaseConfigured } from "@/firebase/config";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, authError } = useAuth();

  useEffect(() => {
    if (!isFirebaseConfigured() || loading || authError) return;
    router.replace(user ? "/timeline" : "/login");
  }, [user, loading, authError, router]);

  if (authError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p className="max-w-sm text-center text-sm text-destructive" role="alert">
          {authError}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando" />
    </div>
  );
}
