"use client";

import { useAuthListener } from "@/hooks/use-auth";
import type { FirebasePublicConfig } from "@/firebase/config";
import {
  getMissingFirebaseEnvVars,
  isFirebaseConfigured,
} from "@/firebase/config";
import { FirebaseSetupScreen } from "@/components/providers/firebase-setup-screen";

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

interface AuthProviderProps {
  firebaseConfig: FirebasePublicConfig;
  children: React.ReactNode;
}

export function AuthProvider({ firebaseConfig, children }: AuthProviderProps) {
  if (!isFirebaseConfigured(firebaseConfig)) {
    return (
      <FirebaseSetupScreen
        missingVars={getMissingFirebaseEnvVars(firebaseConfig)}
      />
    );
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}
