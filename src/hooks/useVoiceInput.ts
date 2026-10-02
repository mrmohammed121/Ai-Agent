import { useState, useEffect, useRef, useCallback } from 'react';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface UseVoiceInputOptions {
  continuous?: boolean;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onAudioLevel?: (level: number) => void;
}

export function useVoiceInput(options?: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [hasSupport, setHasSupport] = useState(true);
  const [permissionState, setPermissionState] = useState<MicPermissionState>('prompt');
  const [error, setError] = useState<string | null>(null);

  // References
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const onResultRef = useRef(options?.onResult);
  onResultRef.current = options?.onResult;

  const onErrorRef = useRef(options?.onError);
  onErrorRef.current = options?.onError;

  const onAudioLevelRef = useRef(options?.onAudioLevel);
  onAudioLevelRef.current = options?.onAudioLevel;

  // Cleanup hardware audio stream and analyser
  const stopAudioAnalyzer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    onAudioLevelRef.current?.(0);
  }, []);

  // Non-blocking hardware stream analyzer for oscilloscope amplitude
  const startAudioAnalyzer = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    // Reuse existing stream if live
    if (mediaStreamRef.current && mediaStreamRef.current.getAudioTracks().some((t) => t.readyState === 'live')) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!isListeningRef.current || !analyserRef.current) {
            onAudioLevelRef.current?.(0);
            return;
          }
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          onAudioLevelRef.current?.(Math.min(1, avg / 128));
          animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
      }
    } catch {
      // AudioContext analyzer is secondary to speech recognition, continue gracefully
    }
  }, []);

  // Initialize or recreate the SpeechRecognition instance
  const setupRecognition = useCallback(() => {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setHasSupport(false);
      setPermissionState('unsupported');
      return null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = options?.continuous ?? true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setPermissionState('granted');
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => (prev ? `${prev} ${currentFinal}` : currentFinal).trim());
          onResultRef.current?.(currentFinal.trim(), true);
        }

        setInterimTranscript(currentInterim);
        if (currentInterim) {
          onResultRef.current?.(currentInterim.trim(), false);
        }
      };

      recognition.onerror = (event: any) => {
        const errType = event?.error || 'unknown';

        // Benign pause / no speech events
        if (errType === 'no-speech' || errType === 'aborted') {
          return;
        }

        if (errType === 'not-allowed') {
          setPermissionState('denied');
          setIsListening(false);
          isListeningRef.current = false;
          stopAudioAnalyzer();
          setError('Microphone access blocked. Click the lock icon in your browser address bar to allow microphone.');
        } else if (errType === 'audio-capture') {
          setError('No microphone hardware detected or microphone is in use.');
        } else if (errType === 'network') {
          console.warn('[SpeechRecognition] Network hiccup, auto-recovery engaged');
        } else {
          setError(`Microphone notice: ${errType}`);
        }

        onErrorRef.current?.(errType);
      };

      recognition.onend = () => {
        // If continuous mode is on and user still wants listening, restart seamlessly
        if (options?.continuous && isListeningRef.current) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e: any) {
                if (e?.name !== 'InvalidStateError') {
                  setTimeout(() => {
                    if (isListeningRef.current && recognitionRef.current) {
                      try {
                        recognitionRef.current.start();
                      } catch {}
                    }
                  }, 300);
                }
              }
            }
          }, 100);
        } else {
          setIsListening(false);
          isListeningRef.current = false;
          stopAudioAnalyzer();
        }
      };

      recognitionRef.current = recognition;
      setHasSupport(true);
      return recognition;
    } catch (err) {
      console.warn('[useVoiceInput] SpeechRecognition setup error:', err);
      setHasSupport(false);
      return null;
    }
  }, [options?.continuous, stopAudioAnalyzer]);

  // Initial setup on mount
  useEffect(() => {
    setupRecognition();

    return () => {
      clearTimeout(restartTimerRef.current);
      stopAudioAnalyzer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [setupRecognition, stopAudioAnalyzer]);

  // Synchronous Start Listening - preserves user gesture activation
  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    let rec = recognitionRef.current;
    if (!rec) {
      rec = setupRecognition();
    }

    if (!rec) {
      setError('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    isListeningRef.current = true;

    try {
      rec.start();
      setIsListening(true);
      setPermissionState('granted');
    } catch (err: any) {
      if (err?.name === 'InvalidStateError') {
        // Recognition is already active
        setIsListening(true);
      } else {
        console.warn('[SpeechRecognition] start notice:', err?.message || err);
        // If start failed because instance was dead, recreate and retry
        const freshRec = setupRecognition();
        if (freshRec) {
          try {
            freshRec.start();
            setIsListening(true);
          } catch (retryErr: any) {
            console.warn('[SpeechRecognition] retry failed:', retryErr);
          }
        }
      }
    }

    // Start background audio analysis non-blockingly
    startAudioAnalyzer();
  }, [setupRecognition, startAudioAnalyzer]);

  // Stop Listening - gracefully halts recognition & hardware stream
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearTimeout(restartTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    stopAudioAnalyzer();
    setIsListening(false);
  }, [stopAudioAnalyzer]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    hasSupport,
    permissionState,
    permissionGranted: permissionState === 'granted',
    error,
    startListening,
    stopListening,
    resetTranscript,
    stopAudioAnalyzer,
  };
}
