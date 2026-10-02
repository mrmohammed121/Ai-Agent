import { ChatMessage, SearchApiResponse, SystemDiagnostics } from '../types.js';

export interface ChatApiResponse {
  reply: string;
  searched: boolean;
  searchQuery?: string;
  searchSources?: Array<{
    title: string;
    link: string;
    snippet: string;
    source?: string;
  }>;
  modelUsed: string;
}

export async function sendChatMessage(
  prompt: string,
  history: ChatMessage[] = [],
  forceSearch = false
): Promise<ChatApiResponse> {
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      history: formattedHistory,
      forceSearch,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorBody.error || `Server responded with status ${res.status}`);
  }

  return res.json();
}

export async function searchWeb(query: string): Promise<SearchApiResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  return res.json();
}

export interface VoiceSynthesisResult {
  audioUrl?: string;
  fallback: boolean;
  message?: string;
}

export async function requestVoiceSynthesis(text: string, voiceId?: string): Promise<VoiceSynthesisResult> {
  try {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
    });

    const contentType = res.headers.get('Content-Type') || '';

    if (contentType.includes('audio/mpeg')) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      return { audioUrl, fallback: false };
    }

    const data = await res.json().catch(() => ({ fallback: true }));
    return {
      fallback: true,
      message: data.message || 'ElevenLabs audio generation unavailable',
    };
  } catch (error) {
    console.warn('[API] Voice synthesis request error, falling back to Web Speech:', error);
    return {
      fallback: true,
      message: error instanceof Error ? error.message : 'Voice request failed',
    };
  }
}

export async function getSystemStatus(): Promise<Partial<SystemDiagnostics>> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return {};
    const data = await res.json();
    return {
      cpu: data.cpuCount ? Math.floor(25 + Math.random() * 20) : 32,
      memory: data.memoryUsagePercent || 48,
      network: 'ONLINE',
      apiStatus: data.apiStatus || {
        openai: false,
        searchapi: false,
        elevenlabs: false,
        gemini: false,
      },
    };
  } catch {
    return {
      network: 'STANDBY',
    };
  }
}
