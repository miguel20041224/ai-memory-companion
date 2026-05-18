"use client";

import { MemoryForm } from "@/components/memories/memory-form";

export default function NewMemoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Nuevo recuerdo</h2>
        <p className="text-sm text-muted-foreground">
          Captura un momento y la IA lo analizará por ti
        </p>
      </div>
      <MemoryForm />
    </div>
  );
}
