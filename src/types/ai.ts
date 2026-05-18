export interface MemoryAnalysis {
  summary: string;
  keywords: string[];
  entities: string[];
  emotionalTone?: string;
  insights?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
