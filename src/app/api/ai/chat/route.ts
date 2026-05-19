import { NextResponse } from "next/server";
import { answerMemoryQuestion } from "@/ai/gemini";
import { deserializeMemories, type SerializedMemory } from "@/lib/api-memory";
import {
  aiErrorResponse,
  enforceAiRateLimit,
} from "@/lib/ai/route-handler";

export async function POST(request: Request) {
  const limited = enforceAiRateLimit(request, "chat");
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      question?: string;
      memories?: SerializedMemory[];
    };
    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json(
        { error: "La pregunta es obligatoria." },
        { status: 400 },
      );
    }

    const memories = deserializeMemories(body.memories ?? []);
    const answer = await answerMemoryQuestion(question, memories);
    return NextResponse.json({ answer });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
