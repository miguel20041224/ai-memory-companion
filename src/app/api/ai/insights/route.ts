import { NextResponse } from "next/server";
import { generateInsightsBundle } from "@/ai/gemini";
import { deserializeMemories, type SerializedMemory } from "@/lib/api-memory";
import {
  aiErrorResponse,
  enforceAiRateLimit,
} from "@/lib/ai/route-handler";

export async function POST(request: Request) {
  const limited = enforceAiRateLimit(request, "insights");
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      memories?: SerializedMemory[];
    };
    const memories = deserializeMemories(body.memories ?? []);
    const bundle = await generateInsightsBundle(memories);
    return NextResponse.json(bundle);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
