export interface AIResponse {
  score: number;
  engagement: number;
  conversion: number;
  suggestions: Suggestion[];
  optimized_text: string;
}

export interface Suggestion {
  title: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
