import type { User } from "firebase/auth";
import { useAuthStore } from "@/store/auth-store";

/** Sincroniza el store de Zustand tras login/registro explícito (antes del siguiente onAuthStateChanged). */
export function syncAuthStoreUser(user: User): void {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setAuthError(null);
  useAuthStore.getState().setLoading(false);
}
