import React from 'react';
import { JarvisState } from '../types.js';

interface VoiceVisualizerProps {
  frequencies: number[];
  state: JarvisState;
  isSpeaking: boolean;
  isListening: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  frequencies,
  state,
  isSpeaking,
  isListening,
}) => {
  const isInteractive = isSpeaking || isListening;
  const isSearching = state === 'SEARCHING' || state === 'THINKING';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3">
      {/* Visualizer Frame Header */}
      <div className="flex items-center justify-between text-[10px] font-mono-tech text-emerald-500/80 mb-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isInteractive ? 'bg-emerald-400 animate-ping' : 'bg-emerald-600'}`} />
          SPECTRUM ANALYZER // 48kHz
        </span>
        <span>
          {isSpeaking ? 'TRANSMITTING AUDIO' : isListening ? 'ACOUSTIC RECEPTION' : 'CARRIER WAVE IDLE'}
        </span>
      </div>

      {/* Futuristic Oscilloscope / Frequency Bar Graph */}
      <div
        id="voice-audio-waveform"
        className="relative h-16 w-full rounded-xl border border-emerald-900/50 bg-slate-950/60 backdrop-blur-sm px-3 flex items-center justify-center gap-1 overflow-hidden hud-glow-green"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

        {/* Center horizontal laser guide line */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/25 pointer-events-none" />

        {/* Symmetrical Audio Bars */}
        {frequencies.map((freq, idx) => {
          // Calculate height with minimum visible threshold
          const normalized = Math.max(8, (freq / 100) * 52);
          const barColor = isSpeaking
            ? 'bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
            : isListening
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
            : isSearching
            ? 'bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]'
            : 'bg-emerald-800/60';

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-center h-full"
            >
              <div
                className={`w-full rounded-full transition-all duration-75 ${barColor}`}
                style={{
                  height: `${normalized}px`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
