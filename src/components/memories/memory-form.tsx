"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Mic, Type } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createMemory } from "@/services/memory.service";
import type { MemoryType } from "@/types/memory";
import type { MemoryAnalysis } from "@/types/ai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const types: { value: MemoryType; label: string; icon: typeof Type }[] = [
  { value: "text", label: "Texto", icon: Type },
  { value: "image", label: "Imagen", icon: ImageIcon },
  { value: "audio", label: "Audio", icon: Mic },
];

export function MemoryForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState<MemoryType>("text");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const text = content.trim();
    if (!text) {
      setError("Escribe algo sobre tu recuerdo.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const analyzeRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!analyzeRes.ok) {
        const err = (await analyzeRes.json()) as { error?: string };
        throw new Error(err.error ?? "Error al analizar");
      }

      const analysis = (await analyzeRes.json()) as MemoryAnalysis;

      await createMemory(
        user.uid,
        { content: text, type },
        analysis,
      );

      router.push("/timeline");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el recuerdo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de recuerdo</Label>
        <div className="grid grid-cols-3 gap-2">
          {types.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                type === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
        {type !== "text" && (
          <p className="text-xs text-muted-foreground">
            Subida de {type === "image" ? "imagen" : "audio"} próximamente. Por
            ahora describe el momento en texto.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">¿Qué quieres recordar?</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hoy fui al parque con María y..."
          rows={6}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Analizando y guardando…
          </>
        ) : (
          "Guardar recuerdo"
        )}
      </Button>
    </form>
  );
}
