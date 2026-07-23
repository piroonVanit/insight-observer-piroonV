export interface VideoMetadata {
  title: string;
  duration_seconds: number;
  description: string;
  transcript: string;
}

export interface FrameSample {
  id: string;
  timestamp: number;
  timestampStr: string;
  imageBase64: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FinalSynthesisResult {
  finalPrompt: string;
  finalReport: string;
}
