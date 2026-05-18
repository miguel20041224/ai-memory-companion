import { NextResponse } from "next/server";
import { analyzeMemoryText } from "@/ai/gemini";

export async function POST(request: Request) {
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
    const message =
      error instanceof Error ? error.message : "Error al analizar el recuerdo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
