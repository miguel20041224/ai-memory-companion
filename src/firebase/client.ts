import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let initializedFor: string | null = null;

function getApp(): FirebaseApp {
  const config = getActiveFirebaseConfig();

  if (!isFirebaseConfigured(config)) {
    throw new FirebaseNotConfiguredError();
  }

  const configKey = config.projectId;

  if (app && initializedFor !== configKey) {
    app = undefined;
    auth = undefined;
    db = undefined;
    storage = undefined;
  }

  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(config);
    initializedFor = configKey;
  }

  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getApp());
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getApp());
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getApp());
  return storage;
}
