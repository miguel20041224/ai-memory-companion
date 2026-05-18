#!/usr/bin/env node
/**
 * Valida variables requeridas antes del build (local o CI).
 * Uso: node scripts/check-env.mjs
 */
const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("\n[check-env] Faltan variables de entorno:\n");
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error(
    "\nEn Vercel: Settings → Environment Variables → marcar Production + Preview.\n" +
      "Después de añadirlas, haz Redeploy (las NEXT_PUBLIC_* se embeben en el build).\n",
  );
  process.exit(1);
}

console.log("[check-env] Variables Firebase OK.");
if (!process.env.GEMINI_API_KEY?.trim()) {
  console.warn(
    "[check-env] GEMINI_API_KEY no definida: /api/ai/* fallará hasta configurarla.",
  );
}
