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
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/client";
import { deleteMediaPaths } from "@/services/storage.service";
import { isFirestoreIndexError } from "@/lib/firestore-errors";
import { MEMORIES_COLLECTION } from "@/lib/constants";
import type {
  Memory,
  MemoryInput,
  MemoryMediaFile,
  MemoryMetadataUpdate,
  MemoryType,
} from "@/types/memory";

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

function mapTags(data: Record<string, unknown>): string[] {
  if (Array.isArray(data.tags)) {
    return data.tags.map(String);
  }
  if (Array.isArray(data.aiKeywords)) {
    return data.aiKeywords.map(String);
  }
  return [];
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

  const mood =
    data.mood != null
      ? String(data.mood)
      : data.emotionalTone != null
        ? String(data.emotionalTone)
        : undefined;

  const title =
    data.title != null
      ? String(data.title)
      : data.aiSummary != null
        ? String(data.aiSummary)
        : undefined;

  return {
    id,
    userId: String(data.userId ?? ""),
    content: String(data.content ?? ""),
    type: (data.type as MemoryType) ?? "text",
    createdAt: createdAt?.toDate() ?? new Date(),
    title: title || undefined,
    favorite: Boolean(data.favorite),
    tags: mapTags(data),
    category: data.category ? String(data.category) : undefined,
    mood: mood || undefined,
    mediaUrl: data.mediaUrl ? String(data.mediaUrl) : undefined,
    mediaUrls,
    mediaFiles,
    fileName: data.fileName ? String(data.fileName) : undefined,
    fileSize: data.fileSize != null ? Number(data.fileSize) : undefined,
    duration: data.duration != null ? Number(data.duration) : undefined,
    mimeType: data.mimeType ? String(data.mimeType) : undefined,
    transcription: data.transcription
      ? String(data.transcription)
      : undefined,
  };
}

function sortMemoriesByCreatedAtDesc(memories: Memory[]): Memory[] {
  return [...memories].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

function mapSnapshotDocs(
  docs: { id: string; data: () => Record<string, unknown> }[],
): Memory[] {
  return docs.map((d) => mapMemory(d.id, d.data()));
}

export function subscribeMemories(
  userId: string,
  onData: (memories: Memory[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const col = collection(getFirebaseDb(), MEMORIES_COLLECTION);
  let activeUnsub: Unsubscribe = () => {};

  const attachListener = (useServerOrder: boolean) => {
    activeUnsub();

    const q = useServerOrder
      ? query(
          col,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        )
      : query(col, where("userId", "==", userId));

    activeUnsub = onSnapshot(
      q,
      (snapshot) => {
        let memories = mapSnapshotDocs(snapshot.docs);
        if (!useServerOrder) {
          memories = sortMemoriesByCreatedAtDesc(memories);
        }
        onData(memories);
      },
      (err) => {
        const firestoreErr = err as FirestoreError;

        if (useServerOrder && isFirestoreIndexError(firestoreErr)) {
          console.warn(
            "[memories] Índice compuesto no disponible; usando consulta alternativa con orden local.",
          );
          attachListener(false);
          return;
        }

        onError?.(
          firestoreErr instanceof Error
            ? firestoreErr
            : new Error(String(firestoreErr)),
        );
      },
    );
  };

  attachListener(true);

  return () => activeUnsub();
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
): Promise<string> {
  const primaryUrl =
    input.mediaUrls?.[0] ?? input.mediaUrl ?? null;

  const docRef = await addDoc(collection(getFirebaseDb(), MEMORIES_COLLECTION), {
    userId,
    content: input.content,
    type: input.type,
    title: input.title?.trim() || null,
    favorite: input.favorite ?? false,
    tags: input.tags ?? [],
    category: input.category ?? null,
    mood: input.mood ?? null,
    mediaUrl: primaryUrl,
    mediaUrls: input.mediaUrls ?? (primaryUrl ? [primaryUrl] : []),
    mediaFiles: input.mediaFiles ?? [],
    fileName: input.fileName ?? null,
    fileSize: input.fileSize ?? null,
    duration: input.duration ?? null,
    mimeType: input.mimeType ?? null,
    transcription: input.transcription ?? null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMemoryMetadata(
  userId: string,
  memoryId: string,
  update: MemoryMetadataUpdate,
): Promise<void> {
  const memory = await getMemory(userId, memoryId);
  if (!memory) throw new Error("Recuerdo no encontrado");

  const payload: Record<string, unknown> = {};

  if (update.title !== undefined) {
    payload.title = update.title.trim() || null;
  }
  if (update.favorite !== undefined) {
    payload.favorite = update.favorite;
  }
  if (update.tags !== undefined) {
    payload.tags = update.tags;
  }
  if (update.category !== undefined) {
    payload.category = update.category;
  }
  if (update.mood !== undefined) {
    payload.mood = update.mood;
  }

  await updateDoc(doc(getFirebaseDb(), MEMORIES_COLLECTION, memoryId), payload);
}

export async function toggleMemoryFavorite(
  userId: string,
  memory: Memory,
): Promise<boolean> {
  const next = !memory.favorite;
  await updateMemoryMetadata(userId, memory.id, { favorite: next });
  return next;
}

async function deleteStoragePathsSafe(paths: string[]): Promise<void> {
  if (!paths.length) return;
  try {
    await deleteMediaPaths(paths);
  } catch {
    // legacy URLs or already deleted
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
      const firebaseMatch = url.pathname.match(/\/o\/(.+)$/);
      if (firebaseMatch?.[1]) {
        paths.add(decodeURIComponent(firebaseMatch[1].split("?")[0]));
      }
      const supabaseMatch = url.pathname.match(
        /\/storage\/v1\/object\/public\/memories\/(.+)$/,
      );
      if (supabaseMatch?.[1]) {
        paths.add(decodeURIComponent(supabaseMatch[1]));
      }
    } catch {
      // not a valid URL
    }
  }

  await deleteStoragePathsSafe([...paths]);
  await deleteDoc(doc(getFirebaseDb(), MEMORIES_COLLECTION, memory.id));
}
