import { useState, useEffect, useRef, useCallback } from 'react';
import { JarvisState, ChatMessage, SearchInfo, SystemDiagnostics } from '../types.js';
import { sendChatMessage, requestVoiceSynthesis, getSystemStatus } from '../services/api.js';
import { soundManager } from '../utils/audioEffects.js';
import { useVoiceInput, MicPermissionState } from './useVoiceInput.js';
import { useWakeWord } from './useWakeWord.js';

export const ELEVENLABS_MARK_VOICE_ID = '3AMU7jXQuQa3oRvRqUmb';
export const ELEVENLABS_JARVIS_VOICE_ID = ELEVENLABS_MARK_VOICE_ID; // Backward compatibility alias

export function useJarvis() {
  const [state, setState] = useState<JarvisState>('STANDBY');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      role: 'assistant',
      content: 'Good day, sir. M.A.R.K. online and standing by. Say "Mark" or press the microphone to issue a command.',
      timestamp: Date.now(),
    },
  ]);
  const [currentSearch, setCurrentSearch] = useState<SearchInfo | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(new Array(24).fill(10));
  const [telemetry, setTelemetry] = useState<SystemDiagnostics>({
    cpu: 34,
    memory: 42,
    network: 'ONLINE',
    ping: 18,
    reactorLevel: 98.6,
    voiceEngine: 'elevenlabs',
    wakeWordActive: true,
    apiStatus: {
      openai: false,
      searchapi: false,
      elevenlabs: false,
      gemini: false,
    },
  });

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const audioLevelRef = useRef(0);
  audioLevelRef.current = audioLevel;

  const latestSpokenTextRef = useRef('');
  const silenceTimerRef = useRef<any>(null);

  // Poll system diagnostics periodically
  useEffect(() => {
    const updateStats = async () => {
      const stats = await getSystemStatus();
      setTelemetry((prev) => ({
        ...prev,
        ...stats,
        cpu: stats.cpu || Math.floor(28 + Math.random() * 15),
        reactorLevel: Number((98.2 + Math.random() * 0.8).toFixed(1)),
        ping: Math.floor(14 + Math.random() * 12),
      }));
    };
    updateStats();
    const interval = setInterval(updateStats, 8000);
    return () => clearInterval(interval);
  }, []);

  // Voice synthesis player using ElevenLabs voice "3AMU7jXQuQa3oRvRqUmb" or Browser SpeechSynthesis fallback
  const speakText = useCallback(async (text: string) => {
    // Stop any existing speech
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setState('SPEAKING');
    setIsSpeakingAudio(true);

    try {
      const result = await requestVoiceSynthesis(text, ELEVENLABS_JARVIS_VOICE_ID);

      if (result.audioUrl && !result.fallback) {
        setTelemetry((prev) => ({ ...prev, voiceEngine: 'elevenlabs' }));
        const audio = new Audio(result.audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeakingAudio(false);
          setState('STANDBY');
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          console.warn('[Audio] Failed to play ElevenLabs audio stream, using browser speech fallback.');
          fallbackBrowserSpeech(text);
        };

        await audio.play();
        return;
      }

      // Browser Web Speech fallback
      fallbackBrowserSpeech(text);
    } catch {
      fallbackBrowserSpeech(text);
    }
  }, []);

  // Browser speech synthesis fallback with British accent & Stark cadence
  const fallbackBrowserSpeech = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeakingAudio(false);
      setState('STANDBY');
      return;
    }

    setTelemetry((prev) => ({ ...prev, voiceEngine: 'webspeech' }));
    window.speechSynthesis.cancel();

    // Clean text for speech
    const clean = text
      .replace(/[*#`_~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.02;
    utterance.pitch = 0.95;

    // Pick British English voice if present
    const voices = window.speechSynthesis.getVoices();
    const markVoice =
      voices.find(
        (v) =>
          v.lang.includes('en-GB') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('oliver') ||
          v.name.toLowerCase().includes('british') ||
          v.name.toLowerCase().includes('uk')
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (markVoice) {
      utterance.voice = markVoice;
    }

    utterance.onstart = () => {
      setIsSpeakingAudio(true);
      setState('SPEAKING');
    };

    utterance.onend = () => {
      setIsSpeakingAudio(false);
      setState('STANDBY');
    };

    utterance.onerror = () => {
      setIsSpeakingAudio(false);
      setState('STANDBY');
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Process a user query through full pipeline: ChatGPT-4o mini + SearchAPI + ElevenLabs
  const executeCommand = useCallback(
    async (userPrompt: string, forceSearch = false) => {
      if (!userPrompt.trim()) return;

      clearTimeout(silenceTimerRef.current);
      latestSpokenTextRef.current = '';
      setLiveTranscript('');

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userPrompt.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      soundManager.playSearchSweep();

      // Step 1: Thinking
      setState('THINKING');

      try {
        // Step 2: Check if search will run and reflect in UI
        const willSearch =
          forceSearch || /latest|news|current|today|spacex|weather|price|search|who won/i.test(userPrompt);
        if (willSearch) {
          setState('SEARCHING');
          setCurrentSearch({
            query: userPrompt,
            status: 'searching',
            sources: [],
          });
        }

        // Step 3: Call server API
        const result = await sendChatMessage(userPrompt, messages, forceSearch);

        if (result.searched && result.searchSources) {
          setCurrentSearch({
            query: result.searchQuery || userPrompt,
            status: 'completed',
            sources: result.searchSources,
            totalResults: result.searchSources.length,
          });
        } else {
          setCurrentSearch(null);
        }

        setState('GENERATING');

        // Append assistant message
        const assistantMessage: ChatMessage = {
          id: `mark-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          timestamp: Date.now(),
          modelUsed: result.modelUsed,
          searchInfo:
            result.searched && result.searchSources
              ? {
                  query: result.searchQuery || userPrompt,
                  status: 'completed',
                  sources: result.searchSources,
                }
              : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Step 4: ElevenLabs / Voice response
        await speakText(result.reply);
      } catch (error) {
        console.error('[M.A.R.K] Execution error:', error);
        soundManager.playError();
        setState('ERROR');

        const errMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `My apologies, sir. I encountered an operational variance: ${
            error instanceof Error ? error.message : 'Unknown anomaly'
          }. Core diagnostic servers are ready for retry.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);

        setTimeout(() => {
          setState('STANDBY');
        }, 4000);
      }
    },
    [messages, speakText]
  );

  // Wake word detector callback
  const handleWakeWordMatch = useCallback(
    (match: { detected: boolean; commandText: string }) => {
      soundManager.playWakeChime();
      setState('WAKE_WORD_DETECTED');

      setTimeout(() => {
        setState('ACTIVATING');

        setTimeout(() => {
          if (match.commandText && match.commandText.length > 2) {
            executeCommand(match.commandText);
          } else {
            setState('LISTENING');
          }
        }, 500);
      }, 400);
    },
    [executeCommand]
  );

  const { checkWakeWord } = useWakeWord(handleWakeWordMatch);

  // Speech Recognition hook
  const {
    isListening: isMicActive,
    transcript,
    interimTranscript,
    hasSupport: hasSpeechSupport,
    permissionState,
    permissionGranted,
    error: micError,
    startListening: startMic,
    stopListening: stopMic,
  } = useVoiceInput({
    continuous: true,
    onAudioLevel: (lvl) => {
      setAudioLevel(lvl);
    },
    onResult: (text: string, isFinal: boolean) => {
      const cleanText = text.trim();
      if (!cleanText) return;

      latestSpokenTextRef.current = cleanText;
      setLiveTranscript(cleanText);

      const currentState = stateRef.current;

      // In STANDBY or WAKE_WORD_DETECTED, scan for wake word "Mark"
      if (currentState === 'STANDBY' && wakeWordEnabled) {
        checkWakeWord(cleanText);
        return;
      }

      // In LISTENING mode, accept speech as command
      if (currentState === 'LISTENING') {
        clearTimeout(silenceTimerRef.current);

        // If browser finalized utterance, execute immediately
        if (isFinal && cleanText.length > 1) {
          stopMic();
          setState('TRANSCRIBING');
          executeCommand(cleanText);
          return;
        }

        // Smart silence detection: if user stops speaking for 1.6s, auto-commit command
        silenceTimerRef.current = setTimeout(() => {
          if (stateRef.current === 'LISTENING') {
            const spoken = latestSpokenTextRef.current.trim();
            if (spoken.length > 1) {
              stopMic();
              setState('TRANSCRIBING');
              executeCommand(spoken);
            }
          }
        }, 1600);
      }
    },
  });

  // Stop mic when transitioning out of listening
  useEffect(() => {
    if (state !== 'LISTENING' && state !== 'STANDBY') {
      stopMic();
    }
  }, [state, stopMic]);

  // Oscilloscope frequency animation loop reacting to states & mic amplitude
  useEffect(() => {
    let phase = 0;
    const updateFrequencies = () => {
      phase += 0.08;
      const bands = 24;
      const freqs: number[] = [];

      const currentState = stateRef.current;
      const isSpeaking = currentState === 'SPEAKING';
      const isListening = currentState === 'LISTENING';
      const isThinking = currentState === 'THINKING' || currentState === 'SEARCHING';
      const currentLevel = audioLevelRef.current;

      for (let i = 0; i < bands; i++) {
        let val = 8;
        if (isSpeaking) {
          const wave1 = Math.sin(phase * 2 + i * 0.45);
          const wave2 = Math.cos(phase * 3 - i * 0.3);
          val = Math.max(12, Math.floor(45 + 40 * Math.abs(wave1 * wave2) + Math.random() * 20));
        } else if (isListening) {
          const micBoost = currentLevel * 80;
          const wave = Math.sin(phase * 2 + i * 0.5);
          val = Math.max(10, Math.floor(18 + micBoost + 25 * Math.abs(wave) + Math.random() * 12));
        } else if (isThinking) {
          val = Math.floor(15 + 25 * Math.abs(Math.sin(phase * 3 + (i / bands) * Math.PI)));
        } else {
          val = Math.floor(6 + 8 * Math.abs(Math.sin(phase + i * 0.2)));
        }
        freqs.push(Math.min(100, Math.max(5, val)));
      }

      setAudioFrequencies(freqs);
      animFrameRef.current = requestAnimationFrame(updateFrequencies);
    };

    animFrameRef.current = requestAnimationFrame(updateFrequencies);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Manual Trigger: User taps the Central Mic HUD button or the Arc Reactor
  const toggleListening = useCallback(() => {
    soundManager.playClick();

    if (state === 'LISTENING') {
      clearTimeout(silenceTimerRef.current);
      const spoken = latestSpokenTextRef.current.trim();
      // If user has spoken something and taps the button, submit the command!
      if (spoken.length > 1) {
        stopMic();
        setState('TRANSCRIBING');
        executeCommand(spoken);
        return;
      }
      // Otherwise return to STANDBY
      setState('STANDBY');
      stopMic();
    } else if (state === 'SPEAKING') {
      // Interrupt speech immediately and switch to listening
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingAudio(false);
      setState('LISTENING');
      latestSpokenTextRef.current = '';
      setLiveTranscript('');
      startMic();
    } else {
      // Activate listening immediately
      soundManager.playWakeChime();
      setState('LISTENING');
      latestSpokenTextRef.current = '';
      setLiveTranscript('');
      startMic();
    }
  }, [state, startMic, stopMic, executeCommand]);

  // Wake word activation toggle
  const toggleWakeWord = useCallback(() => {
    soundManager.playClick();
    setWakeWordEnabled((prev) => {
      const next = !prev;
      setTelemetry((t) => ({ ...t, wakeWordActive: next }));
      if (next && !isMicActive && stateRef.current === 'STANDBY') {
        startMic();
      } else if (!next && stateRef.current === 'STANDBY') {
        stopMic();
      }
      return next;
    });
  }, [isMicActive, startMic, stopMic]);

  // Replay a message
  const replayAudio = useCallback(
    (text: string) => {
      soundManager.playClick();
      speakText(text);
    },
    [speakText]
  );

  // Clear chat log
  const clearChat = useCallback(() => {
    soundManager.playClick();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation cache cleared, sir. Ready for instructions.',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return {
    state,
    setState,
    messages,
    currentSearch,
    liveTranscript,
    interimTranscript,
    isMicActive,
    hasSpeechSupport,
    permissionState,
    permissionGranted,
    micError,
    wakeWordEnabled,
    isSpeakingAudio,
    audioFrequencies,
    audioLevel,
    telemetry,
    voiceId: ELEVENLABS_MARK_VOICE_ID,
    executeCommand,
    toggleListening,
    toggleWakeWord,
    startMic,
    stopMic,
    replayAudio,
    clearChat,
  };
}

export const useMark = useJarvis;
