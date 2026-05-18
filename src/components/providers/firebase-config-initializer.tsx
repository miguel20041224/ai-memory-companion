"use client";

import { useLayoutEffect } from "react";
import type { FirebasePublicConfig } from "@/firebase/config";
import { setActiveFirebaseConfig } from "@/firebase/runtime-config";

interface FirebaseConfigInitializerProps {
  config: FirebasePublicConfig;
}

/** Sincroniza la config antes de que corra el listener de auth. */
export function FirebaseConfigInitializer({
  config,
}: FirebaseConfigInitializerProps) {
  if (typeof window !== "undefined") {
    setActiveFirebaseConfig(config);
  }

  useLayoutEffect(() => {
    setActiveFirebaseConfig(config);
  }, [config]);

  return null;
}
