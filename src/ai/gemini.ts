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
import type { AiActionId } from "@/lib/ai/actions";
import { getAiAction } from "@/lib/ai/actions";
import { buildMemoryContextText } from "@/lib/ai/memory-context";
import { ANALYZE_MEMORY_PROMPT, INSIGHTS_BUNDLE_PROMPT, MEMORY_ACTION_PROMPT } from "./prompts";

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
  options: { jsonMode?: boolean; maxOutputTokens?: number } = {},
): Promise<string> {
  return withGeminiRetry(async () => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: options.jsonMode ? 0.4 : 0.5,
        ...(options.maxOutputTokens
          ? { maxOutputTokens: options.maxOutputTokens }
          : {}),
        ...(options.jsonMode
          ? { responseMimeType: "application/json" }
          : {}),
      },
    });
    const result = await model.generateContent(prompt);
    return result.response.text()?.trim() ?? "";
  });
}

export async function analyzeMemoryText(text: string): Promise<MemoryAnalysis> {
  const raw = await generateText(ANALYZE_MEMORY_PROMPT(text), { jsonMode: true });
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

export async function runMemoryAction(
  action: AiActionId,
  memory: Memory,
): Promise<string> {
  const body = memoryDisplayContent(memory).trim();
  if (!body && memory.type === "text") {
    throw new Error("Este recuerdo no tiene contenido para analizar.");
  }

  const definition = getAiAction(action);
  const context = buildMemoryContextText(memory);
  const prompt = MEMORY_ACTION_PROMPT(action, context);

  const text = await generateText(prompt, {
    maxOutputTokens: definition.maxOutputTokens,
  });
  return text || "No se pudo generar el resultado.";
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
  const raw = await generateText(INSIGHTS_BUNDLE_PROMPT(stats, summaries), {
    jsonMode: true,
    maxOutputTokens: 512,
  });
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
