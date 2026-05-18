"use client";

import { useAuthListener } from "@/hooks/use-auth";
import {
  getMissingFirebaseEnvVars,
  isFirebaseConfigured,
} from "@/firebase/config";
import { FirebaseSetupScreen } from "@/components/providers/firebase-setup-screen";

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured()) {
    return <FirebaseSetupScreen missingVars={getMissingFirebaseEnvVars()} />;
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}
