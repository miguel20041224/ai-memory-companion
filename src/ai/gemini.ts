import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractJson } from "@/lib/utils";
import { withGeminiRetry } from "@/lib/ai/retry";
import {
  buildMemoryStats,
  recentMemorySnippets,
} from "@/lib/ai/memory-stats";
import type { MemoryAnalysis } from "@/types/ai";
import type { Memory } from "@/types/memory";
import { memoryDisplayContent } from "@/types/memory";
import {
  ANALYZE_MEMORY_PROMPT,
  CHAT_MEMORY_PROMPT,
  INSIGHTS_BUNDLE_PROMPT,
} from "./prompts";

const MODEL = "gemini-2.0-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada en el servidor.");
  }
  return new GoogleGenerativeAI(apiKey);
}

async function generateText(
  prompt: string,
  jsonMode = false,
): Promise<string> {
  return withGeminiRetry(async () => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: MODEL,
      ...(jsonMode
        ? {
            generationConfig: {
              temperature: 0.4,
              responseMimeType: "application/json",
            },
          }
        : {}),
    });
    const result = await model.generateContent(prompt);
    return result.response.text()?.trim() ?? "";
  });
}

export async function analyzeMemoryText(text: string): Promise<MemoryAnalysis> {
  const raw = await generateText(ANALYZE_MEMORY_PROMPT(text), true);
  const json = extractJson(raw || "{}");

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
      const title = m.aiSummary?.trim() || snippet;
      return `- Fecha: ${m.createdAt.toISOString()}
  Tipo: ${m.type}
  Título: ${title}
  Palabras clave: ${m.aiKeywords.join(", ") || "—"}
  Entidades: ${m.aiEntities.join(", ") || "—"}
  Contenido: ${snippet}`;
    })
    .join("\n");

  const text = await generateText(CHAT_MEMORY_PROMPT(question, contextBlock));
  return text || "No pude generar una respuesta.";
}

export interface InsightsBundle {
  insights: string;
  monthlySummary: string;
}

export async function generateInsightsBundle(
  memories: Memory[],
): Promise<InsightsBundle> {
  if (memories.length === 0) {
    return {
      insights:
        "Aún no hay suficientes recuerdos para generar insights. ¡Empieza a capturar momentos!",
      monthlySummary: "Sin recuerdos este mes.",
    };
  }

  const stats = buildMemoryStats(memories);
  const summaries = recentMemorySnippets(memories);
  const raw = await generateText(
    INSIGHTS_BUNDLE_PROMPT(stats, summaries),
    true,
  );
  const json = extractJson(raw || "{}");

  return {
    insights: String(
      json.insights ??
        "No se pudieron generar insights en este momento.",
    ),
    monthlySummary: String(
      json.monthlySummary ?? "Resumen no disponible.",
    ),
  };
}
