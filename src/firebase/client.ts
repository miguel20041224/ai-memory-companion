import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { isFirebaseConfigured } from "./config";
import { getActiveFirebaseConfig } from "./runtime-config";

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Firebase no está configurado. Añade las variables NEXT_PUBLIC_FIREBASE_* en Vercel y vuelve a desplegar.",
    );
    this.name = "FirebaseNotConfiguredError";
  }
}

const FIREBASE_APP_NAME = "ai-memory-companion";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function resolveFirebaseApp(config: ReturnType<typeof getActiveFirebaseConfig>): FirebaseApp {
  const existing = getApps().find(
    (candidate) => candidate.name === FIREBASE_APP_NAME,
  );

  if (existing) {
    if (existing.options.projectId !== config.projectId) {
      throw new Error(
        "Conflicto de configuración Firebase: projectId distinto al de la sesión anterior. Recarga la página.",
      );
    }
    return existing;
  }

  if (!app) {
    app = initializeApp(config, FIREBASE_APP_NAME);
  }

  return app;
}

function getAppInstance(): FirebaseApp {
  const config = getActiveFirebaseConfig();

  if (!isFirebaseConfigured(config)) {
    throw new FirebaseNotConfiguredError();
  }

  return resolveFirebaseApp(config);
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getAppInstance();
    try {
      auth = initializeAuth(firebaseApp, {
        persistence: browserLocalPersistence,
      });
    } catch {
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getAppInstance());
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getAppInstance());
  return storage;
}
