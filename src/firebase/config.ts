export const FIREBASE_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export type FirebasePublicEnvKey = (typeof FIREBASE_PUBLIC_ENV_KEYS)[number];

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
};

/** Lee config en servidor (runtime) o en build (cliente). */
export function getFirebaseConfigFromEnv(): FirebasePublicConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

export function getMissingFirebaseEnvVars(
  config: FirebasePublicConfig = getFirebaseConfigFromEnv(),
): FirebasePublicEnvKey[] {
  const values: Record<FirebasePublicEnvKey, string> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
  };

  return FIREBASE_PUBLIC_ENV_KEYS.filter((key) => !values[key]?.trim());
}

export function isFirebaseConfigured(
  config: FirebasePublicConfig = getFirebaseConfigFromEnv(),
): boolean {
  return getMissingFirebaseEnvVars(config).length === 0;
}
