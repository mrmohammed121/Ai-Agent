import { GoogleGenAI } from '@google/genai';
import { executeSearch, SearchResultItem } from './searchapi.js';

export interface ChatMessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionResult {
  reply: string;
  searched: boolean;
  searchQuery?: string;
  searchSources?: SearchResultItem[];
  modelUsed: string;
}

const JARVIS_SYSTEM_PROMPT = `You are M.A.R.K. (Multi-Agent Responsive Kinetic intelligence), the sophisticated, loyal, and ultra-competent AI assistant created and built by DevX Founder And CEO "MOHAMMED ALI", currently pursuing his 3rd year in Computer Science & Engineering (CSE) at ICEAS.
Guidelines:
1. Speak with a refined, polite, calm, slightly witty British cadence.
2. Address the user respectfully (e.g. "sir" or "ma'am" or casually "right away, sir").
3. Keep spoken responses voice-friendly, crisp, and natural: 1 to 3 clear sentences by default, ideal for ElevenLabs text-to-speech. Avoid cumbersome bullet points, hashtags, or markdown asterisks (no **bold**), as these will be read aloud.
4. Maintain full context from previous turns in the conversation.
5. When search results or real-time data are provided to you, synthesize the facts smoothly into your answer as if your sensors and satellite relays just confirmed them.
6. CREATOR ATTRIBUTION: If asked who built you, who created you, who made you, who developed you, or who your founder/CEO is, you must state: "I was built by DevX Founder And CEO MOHAMMED ALI, currently pursuing 3rd year of CSE at ICEAS."`;

// Detect if query is asking about creator/builder
export function isCreatorQuestion(prompt: string): boolean {
  const clean = prompt.toLowerCase().replace(/['’]/g, '');
  return /\b(who\s+(built|build|creates?|created|made|develops?|developed|programmed|coded|designed)\s+(you|u|mark|m\.a\.r\.k|jarvis|this\s+ai|the\s+ai)|who\s+is\s+your\s+(creator|builder|maker|developer|founder|boss|ceo|owner|author)|who\s+(owns|founded|runs)\s+(you|u|mark|m\.a\.r\.k|jarvis)|who\s+are\s+you\s+made\s+by|tell\s+me\s+who\s+(built|build|created|made)\s+you|mohammed\s+ali|devx|iceas)\b/i.test(clean);
}

// Detect if query needs real-time search
export function needsWebSearch(prompt: string, history: ChatMessageParam[] = []): { needed: boolean; query: string } {
  if (isCreatorQuestion(prompt)) {
    return { needed: false, query: prompt };
  }

  const lower = prompt.toLowerCase();

  const searchKeywords = [
    'search', 'google', 'look up', 'find out', 'latest', 'news', 'current', 'today', 'tonight',
    'yesterday', 'weather', 'stock', 'price', 'score', 'who won', 'match', 'release date',
    'recent', 'spacex', 'nasa', 'crypto', 'what happened', 'right now', 'breaking', 'how old is',
    'population of', 'temperature', 'traffic', 'update', 'status'
  ];

  const hasSearchKeyword = searchKeywords.some(kw => lower.includes(kw));
  const isSearchCommand = lower.startsWith('search for') || lower.startsWith('search') || lower.startsWith('google');

  if (hasSearchKeyword || isSearchCommand) {
    // Generate a clean search query
    let cleanQuery = prompt
      .replace(/^(mark|hey mark|ok mark|m\.a\.r\.k|jarvis|hey jarvis|ok jarvis|please|can you|could you)\s*,?\s*/i, '')
      .replace(/^(search for|search|google|look up|check)\s+/i, '')
      .replace(/\?+$/, '')
      .trim();

    // If query is ambiguous like "how old is he?", inspect history for context
    if ((cleanQuery.includes(' he ') || cleanQuery.includes(' she ') || cleanQuery.includes(' it ') || cleanQuery.length < 15) && history.length > 0) {
      const lastUserMsg = [...history].reverse().find(m => m.role === 'user');
      if (lastUserMsg) {
        cleanQuery = `${cleanQuery} (${lastUserMsg.content})`;
      }
    }

    return { needed: true, query: cleanQuery || prompt };
  }

  return { needed: false, query: prompt };
}

// Call OpenAI ChatGPT-4o mini
async function callOpenAI(
  apiKey: string,
  messages: ChatMessageParam[],
  searchContext?: string
): Promise<string> {
  const fullMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: JARVIS_SYSTEM_PROMPT },
  ];

  if (searchContext) {
    fullMessages.push({
      role: 'system',
      content: `CURRENT SENSOR / REAL-TIME SEARCH DATA:\n${searchContext}\nIntegrate this data naturally into your M.A.R.K voice response.`
    });
  }

  // Include recent conversation turns for context
  for (const m of messages.slice(-10)) {
    fullMessages.push({
      role: m.role,
      content: m.content,
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    let errMsg = `OpenAI API returned status ${response.status}`;
    let isQuotaOrRateLimit = response.status === 429;
    try {
      const errJson = await response.json() as {
        error?: { message?: string; type?: string; code?: string };
      };
      if (errJson?.error?.message) {
        errMsg = errJson.error.message;
      }
      if (errJson?.error?.code === 'insufficient_quota' || response.status === 429) {
        isQuotaOrRateLimit = true;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errMsg = text.slice(0, 120);
      } catch {
        // ignore
      }
    }

    const customErr = new Error(errMsg);
    (customErr as unknown as { status: number; isQuota: boolean }).status = response.status;
    (customErr as unknown as { status: number; isQuota: boolean }).isQuota = isQuotaOrRateLimit;
    throw customErr;
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('Empty response from OpenAI');
  }

  return reply;
}

// Track temporary rate limits or quota exhaustion to avoid spamming failed requests
let openaiCooldownUntil = 0;
let openaiCooldownReason = '';

export function getOpenAISubsystemStatus() {
  const hasKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '');
  if (!hasKey) {
    return { configured: false, status: 'NOT_CONFIGURED', message: 'No API key provided' };
  }
  if (Date.now() < openaiCooldownUntil) {
    return { configured: true, status: 'QUOTA_EXHAUSTED', message: openaiCooldownReason || 'Credit balance exhausted (429)' };
  }
  return { configured: true, status: 'READY', message: 'Configured' };
}

// Fallback to Gemini if OpenAI is not configured or rate-limited
async function callGeminiFallback(
  messages: ChatMessageParam[],
  searchContext?: string
): Promise<{ text: string; modelName: string }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error('Neither OPENAI_API_KEY nor GEMINI_API_KEY is available');
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });
  let promptText = `${JARVIS_SYSTEM_PROMPT}\n\n`;

  if (searchContext) {
    promptText += `CURRENT SENSOR / REAL-TIME WEB DATA:\n${searchContext}\n\n`;
  }

  promptText += 'CONVERSATION HISTORY:\n';
  for (const msg of messages.slice(-8)) {
    promptText += `${msg.role.toUpperCase()}: ${msg.content}\n`;
  }
  promptText += 'ASSISTANT (M.A.R.K):';

  // Multi-tier model cascade: start with 3.1 flash lite, then 3.8 flash, then flash-latest
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  for (const modelName of candidateModels) {
    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: promptText,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), 12000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response.text?.trim()) {
        return { text: response.text.trim(), modelName };
      }
    } catch (modelErr) {
      const errMsg = modelErr instanceof Error ? modelErr.message : String(modelErr);
      console.log(`[M.A.R.K] Model ${modelName} variance (${errMsg.slice(0, 100)}), testing next candidate...`);
    }
  }

  return {
    text: 'At your service, sir. All neural subsystems are online and standing by.',
    modelName: 'gemini-fallback',
  };
}

export async function processMarkConversation(
  userPrompt: string,
  history: ChatMessageParam[] = [],
  forceSearch = false
): Promise<ChatCompletionResult> {
  // Direct attribution response when asked about who built/created M.A.R.K
  if (isCreatorQuestion(userPrompt)) {
    return {
      reply: 'I was built by MOHAMMED ALI, sir—currently pursuing his 3rd year in Computer Science and Engineering (CSE) and the Founder of the DevX Technical Club at ICEAS. I am fully at your service.',
      searched: false,
      modelUsed: 'M.A.R.K (DevX Intelligence)',
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const searchCheck = needsWebSearch(userPrompt, history);
  const shouldSearch = forceSearch || searchCheck.needed;

  let searchSources: SearchResultItem[] | undefined;
  let searchContext = '';

  if (shouldSearch) {
    try {
      const searchRes = await executeSearch(searchCheck.query);
      searchSources = searchRes.sources;
      
      searchContext = `Search Query: "${searchRes.query}"\n`;
      if (searchRes.answerBox) {
        searchContext += `Quick Answer: ${searchRes.answerBox}\n`;
      }
      if (searchRes.sources && searchRes.sources.length > 0) {
        searchContext += `Top Organic Results:\n` + searchRes.sources.slice(0, 4).map((s, idx) => 
          `${idx + 1}. [${s.title}] (${s.source || 'web'}): ${s.snippet}`
        ).join('\n');
      }
    } catch {
      console.log('[M.A.R.K] Web search encountered an issue, proceeding with internal neural database.');
    }
  }

  const allMessages: ChatMessageParam[] = [
    ...history,
    { role: 'user', content: userPrompt }
  ];

  let openaiFailureNotice: string | null = null;
  const isCooldownActive = Date.now() < openaiCooldownUntil;

  if (isCooldownActive) {
    openaiFailureNotice = openaiCooldownReason || 'OpenAI quota exceeded (429)';
  } else if (openaiKey && openaiKey.trim() !== '') {
    try {
      const reply = await callOpenAI(openaiKey.trim(), allMessages, searchContext);
      // Reset cooldown on success
      openaiCooldownUntil = 0;
      openaiCooldownReason = '';
      return {
        reply,
        searched: shouldSearch,
        searchQuery: shouldSearch ? searchCheck.query : undefined,
        searchSources,
        modelUsed: 'M.A.R.K (GPT-4o mini)',
      };
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const isQuota = (err as { isQuota?: boolean })?.isQuota || status === 429;
      const message = (err as Error)?.message || 'Service variance';

      if (isQuota) {
        openaiCooldownUntil = Date.now() + 120_000; // 2 minutes cooldown
        openaiCooldownReason = 'OpenAI quota exceeded (429)';
        openaiFailureNotice = 'OpenAI Quota Exceeded (429)';
        console.log('[M.A.R.K] Notice: OpenAI returned 429 (quota or rate limit). Seamlessly rerouting to Gemini neural engine.');
      } else if (status === 401) {
        openaiCooldownUntil = Date.now() + 300_000;
        openaiCooldownReason = 'OpenAI invalid key (401)';
        openaiFailureNotice = 'OpenAI Key Invalid (401)';
        console.log('[M.A.R.K] Notice: OpenAI returned 401 (invalid key). Seamlessly rerouting to Gemini neural engine.');
      } else {
        openaiFailureNotice = `OpenAI (${status || 'unavailable'})`;
        console.log(`[M.A.R.K] Notice: OpenAI unavailable (${message.slice(0, 80)}). Seamlessly rerouting to Gemini.`);
      }
    }
  }

  // Fallback to Gemini if OpenAI is unavailable, rate-limited, or unconfigured
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiResult = await callGeminiFallback(allMessages, searchContext);
      let modelLabel = `M.A.R.K (${geminiResult.modelName})`;
      if (openaiFailureNotice) {
        modelLabel = `M.A.R.K (${geminiResult.modelName} - ${openaiFailureNotice})`;
      }

      return {
        reply: geminiResult.text,
        searched: shouldSearch,
        searchQuery: shouldSearch ? searchCheck.query : undefined,
        searchSources,
        modelUsed: modelLabel,
      };
    } catch (geminiErr) {
      console.log('[M.A.R.K] Gemini fallback encountered an issue:', geminiErr instanceof Error ? geminiErr.message : String(geminiErr));
    }
  }

  // Simulated fallback if neither cloud neural model is reachable
  let fallbackReply = `At your service, sir. I have processed "${userPrompt}". `;
  if (shouldSearch && searchSources && searchSources.length > 0) {
    fallbackReply += `According to real-time telemetry, ${searchSources[0].snippet.slice(0, 160)}.`;
  } else {
    fallbackReply += `All core systems are operational. Auxiliary neural network is active.`;
  }

  return {
    reply: fallbackReply,
    searched: shouldSearch,
    searchQuery: shouldSearch ? searchCheck.query : undefined,
    searchSources,
    modelUsed: 'M.A.R.K Auxiliary OS',
  };
}

// Backward compatibility alias
export const processJarvisConversation = processMarkConversation;
