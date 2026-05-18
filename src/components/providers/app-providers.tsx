"use client";

import type { FirebasePublicConfig } from "@/firebase/config";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ClientErrorBoundary } from "@/components/providers/client-error-boundary";
import { FirebaseConfigInitializer } from "@/components/providers/firebase-config-initializer";
import { Toaster } from "sonner";

interface AppProvidersProps {
  firebaseConfig: FirebasePublicConfig;
  children: React.ReactNode;
}

export function AppProviders({ firebaseConfig, children }: AppProvidersProps) {
  return (
    <>
      <FirebaseConfigInitializer config={firebaseConfig} />
      <ClientErrorBoundary>
        <AuthProvider firebaseConfig={firebaseConfig}>{children}</AuthProvider>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </ClientErrorBoundary>
    </>
  );
}
