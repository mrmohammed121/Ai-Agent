export type MarkState =
  | 'STANDBY'
  | 'WAKE_WORD_DETECTED'
  | 'ACTIVATING'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'THINKING'
  | 'SEARCHING'
  | 'GENERATING'
  | 'SPEAKING'
  | 'ERROR';

// Backward compatibility alias
export type JarvisState = MarkState;

export interface SearchSource {
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

export interface SearchInfo {
  query: string;
  status: 'searching' | 'analyzing' | 'completed' | 'failed';
  sources: SearchSource[];
  totalResults?: number;
}

export interface SearchApiResponse {
  query: string;
  sources: SearchSource[];
  answerBox?: string;
  totalResults?: number;
  engine?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
  searchInfo?: SearchInfo;
  audioUrl?: string;
}

export interface SystemDiagnostics {
  cpu: number;
  memory: number;
  network: 'ONLINE' | 'STANDBY' | 'OFFLINE';
  ping: number;
  reactorLevel: number;
  voiceEngine: 'elevenlabs' | 'webspeech';
  wakeWordActive: boolean;
  apiStatus: {
    openai: boolean;
    openaiMessage?: string;
    openaiStatus?: 'READY' | 'QUOTA_EXHAUSTED' | 'NOT_CONFIGURED';
    searchapi: boolean;
    elevenlabs: boolean;
    gemini: boolean;
  };
}

export interface VoiceOption {
  id: string;
  name: string;
  type: 'elevenlabs' | 'browser';
}
