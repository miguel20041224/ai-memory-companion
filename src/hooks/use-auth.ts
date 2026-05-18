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

    let settled = false;
    let unsub: (() => void) | undefined;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const timeoutId = window.setTimeout(() => {
      finish(() => {
        if (useAuthStore.getState().loading) {
          setUser(null);
          setAuthError(
            "Tiempo de espera al conectar con Firebase. Revisa tu red, dominios autorizados en Firebase Console y las variables en Vercel.",
          );
          setLoading(false);
        }
      });
    }, AUTH_INIT_TIMEOUT_MS);

    try {
      unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        if (user) {
          try {
            await ensureUserProfile(user);
          } catch {
            // profile sync is best-effort
          }
        }
        finish(() => {
          setUser(user);
          setAuthError(null);
          setLoading(false);
        });
      });
    } catch (error) {
      const message =
        error instanceof FirebaseNotConfiguredError
          ? error.message
          : error instanceof Error
            ? error.message
            : "No se pudo inicializar la autenticación.";
      finish(() => {
        setUser(null);
        setAuthError(message);
        setLoading(false);
      });
    }

    return () => {
      window.clearTimeout(timeoutId);
      unsub?.();
    };
  }, [setUser, setLoading, setAuthError]);
}

export function useAuth() {
  return useAuthStore();
}
