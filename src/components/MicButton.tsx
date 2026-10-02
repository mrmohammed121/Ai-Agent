import React from 'react';
import { Mic, Radio, AlertTriangle } from 'lucide-react';
import { JarvisState } from '../types.js';
import { MicPermissionState } from '../hooks/useVoiceInput.js';

interface MicButtonProps {
  state: JarvisState;
  isListening: boolean;
  onToggle: () => void;
  wakeWordEnabled: boolean;
  onToggleWakeWord: () => void;
  permissionState?: MicPermissionState;
  micError?: string | null;
}

export const MicButton: React.FC<MicButtonProps> = ({
  state,
  isListening,
  onToggle,
  wakeWordEnabled,
  onToggleWakeWord,
  permissionState = 'prompt',
  micError,
}) => {
  const isSpeaking = state === 'SPEAKING';
  const isDenied = permissionState === 'denied';

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Wake Word Auto-Detection Toggle */}
        <button
          id="toggle-wake-word-btn"
          type="button"
          onClick={onToggleWakeWord}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-mono-tech transition-all cursor-pointer ${
            wakeWordEnabled
              ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle automatic 'Mark' wake-word detection"
        >
          <Radio className={`w-3.5 h-3.5 ${wakeWordEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
          <span>WAKE WORD: {wakeWordEnabled ? 'ACTIVE ("MARK")' : 'MUTED'}</span>
        </button>

        {/* Main Push-To-Talk / Voice Recognition Trigger Button */}
        <button
          id="main-mic-trigger-btn"
          type="button"
          onClick={onToggle}
          className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl border font-orbitron font-semibold text-xs tracking-wider transition-all duration-300 cursor-pointer ${
            isListening
              ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.7)] scale-105'
              : isSpeaking
              ? 'border-teal-400 bg-teal-950/80 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.4)]'
              : isDenied
              ? 'border-amber-500/60 bg-amber-950/40 text-amber-300 hover:border-emerald-400 hover:bg-emerald-950/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'border-emerald-500/60 bg-slate-950/90 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <Mic className="w-4 h-4 animate-bounce" />
              <span>LISTENING (TAP TO STOP / SEND)</span>
            </>
          ) : isSpeaking ? (
            <>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <Mic className="w-4 h-4 text-teal-300 animate-pulse" />
              <span>M.A.R.K SPEAKING...</span>
            </>
          ) : isDenied ? (
            <>
              <Mic className="w-4 h-4 text-amber-400" />
              <span>START VOICE RECOGNITION (ALLOW MIC)</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>START VOICE RECOGNITION</span>
            </>
          )}
        </button>
      </div>

      {/* Permission or Status Feedback */}
      {micError && (
        <div className="text-[11px] font-mono-tech text-amber-400/90 bg-amber-950/40 px-3 py-1.5 rounded-md border border-amber-800/40 flex items-center gap-1.5 animate-fadeIn max-w-md text-center">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{micError}</span>
        </div>
      )}
    </div>
  );
};
