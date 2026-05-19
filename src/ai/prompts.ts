import type { AiActionId } from "@/lib/ai/actions";

export const ANALYZE_MEMORY_PROMPT = (text: string) => `
Analiza este recuerdo personal y responde SOLO en JSON válido con esta estructura:
{
  "summary": "resumen breve en español (1-2 oraciones)",
  "keywords": ["palabra1", "palabra2"],
  "entities": ["personas, lugares o eventos detectados"],
  "emotionalTone": "tono emocional en una palabra o frase corta",
  "insights": ["observación breve 1", "observación breve 2"]
}

Recuerdo:
${text}
`;

const ACTION_INSTRUCTIONS: Record<AiActionId, string> = {
  summarize:
    "Resume este recuerdo personal en exactamente 2 oraciones en español. Solo usa la información dada. Sin introducción ni despedida.",
  title:
    "Genera un título corto (máximo 8 palabras) en español para este recuerdo. Responde SOLO el título, sin comillas ni puntuación final.",
  emotion:
    "Identifica el tono emocional principal en 1 a 3 palabras en español. Responde SOLO esas palabras, separadas por comas si son varias.",
  reflection:
    "Escribe UNA sola pregunta reflexiva breve en español que invite al usuario a pensar sobre este recuerdo. Sin explicación ni contexto extra.",
};

export const MEMORY_ACTION_PROMPT = (action: AiActionId, context: string) => `
${ACTION_INSTRUCTIONS[action]}

RECUERDO:
${context}
`;

/** Una sola llamada a la API: insights + resumen mensual. */
export const INSIGHTS_BUNDLE_PROMPT = (stats: string, summaries: string) => `
Basándote en los datos del usuario, responde SOLO en JSON válido:
{
  "insights": "4 insights breves en español, formato lista con viñetas (- ), una por línea",
  "monthlySummary": "resumen del mes en 3-4 oraciones, tono reflexivo"
}

ESTADÍSTICAS:
${stats}

RESÚMENES RECIENTES:
- ${summaries || "Sin resúmenes aún."}
`;
