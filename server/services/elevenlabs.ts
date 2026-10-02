// ElevenLabs Text-to-Speech integration service

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '3AMU7jXQuQa3oRvRqUmb';

export interface TTSResult {
  success: boolean;
  audioBuffer?: Buffer;
  fallback?: boolean;
  message?: string;
}

export async function synthesizeSpeech(text: string, voiceId?: string): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const targetVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  if (!apiKey) {
    return {
      success: false,
      fallback: true,
      message: 'ELEVENLABS_API_KEY is not configured on the server. Falling back to browser speech synthesis.',
    };
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`;
    
    // Clean text for optimal TTS (remove asterisks, brackets, or code symbols)
    const cleanedText = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      let detailMsg = `HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(await response.text());
        if (parsed?.detail?.message) {
          detailMsg = parsed.detail.message;
        } else if (parsed?.message) {
          detailMsg = parsed.message;
        }
      } catch {
        // ignore
      }
      console.log(`[M.A.R.K] ElevenLabs voice notice (${response.status}: ${detailMsg}). Using browser speech fallback.`);
      return {
        success: false,
        fallback: true,
        message: `ElevenLabs voice notice (${response.status}). Using browser speech fallback.`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      success: true,
      audioBuffer: buffer,
    };
  } catch (error) {
    const errorText = error instanceof Error ? error.message : String(error);
    console.log(`[M.A.R.K] ElevenLabs synthesis unavailable (${errorText}). Using browser speech fallback.`);
    return {
      success: false,
      fallback: true,
      message: 'ElevenLabs unavailable, browser speech synthesis active.',
    };
  }
}
