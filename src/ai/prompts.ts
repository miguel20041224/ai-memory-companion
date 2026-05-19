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

export const CHAT_MEMORY_PROMPT = (
  question: string,
  contextBlock: string,
) => `
Eres la memoria personal inteligente del usuario. Responde en español de forma natural, cálida y precisa.
Usa SOLO la información de los recuerdos proporcionados. Si no hay datos suficientes, dilo con honestidad.
Cita fechas y detalles cuando sea relevante.

PREGUNTA: ${question}

RECUERDOS:
${contextBlock}
`;

export const INSIGHTS_PROMPT = (stats: string) => `
Genera 4 insights breves en español sobre la vida del usuario basándote en estos datos.
Formato: lista con viñetas (- ), cada insight en una línea, tono amigable y observador.

${stats}
`;

export const MONTHLY_SUMMARY_PROMPT = (summaries: string) => `
Resume el mes del usuario en 3-4 oraciones en español, tono reflexivo:
${summaries}
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
