import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/firebase/client";
import { MEMORIES_COLLECTION } from "@/lib/constants";
import type { Memory, MemoryInput, MemoryType } from "@/types/memory";
import type { MemoryAnalysis } from "@/types/ai";

function mapMemory(id: string, data: Record<string, unknown>): Memory {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    userId: String(data.userId ?? ""),
    content: String(data.content ?? ""),
    type: (data.type as MemoryType) ?? "text",
    createdAt: createdAt?.toDate() ?? new Date(),
    mediaUrl: data.mediaUrl ? String(data.mediaUrl) : undefined,
    aiSummary: data.aiSummary ? String(data.aiSummary) : undefined,
    aiKeywords: Array.isArray(data.aiKeywords)
      ? data.aiKeywords.map(String)
      : [],
    aiEntities: Array.isArray(data.aiEntities)
      ? data.aiEntities.map(String)
      : [],
    emotionalTone: data.emotionalTone
      ? String(data.emotionalTone)
      : undefined,
    transcription: data.transcription
      ? String(data.transcription)
      : undefined,
  };
}

export function subscribeMemories(
  userId: string,
  onData: (memories: Memory[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), MEMORIES_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const memories = snapshot.docs.map((d) =>
        mapMemory(d.id, d.data() as Record<string, unknown>),
      );
      onData(memories);
    },
    (err) => onError?.(err as Error),
  );
}

export async function getMemory(
  userId: string,
  memoryId: string,
): Promise<Memory | null> {
  const snap = await getDoc(doc(getFirebaseDb(), MEMORIES_COLLECTION, memoryId));
  if (!snap.exists()) return null;
  const memory = mapMemory(snap.id, snap.data() as Record<string, unknown>);
  if (memory.userId !== userId) return null;
  return memory;
}

export async function uploadMemoryMedia(
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `memories/${userId}/${Date.now()}.${ext}`;
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createMemory(
  userId: string,
  input: MemoryInput,
  analysis: MemoryAnalysis,
): Promise<string> {
  const docRef = await addDoc(collection(getFirebaseDb(), MEMORIES_COLLECTION), {
    userId,
    content: input.content,
    type: input.type,
    mediaUrl: input.mediaUrl ?? null,
    transcription: input.transcription ?? null,
    createdAt: serverTimestamp(),
    aiSummary: analysis.summary,
    aiKeywords: analysis.keywords,
    aiEntities: analysis.entities,
    emotionalTone: analysis.emotionalTone ?? null,
  });
  return docRef.id;
}

export async function deleteMemory(
  userId: string,
  memory: Memory,
): Promise<void> {
  if (memory.userId !== userId) {
    throw new Error("No autorizado");
  }
  if (memory.mediaUrl) {
    try {
      const storageRef = ref(getFirebaseStorage(), memory.mediaUrl);
      await deleteObject(storageRef);
    } catch {
      // media may be external URL
    }
  }
  await deleteDoc(doc(getFirebaseDb(), MEMORIES_COLLECTION, memory.id));
}

export async function updateMemoryContent(
  userId: string,
  memoryId: string,
  content: string,
  analysis: MemoryAnalysis,
): Promise<void> {
  const memory = await getMemory(userId, memoryId);
  if (!memory) throw new Error("Recuerdo no encontrado");

  await updateDoc(doc(getFirebaseDb(), MEMORIES_COLLECTION, memoryId), {
    content,
    aiSummary: analysis.summary,
    aiKeywords: analysis.keywords,
    aiEntities: analysis.entities,
    emotionalTone: analysis.emotionalTone ?? null,
  });
}
