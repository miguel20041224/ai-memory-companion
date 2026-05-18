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
import { deleteObject, ref } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/firebase/client";
import { MEMORIES_COLLECTION } from "@/lib/constants";
import type { Memory, MemoryInput, MemoryMediaFile, MemoryType } from "@/types/memory";
import type { MemoryAnalysis } from "@/types/ai";

function mapMediaFile(raw: unknown): MemoryMediaFile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!o.url || !o.storagePath) return null;
  return {
    url: String(o.url),
    storagePath: String(o.storagePath),
    fileName: String(o.fileName ?? ""),
    fileSize: Number(o.fileSize ?? 0),
    mimeType: String(o.mimeType ?? ""),
    duration: o.duration != null ? Number(o.duration) : undefined,
  };
}

function mapMemory(id: string, data: Record<string, unknown>): Memory {
  const createdAt = data.createdAt as Timestamp | undefined;
  const mediaFilesRaw = data.mediaFiles;
  const mediaFiles = Array.isArray(mediaFilesRaw)
    ? mediaFilesRaw.map(mapMediaFile).filter((f): f is MemoryMediaFile => f !== null)
    : undefined;

  const mediaUrls = Array.isArray(data.mediaUrls)
    ? data.mediaUrls.map(String)
    : undefined;

  return {
    id,
    userId: String(data.userId ?? ""),
    content: String(data.content ?? ""),
    type: (data.type as MemoryType) ?? "text",
    createdAt: createdAt?.toDate() ?? new Date(),
    mediaUrl: data.mediaUrl ? String(data.mediaUrl) : undefined,
    mediaUrls,
    mediaFiles,
    fileName: data.fileName ? String(data.fileName) : undefined,
    fileSize: data.fileSize != null ? Number(data.fileSize) : undefined,
    duration: data.duration != null ? Number(data.duration) : undefined,
    mimeType: data.mimeType ? String(data.mimeType) : undefined,
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

export async function createMemory(
  userId: string,
  input: MemoryInput,
  analysis: MemoryAnalysis,
): Promise<string> {
  const primaryUrl =
    input.mediaUrls?.[0] ?? input.mediaUrl ?? null;

  const docRef = await addDoc(collection(getFirebaseDb(), MEMORIES_COLLECTION), {
    userId,
    content: input.content,
    type: input.type,
    mediaUrl: primaryUrl,
    mediaUrls: input.mediaUrls ?? (primaryUrl ? [primaryUrl] : []),
    mediaFiles: input.mediaFiles ?? [],
    fileName: input.fileName ?? null,
    fileSize: input.fileSize ?? null,
    duration: input.duration ?? null,
    mimeType: input.mimeType ?? null,
    transcription: input.transcription ?? null,
    createdAt: serverTimestamp(),
    aiSummary: analysis.summary,
    aiKeywords: analysis.keywords,
    aiEntities: analysis.entities,
    emotionalTone: analysis.emotionalTone ?? null,
  });
  return docRef.id;
}

async function deleteStoragePath(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(getFirebaseStorage(), storagePath));
  } catch {
    // already deleted or legacy URL-only record
  }
}

export async function deleteMemory(
  userId: string,
  memory: Memory,
): Promise<void> {
  if (memory.userId !== userId) {
    throw new Error("No autorizado");
  }

  const paths = new Set<string>();
  memory.mediaFiles?.forEach((f) => paths.add(f.storagePath));

  if (paths.size === 0 && memory.mediaUrl) {
    try {
      const url = new URL(memory.mediaUrl);
      const match = url.pathname.match(/\/o\/(.+)$/);
      if (match?.[1]) {
        paths.add(decodeURIComponent(match[1].split("?")[0]));
      }
    } catch {
      // not a valid URL
    }
  }

  await Promise.all([...paths].map(deleteStoragePath));
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
