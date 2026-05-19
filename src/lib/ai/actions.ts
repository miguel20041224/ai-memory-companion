import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Heart,
  Lightbulb,
  Link2,
  Sparkles,
  Type,
} from "lucide-react";

/** Acciones permitidas — el servidor rechaza cualquier otro valor. */
export const AI_ACTION_IDS = [
  "summarize",
  "title",
  "emotion",
  "reflection",
] as const;

export type AiActionId = (typeof AI_ACTION_IDS)[number];

export interface AiActionDefinition {
  id: AiActionId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Respuesta corta → menos tokens de salida. */
  maxOutputTokens: number;
}

export const AI_ACTIONS: AiActionDefinition[] = [
  {
    id: "summarize",
    label: "Generar resumen",
    description: "2 oraciones sobre este recuerdo",
    icon: BookOpen,
    maxOutputTokens: 120,
  },
  {
    id: "title",
    label: "Crear título",
    description: "Título corto para la memoria",
    icon: Type,
    maxOutputTokens: 40,
  },
  {
    id: "emotion",
    label: "Analizar emoción",
    description: "Tono emocional principal",
    icon: Heart,
    maxOutputTokens: 30,
  },
  {
    id: "reflection",
    label: "Obtener reflexión",
    description: "Una pregunta para pensar",
    icon: Lightbulb,
    maxOutputTokens: 80,
  },
];

/** Acción local sin llamada a Gemini. */
export const LOCAL_ACTION = {
  id: "similar" as const,
  label: "Buscar relacionados",
  description: "Por palabras clave, sin IA",
  icon: Link2,
};

export const FULL_ANALYZE_ACTION = {
  id: "organize" as const,
  label: "Organizar memoria",
  description: "Resumen, etiquetas y entidades",
  icon: Sparkles,
};

export function isAiActionId(value: string): value is AiActionId {
  return (AI_ACTION_IDS as readonly string[]).includes(value);
}

export function getAiAction(id: AiActionId): AiActionDefinition {
  const action = AI_ACTIONS.find((a) => a.id === id);
  if (!action) throw new Error(`Acción IA desconocida: ${id}`);
  return action;
}
