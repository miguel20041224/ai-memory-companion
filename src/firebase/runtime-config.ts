import type { FirebasePublicConfig } from "./config";
import { getFirebaseConfigFromEnv } from "./config";

let activeConfig: FirebasePublicConfig | null = null;

export function setActiveFirebaseConfig(config: FirebasePublicConfig): void {
  activeConfig = config;
}

export function getActiveFirebaseConfig(): FirebasePublicConfig {
  return activeConfig ?? getFirebaseConfigFromEnv();
}

export function resetFirebaseClients(): void {
  activeConfig = null;
}
