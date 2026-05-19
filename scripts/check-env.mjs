#!/usr/bin/env node

const firebase = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const supabasePublic = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const missingFirebase = firebase.filter((key) => !process.env[key]?.trim());
const missingSupabase = supabasePublic.filter((key) => !process.env[key]?.trim());

let failed = false;

if (missingFirebase.length > 0) {
  failed = true;
  console.error("\n[check-env] Faltan variables Firebase:\n");
  for (const key of missingFirebase) console.error(`  - ${key}`);
}

if (missingSupabase.length > 0) {
  failed = true;
  console.error("\n[check-env] Faltan variables Supabase (cliente):\n");
  for (const key of missingSupabase) console.error(`  - ${key}`);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
  console.warn(
    "\n[check-env] SUPABASE_SERVICE_ROLE_KEY no definida: uploads en API fallarán en producción.\n",
  );
}

if (!process.env.GEMINI_API_KEY?.trim()) {
  console.warn("[check-env] GEMINI_API_KEY no definida: /api/ai/* fallará.\n");
}

if (failed) {
  process.exit(1);
}

console.log("[check-env] Firebase y Supabase (público) OK.");
