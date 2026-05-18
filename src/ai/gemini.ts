import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractJson } from "@/lib/utils";
import type { MemoryAnalysis } from "@/types/ai";
import type { Memory } from "@/types/memory";
import { memoryDisplayContent } from "@/types/memory";
import {
  ANALYZE_MEMORY_PROMPT,
  CHAT_MEMORY_PROMPT,
  INSIGHTS_PROMPT,
  MONTHLY_SUMMARY_PROMPT,
} from "./prompts";

const MODEL = "gemini-2.0-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada en el servidor.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeMemoryText(text: string): Promise<MemoryAnalysis> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(ANALYZE_MEMORY_PROMPT(text));
  const raw = result.response.text() ?? "{}";
  const json = extractJson(raw);

  return {
    summary: String(json.summary ?? ""),
    keywords: Array.isArray(json.keywords)
      ? json.keywords.map(String)
      : [],
    entities: Array.isArray(json.entities)
      ? json.entities.map(String)
      : [],
    emotionalTone: json.emotionalTone ? String(json.emotionalTone) : undefined,
    insights: Array.isArray(json.insights)
      ? json.insights.map(String)
      : [],
  };
}

export async function answerMemoryQuestion(
  question: string,
  memories: Memory[],
): Promise<string> {
  if (memories.length === 0) {
    return "No encontré recuerdos relacionados con tu pregunta. Intenta guardar más momentos o reformular la consulta.";
  }

  const contextBlock = memories
    .map((m) => {
      const content = memoryDisplayContent(m);
      const snippet =
        content.length > 300 ? `${content.slice(0, 300)}...` : content;
      return `- Fecha: ${m.createdAt.toISOString()}
  Tipo: ${m.type}
  Resumen: ${m.aiSummary ?? snippet}
  Palabras clave: ${m.aiKeywords.join(", ")}
  Entidades: ${m.aiEntities.join(", ")}
  Contenido: ${snippet}`;
    })
    .join("\n");

  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(
    CHAT_MEMORY_PROMPT(question, contextBlock),
  );
  return result.response.text()?.trim() ?? "No pude generar una respuesta.";
}

export function buildMemoryStats(memories: Memory[]): string {
  const now = new Date();
  const thisMonth = memories.filter(
    (m) =>
      m.createdAt.getFullYear() === now.getFullYear() &&
      m.createdAt.getMonth() === now.getMonth(),
  ).length;

  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = memories.filter(
    (m) =>
      m.createdAt.getFullYear() === prev.getFullYear() &&
      m.createdAt.getMonth() === prev.getMonth(),
  ).length;

  const weekend = memories.filter((m) => {
    const d = m.createdAt.getDay();
    return d === 0 || d === 6;
  }).length;

  const entities: Record<string, number> = {};
  for (const m of memories) {
    for (const e of m.aiEntities) {
      entities[e] = (entities[e] ?? 0) + 1;
    }
  }
  const topEntities = Object.entries(entities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k}(${v})`)
    .join(", ");

  const tones: Record<string, number> = {};
  for (const m of memories) {
    if (m.emotionalTone) {
      tones[m.emotionalTone] = (tones[m.emotionalTone] ?? 0) + 1;
    }
  }
  const topTones = Object.entries(tones)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k}(${v})`)
    .join(", ");

  return `
Total recuerdos: ${memories.length}
Este mes: ${thisMonth} | Mes anterior: ${lastMonth}
Recuerdos en fin de semana: ${weekend}
Entidades frecuentes: ${topEntities || "ninguna"}
Tonos emocionales: ${topTones || "sin datos"}
`;
}

export async function generateInsights(memories: Memory[]): Promise<string> {
  if (memories.length === 0) {
    return "Aún no hay suficientes recuerdos para generar insights. ¡Empieza a capturar momentos!";
  }
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(
    INSIGHTS_PROMPT(buildMemoryStats(memories)),
  );
  return result.response.text()?.trim() ?? "Insights no disponibles.";
}

export async function generateMonthlySummary(
  memories: Memory[],
): Promise<string> {
  if (memories.length === 0) return "Sin recuerdos este mes.";
  const summaries = memories
    .slice(0, 30)
    .map((m) => m.aiSummary ?? memoryDisplayContent(m))
    .join("\n- ");
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(
    MONTHLY_SUMMARY_PROMPT(`- ${summaries}`),
  );
  return result.response.text()?.trim() ?? "Resumen no disponible.";
}
