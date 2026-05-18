import { NextResponse } from "next/server";
import { answerMemoryQuestion } from "@/ai/gemini";
import { deserializeMemories, type SerializedMemory } from "@/lib/api-memory";

export async function POST(request: Request) {
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
    const message =
      error instanceof Error ? error.message : "Error al procesar la pregunta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
