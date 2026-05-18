"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMemories } from "@/hooks/use-memories";
import { ChatPanel } from "@/components/chat/chat-panel";

export default function ChatPage() {
  const { user } = useAuth();
  const { memories, loading } = useMemories(user?.uid);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Chat inteligente</h2>
        <p className="text-sm text-muted-foreground">
          Pregunta sobre tus recuerdos en lenguaje natural
        </p>
      </div>
      {!loading && <ChatPanel memories={memories} />}
    </div>
  );
}
