import { NextResponse } from "next/server";
import { analyzeMemoryText } from "@/ai/gemini";
import {
  aiErrorResponse,
  enforceAiRateLimit,
} from "@/lib/ai/route-handler";

export async function POST(request: Request) {
  const limited = enforceAiRateLimit(request, "analyze");
  if (limited) return limited;

  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "El texto del recuerdo es obligatorio." },
        { status: 400 },
      );
    }

    const analysis = await analyzeMemoryText(text);
    return NextResponse.json(analysis);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
