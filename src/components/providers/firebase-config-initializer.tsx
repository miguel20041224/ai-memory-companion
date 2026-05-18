"use client";

import { useLayoutEffect } from "react";
import type { FirebasePublicConfig } from "@/firebase/config";
import { setActiveFirebaseConfig } from "@/firebase/runtime-config";

interface FirebaseConfigInitializerProps {
  config: FirebasePublicConfig;
}

/** Sincroniza la config de Firebase inyectada por el servidor antes del primer auth. */
export function FirebaseConfigInitializer({
  config,
}: FirebaseConfigInitializerProps) {
  useLayoutEffect(() => {
    setActiveFirebaseConfig(config);
  }, [config]);

  return null;
}
