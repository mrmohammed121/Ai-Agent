import React, { useState } from 'react';
import { SystemDiagnostics } from '../types.js';
import { Cpu, Wifi, Zap, Volume2, Key, Info, X, CheckCircle2, AlertCircle, Sparkles, History, ExternalLink } from 'lucide-react';
import { AboutModal } from './AboutModal.js';

interface SystemStatusProps {
  telemetry: SystemDiagnostics;
  onOpenCommandLogs?: () => void;
  commandCount?: number;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ telemetry, onOpenCommandLogs, commandCount = 0 }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <>
      {/* Top HUD Telemetry Bar */}
      <header
        id="mark-system-header"
        className="w-full border-b border-emerald-900/40 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tech"
      >
        {/* Left: Branding & Core Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-orbitron font-bold text-sm text-emerald-200 tracking-wider">
              M.A.R.K
            </span>
          </div>
          <span className="hidden sm:inline-block text-emerald-500/70 border-l border-emerald-900/60 pl-3">
            DEVX NEURAL INTERFACE
          </span>
        </div>

        {/* Center/Right: Live Telemetry Gauges & Actions */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-emerald-400/90">
          {/* CPU Metric */}
          <div className="flex items-center gap-1.5" title="CPU Core Processing Load">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>CPU <span className="text-emerald-200 font-semibold">{telemetry.cpu}%</span></span>
          </div>

          {/* Network Metric */}
          <div className="flex items-center gap-1.5" title="Neural Grid Latency">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">{telemetry.network}</span>
            <span className="hidden md:inline text-emerald-600">({telemetry.ping}ms)</span>
          </div>

          {/* Arc Reactor Level */}
          <div className="hidden sm:flex items-center gap-1.5" title="Arc Reactor Chamber Output">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>REACTOR <span className="text-amber-300 font-semibold">{telemetry.reactorLevel}%</span></span>
          </div>

          {/* Voice Mode */}
          <div className="hidden lg:flex items-center gap-1.5" title="Current Vocal Speech Engine">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>VOICE: <span className="text-emerald-200 uppercase">{telemetry.voiceEngine}</span></span>
          </div>

          {/* Command Logs Trigger */}
          {onOpenCommandLogs && (
            <button
              id="command-logs-header-btn"
              onClick={onOpenCommandLogs}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 font-orbitron font-semibold text-[11px] tracking-wide shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] transition-all cursor-pointer"
              title="Open Command Logs Side Panel"
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMMAND LOGS</span>
              {commandCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px]">
                  {commandCount}
                </span>
              )}
            </button>
          )}

          {/* About Us Clickable Action Button */}
          <button
            id="about-us-nav-btn"
            onClick={() => setShowAboutModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 font-orbitron font-semibold text-[11px] tracking-wide shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
            title="About Founder Mohammed Ali, DevX Technical Club, and AI Agent Architecture"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>ABOUT US</span>
          </button>

          {/* System API Diagnostics Trigger */}
          <button
            id="system-keys-config-btn"
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 transition-all cursor-pointer"
            title="View API Subsystems Status"
          >
            <Key className="w-3 h-3 text-emerald-400" />
            <span>API STATUS</span>
          </button>
        </div>
      </header>

      {/* About Us & Architecture Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* API Configuration & Diagnostics Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-500/50 bg-slate-950/95 p-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                <h3 className="font-orbitron text-sm font-bold text-emerald-200">
                  M.A.R.K SUBSYSTEM APIS & CREDENTIALS
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keys Status List */}
            <div className="space-y-3 font-mono-tech text-xs">
              {/* OpenAI Status */}
              <div className="flex items-start justify-between p-3 rounded-lg border border-emerald-900/40 bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-200">OPENAI_API_KEY</span>
                    {telemetry.apiStatus.openaiStatus === 'QUOTA_EXHAUSTED' ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                        <AlertCircle className="w-3 h-3" /> CREDITS EXHAUSTED (429)
                      </span>
                    ) : telemetry.apiStatus.openai ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> CONFIGURED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="w-3 h-3" /> FALLBACK ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    {telemetry.apiStatus.openaiStatus === 'QUOTA_EXHAUSTED'
                      ? 'OpenAI credit balance is exhausted. M.A.R.K is seamlessly routing conversation to Gemini with zero downtime.'
                      : 'Powers conversational brain via ChatGPT-4o mini with automatic fallback to Gemini.'}
                  </p>
                </div>
              </div>

              {/* SearchAPI Status */}
              <div className="flex items-start justify-between p-3 rounded-lg border border-emerald-900/40 bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-200">SEARCHAPI_API_KEY</span>
                    {telemetry.apiStatus.searchapi ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="w-3 h-3" /> FALLBACK ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Google Search engine live data retrieval for current events.
                  </p>
                </div>
              </div>

              {/* ElevenLabs Status */}
              <div className="flex items-start justify-between p-3 rounded-lg border border-emerald-900/40 bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-200">ELEVENLABS_API_KEY</span>
                    {telemetry.apiStatus.elevenlabs ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> WEB SPEECH BROWSER TTS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    ElevenLabs natural voice speech synthesis. Seamlessly falls back to browser Web Speech API if key is pending.
                  </p>
                </div>
              </div>

              {/* Gemini Status */}
              <div className="flex items-start justify-between p-3 rounded-lg border border-emerald-900/40 bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-200">GEMINI_API_KEY</span>
                    {telemetry.apiStatus.gemini ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE (HIGH-CAPACITY BACKUP)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        STANDBY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Multi-tier Google GenAI model cascade (`gemini-3.1-flash-lite`, `gemini-3.8-flash`, `gemini-flash-latest`). Automatically engages with zero downtime when OpenAI credits or rate limits are reached.
                  </p>
                </div>
              </div>
            </div>

            {/* Information Notice */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-300">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="font-sans space-y-1.5">
                <p>
                  <strong>Autonomous Failover Active:</strong> If any upstream API hits rate limits or exhausts its credit quota, M.A.R.K automatically switches to your dedicated Gemini project API keys.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-400/90 pt-1">
                  <span>Google AI Studio Key Management (Project: <code className="text-emerald-200">gen-lang-client-0182759436</code>):</span>
                  <a
                    href="https://aistudio.google.com/api-keys?project=gen-lang-client-0182759436"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 font-mono-tech text-[10px] transition-colors"
                  >
                    <span>Manage Gemini API Keys</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-orbitron font-semibold text-xs transition-colors cursor-pointer"
              >
                RETURN TO HUD
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
