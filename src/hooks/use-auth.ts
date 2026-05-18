"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { FirebaseNotConfiguredError, getFirebaseAuth } from "@/firebase/client";
import { isFirebaseConfigured } from "@/firebase/config";
import { useAuthStore } from "@/store/auth-store";
import { ensureUserProfile } from "@/services/user.service";

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setAuthError = useAuthStore((s) => s.setAuthError);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setUser(null);
      setAuthError("Firebase no está configurado.");
      setLoading(false);
      return;
    }

    let unsub: (() => void) | undefined;

    try {
      unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        if (user) {
          try {
            await ensureUserProfile(user);
          } catch {
            // profile sync is best-effort
          }
        }
        setUser(user);
        setAuthError(null);
        setLoading(false);
      });
    } catch (error) {
      const message =
        error instanceof FirebaseNotConfiguredError
          ? error.message
          : error instanceof Error
            ? error.message
            : "No se pudo inicializar la autenticación.";
      setUser(null);
      setAuthError(message);
      setLoading(false);
    }

    return () => unsub?.();
  }, [setUser, setLoading, setAuthError]);
}

export function useAuth() {
  return useAuthStore();
}
