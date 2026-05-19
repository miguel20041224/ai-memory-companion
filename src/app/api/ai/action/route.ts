import { NextResponse } from "next/server";
import { runMemoryAction } from "@/ai/gemini";
import { isAiActionId } from "@/lib/ai/actions";
import {
  deserializeMemory,
  type SerializedMemory,
} from "@/lib/api-memory";
import {
  aiErrorResponse,
  enforceAiRateLimit,
} from "@/lib/ai/route-handler";

export async function POST(request: Request) {
  const limited = enforceAiRateLimit(request, "action");
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      action?: string;
      memory?: SerializedMemory;
    };

    const action = body.action?.trim();
    if (!action || !isAiActionId(action)) {
      return NextResponse.json(
        { error: "Acción no permitida." },
        { status: 400 },
      );
    }

    if (!body.memory) {
      return NextResponse.json(
        { error: "Se requiere un recuerdo." },
        { status: 400 },
      );
    }

    const memory = deserializeMemory(body.memory);
    const result = await runMemoryAction(action, memory);

    return NextResponse.json({ result, action });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
