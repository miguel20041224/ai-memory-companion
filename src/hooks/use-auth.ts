"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { FirebaseNotConfiguredError, getFirebaseAuth } from "@/firebase/client";
import { isFirebaseConfigured } from "@/firebase/config";
import { getActiveFirebaseConfig } from "@/firebase/runtime-config";
import { useAuthStore } from "@/store/auth-store";
import { ensureUserProfile } from "@/services/user.service";

const AUTH_INIT_TIMEOUT_MS = 15_000;

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setAuthError = useAuthStore((s) => s.setAuthError);

  useEffect(() => {
    const config = getActiveFirebaseConfig();

    if (!isFirebaseConfigured(config)) {
      setUser(null);
      setAuthError("Firebase no está configurado.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      if (useAuthStore.getState().loading) {
        setUser(null);
        setAuthError(
          "Tiempo de espera al conectar con Firebase. Revisa tu red, dominios autorizados en Firebase Console y las variables en Vercel.",
        );
        setLoading(false);
      }
    }, AUTH_INIT_TIMEOUT_MS);

    let unsub: (() => void) | undefined;

    try {
      unsub = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
        void (async () => {
          if (cancelled) return;

          if (firebaseUser) {
            try {
              await ensureUserProfile(firebaseUser);
            } catch {
              // profile sync is best-effort; no bloquear la sesión
            }
          }

          if (cancelled) return;

          // Cada evento de auth actualiza el store (Firebase suele emitir null y luego el usuario).
          setUser(firebaseUser);
          setAuthError(null);
          setLoading(false);
        })();
      });
    } catch (error) {
      if (!cancelled) {
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
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      unsub?.();
    };
  }, [setUser, setLoading, setAuthError]);
}

export function useAuth() {
  return useAuthStore();
}
