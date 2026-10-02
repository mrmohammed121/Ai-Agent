import React from 'react';
import { JarvisState } from '../types.js';
import { Activity, Mic, Volume2, Search, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface JarvisCoreProps {
  state: JarvisState;
  onActivate: () => void;
  isListening: boolean;
  isSpeaking: boolean;
}

export const JarvisCore: React.FC<JarvisCoreProps> = ({
  state,
  onActivate,
  isListening,
  isSpeaking,
}) => {
  // Determine color scheme based on state
  const isError = state === 'ERROR';
  const isWakeDetected = state === 'WAKE_WORD_DETECTED' || state === 'ACTIVATING';
  const isSearching = state === 'SEARCHING' || state === 'THINKING';
  const isInteractive = state === 'LISTENING' || isSpeaking;

  // Primary accent colors - Neon Emerald / Cyberpunk Green Theme
  const coreColor = isError
    ? '#ef4444' // red
    : isWakeDetected
    ? '#f59e0b' // amber gold
    : isSearching
    ? '#34d399' // emerald-400
    : isInteractive
    ? '#10b981' // vibrant emerald green
    : '#059669'; // deep emerald green standby

  const glowClass = isError
    ? 'hud-glow-red shadow-red-500/50'
    : isWakeDetected
    ? 'hud-glow-amber shadow-amber-500/50'
    : 'hud-glow-green shadow-emerald-500/40';

  const getStateLabel = () => {
    switch (state) {
      case 'STANDBY':
        return 'STANDBY';
      case 'WAKE_WORD_DETECTED':
        return 'WAKE WORD DETECTED';
      case 'ACTIVATING':
        return 'INITIALIZING SYSTEMS...';
      case 'LISTENING':
        return 'LISTENING FOR COMMAND...';
      case 'TRANSCRIBING':
        return 'PROCESSING SPEECH...';
      case 'THINKING':
        return 'NEURAL COMPUTING...';
      case 'SEARCHING':
        return 'SEARCHING GLOBAL INDEX...';
      case 'GENERATING':
        return 'SYNTHESIZING RESPONSE...';
      case 'SPEAKING':
        return 'TRANSMITTING VOCAL AUDIO...';
      case 'ERROR':
        return 'SYSTEM VARIANCE';
      default:
        return 'ONLINE';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'STANDBY':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'WAKE_WORD_DETECTED':
      case 'ACTIVATING':
        return <Activity className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'LISTENING':
      case 'TRANSCRIBING':
        return <Mic className="w-5 h-5 text-emerald-300 animate-pulse" />;
      case 'THINKING':
        return <Cpu className="w-5 h-5 text-emerald-400 animate-spin" />;
      case 'SEARCHING':
        return <Search className="w-5 h-5 text-emerald-300 animate-pulse" />;
      case 'SPEAKING':
        return <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />;
      case 'ERROR':
        return <AlertTriangle className="w-5 h-5 text-red-400 animate-ping" />;
      default:
        return <Activity className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-6">
      {/* Outer ambient glow field */}
      <div
        className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full transition-all duration-700 pointer-events-none opacity-40 blur-3xl"
        style={{
          backgroundColor: coreColor,
          transform: isInteractive || isWakeDetected ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      {/* Main Core Container */}
      <div
        onClick={onActivate}
        id="mark-core-reactor"
        role="button"
        tabIndex={0}
        aria-label="Activate M.A.R.K Core"
        className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center cursor-pointer group focus:outline-none"
      >
        {/* SVG Holographic Concentric Rings and Ticks */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 320 320"
        >
          {/* Outermost Segmented HUD Ring */}
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke={coreColor}
            strokeWidth="1.5"
            strokeOpacity="0.25"
            strokeDasharray="4 8"
          />

          {/* Clockwise rotating telemetry ticks */}
          <g
            className="animate-spin-slow origin-center"
            style={{
              animationDuration: isInteractive || isSearching ? '8s' : '30s',
            }}
          >
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke={coreColor}
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeDasharray="30 15 5 15 60 20"
            />
            <circle
              cx="160"
              cy="20"
              r="3.5"
              fill={coreColor}
              className="animate-pulse"
            />
            <circle
              cx="160"
              cy="300"
              r="3.5"
              fill={coreColor}
              className="animate-pulse"
            />
            <circle
              cx="20"
              cy="160"
              r="3.5"
              fill={coreColor}
              className="animate-pulse"
            />
            <circle
              cx="300"
              cy="160"
              r="3.5"
              fill={coreColor}
              className="animate-pulse"
            />
          </g>

          {/* Counter-clockwise segmented ring */}
          <g
            className="animate-spin-reverse-slow origin-center"
            style={{
              animationDuration: isInteractive || isSearching ? '6s' : '22s',
            }}
          >
            <circle
              cx="160"
              cy="160"
              r="122"
              fill="none"
              stroke={coreColor}
              strokeWidth="2.5"
              strokeOpacity="0.7"
              strokeDasharray="12 24 8 36"
            />
            <circle
              cx="160"
              cy="160"
              r="108"
              fill="none"
              stroke={coreColor}
              strokeWidth="1"
              strokeOpacity="0.3"
            />
          </g>

          {/* Precision Degree Ticks Ring */}
          <circle
            cx="160"
            cy="160"
            r="94"
            fill="none"
            stroke={coreColor}
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeDasharray="2 6"
          />

          {/* Arc Reactor Inner Radiating spokes */}
          <g
            className={isInteractive ? 'animate-spin-fast origin-center' : 'animate-spin-slow origin-center'}
            style={{ animationDuration: isInteractive ? '5s' : '40s' }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="160"
                y1="160"
                x2={160 + 80 * Math.cos((angle * Math.PI) / 180)}
                y2={160 + 80 * Math.sin((angle * Math.PI) / 180)}
                stroke={coreColor}
                strokeWidth="1"
                strokeOpacity="0.35"
                strokeDasharray="4 8"
              />
            ))}
          </g>
        </svg>

        {/* Central Core Glass Sphere & Plasma Orb */}
        <div
          className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-500 border border-emerald-500/40 backdrop-blur-md ${glowClass} ${
            isInteractive ? 'scale-105' : 'group-hover:scale-105'
          }`}
          style={{
            background: `radial-gradient(circle at center, ${
              isError
                ? 'rgba(239, 68, 68, 0.4)'
                : isWakeDetected
                ? 'rgba(245, 158, 11, 0.45)'
                : 'rgba(16, 185, 129, 0.35)'
            } 0%, rgba(3, 7, 18, 0.9) 75%)`,
          }}
        >
          {/* Glowing Arc Reactor Center Hexagon/Triangle Pattern */}
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-emerald-400/60 flex items-center justify-center transition-all duration-300"
            style={{
              borderColor: coreColor,
              boxShadow: `0 0 25px ${coreColor}66, inset 0 0 15px ${coreColor}44`,
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <span className="font-orbitron font-bold text-xs sm:text-sm text-emerald-200 tracking-wider">
                M.A.R.K
              </span>
              <span className="text-[10px] font-mono-tech text-emerald-400/80 tracking-widest mt-0.5">
                DEVX-1
              </span>
            </div>
          </div>

          {/* Rotating mini telemetry dots */}
          <div
            className="absolute inset-2 rounded-full border border-dashed border-emerald-500/30 animate-spin-reverse-slow pointer-events-none"
            style={{ borderColor: `${coreColor}55` }}
          />
        </div>

        {/* Sound wave ripple rings during speech or listening */}
        {(isSpeaking || isListening) && (
          <>
            <div
              className="absolute w-56 h-56 rounded-full border border-emerald-400/40 animate-ping pointer-events-none"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="absolute w-64 h-64 rounded-full border border-emerald-300/20 animate-ping pointer-events-none"
              style={{ animationDuration: '3s', animationDelay: '0.5s' }}
            />
          </>
        )}
      </div>

      {/* State Diagnostics Readout Pill */}
      <div className="mt-6 flex flex-col items-center">
        <div
          className={`flex items-center gap-2.5 px-5 py-2 rounded-full border text-xs tracking-widest font-mono-tech uppercase transition-all duration-300 ${
            isError
              ? 'border-red-500/60 bg-red-950/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : isWakeDetected
              ? 'border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : isListening
              ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : isSearching
              ? 'border-teal-400 bg-teal-950/50 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
              : 'border-emerald-900/60 bg-slate-950/80 text-emerald-400/90'
          }`}
        >
          {getStateIcon()}
          <span className="font-semibold text-glow-green">{getStateLabel()}</span>
        </div>

        {/* Wake word prompt reminder */}
        <p className="text-[11px] font-mono-tech text-emerald-500/80 mt-2 tracking-widest text-center">
          {state === 'STANDBY' ? (
            <span>SAY <span className="text-emerald-300 font-bold">"MARK"</span> OR CLICK REACTOR TO ACTIVATE</span>
          ) : state === 'LISTENING' ? (
            <span className="text-emerald-300">LISTENING... SPEAK YOUR COMMAND</span>
          ) : (
            <span>AUTONOMOUS NEURAL PROCESSING ACTIVE</span>
          )}
        </p>
      </div>
    </div>
  );
};

export const MarkCore = JarvisCore;
