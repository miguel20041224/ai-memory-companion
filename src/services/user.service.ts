import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/firebase/client";
import { USERS_COLLECTION } from "@/lib/constants";
import type { UserProfile } from "@/types/user";

export async function ensureUserProfile(user: User, nombre?: string): Promise<void> {
  const ref = doc(getFirebaseDb(), USERS_COLLECTION, user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    id: user.uid,
    nombre: nombre ?? user.displayName ?? user.email?.split("@")[0] ?? "Usuario",
    email: user.email ?? "",
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirebaseDb(), USERS_COLLECTION, userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: userId,
    nombre: String(data.nombre ?? ""),
    email: String(data.email ?? ""),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  };
}
