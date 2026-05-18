"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/firebase/client";
import { useAuthStore } from "@/store/auth-store";
import { ensureUserProfile } from "@/services/user.service";

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (user) {
        try {
          await ensureUserProfile(user);
        } catch {
          // profile sync is best-effort
        }
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, [setUser, setLoading]);
}

export function useAuth() {
  return useAuthStore();
}
