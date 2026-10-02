import { useRef, useCallback } from 'react';

const WAKE_WORDS = [
  'mark',
  'hey mark',
  'ok mark',
  'okay mark',
  'm.a.r.k',
  'm.a.r.k.',
  'jarvis',
  'hey jarvis',
  'ok jarvis',
  'okay jarvis',
];

export interface WakeWordMatch {
  detected: boolean;
  wakeWordUsed: string;
  commandText: string;
}

export function useWakeWord(onWakeWordDetected?: (match: WakeWordMatch) => void) {
  const lastDetectedTimestamp = useRef(0);

  const checkWakeWord = useCallback((text: string): WakeWordMatch => {
    const lower = text.toLowerCase().trim();
    const now = Date.now();

    // Prevent re-triggering within 2 seconds
    if (now - lastDetectedTimestamp.current < 2000) {
      return { detected: false, wakeWordUsed: '', commandText: '' };
    }

    for (const phrase of WAKE_WORDS) {
      const matchIndex = lower.indexOf(phrase);
      if (matchIndex !== -1) {
        lastDetectedTimestamp.current = now;

        // Extract any words spoken after the wake word
        const afterWakeWord = lower.substring(matchIndex + phrase.length).replace(/^[,.:;\s]+/, '').trim();

        const match: WakeWordMatch = {
          detected: true,
          wakeWordUsed: phrase,
          commandText: afterWakeWord,
        };

        if (onWakeWordDetected) {
          onWakeWordDetected(match);
        }

        return match;
      }
    }

    return { detected: false, wakeWordUsed: '', commandText: '' };
  }, [onWakeWordDetected]);

  return {
    checkWakeWord,
  };
}
