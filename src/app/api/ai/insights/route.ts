import { NextResponse } from "next/server";
import { generateInsights, generateMonthlySummary } from "@/ai/gemini";
import { deserializeMemories, type SerializedMemory } from "@/lib/api-memory";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      memories?: SerializedMemory[];
    };
    const memories = deserializeMemories(body.memories ?? []);
    const [insights, monthlySummary] = await Promise.all([
      generateInsights(memories),
      generateMonthlySummary(memories),
    ]);

    return NextResponse.json({ insights, monthlySummary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al generar insights.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
