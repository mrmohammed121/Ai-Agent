import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useJarvis } from '../hooks/useJarvis.js';
import { JarvisCore } from '../components/JarvisCore.js';
import { VoiceVisualizer } from '../components/VoiceVisualizer.js';
import { SearchPanel } from '../components/SearchPanel.js';
import { ChatPanel } from '../components/ChatPanel.js';
import { SystemStatus } from '../components/SystemStatus.js';
import { MicButton } from '../components/MicButton.js';
import { CommandLogsPanel } from '../components/CommandLogsPanel.js';
import { Sparkles, VolumeX } from 'lucide-react';

export const Home: React.FC = () => {
  const [showCommandLogs, setShowCommandLogs] = useState(false);

  const {
    state,
    messages,
    currentSearch,
    liveTranscript,
    interimTranscript,
    isMicActive,
    hasSpeechSupport,
    permissionState,
    micError,
    wakeWordEnabled,
    isSpeakingAudio,
    audioFrequencies,
    telemetry,
    executeCommand,
    toggleListening,
    toggleWakeWord,
    replayAudio,
    clearChat,
  } = useJarvis();

  const isThinking = state === 'THINKING' || state === 'SEARCHING' || state === 'GENERATING';
  const isSearching = state === 'SEARCHING';
  const userCommandCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative overflow-hidden bg-cyber-grid selection:bg-emerald-500 selection:text-slate-950">
      {/* Cinematic Sci-Fi Ambient Video Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30 mix-blend-screen scale-105 filter brightness-90 contrast-125"
        >
          <source
            src="https://cdn.sceneai.art/backgrounds/d00af118-6586-40b3-b2e7-5b254bc1cf29.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark gradient & radial vignette to ensure high text contrast and legibility */}
        <div className="absolute inset-0 bg-[#030712]/75 backdrop-blur-[1px]" />
      </div>

      {/* Sci-Fi Radial Glow & Ambient Vignette */}
      <div className="fixed inset-0 bg-radial-vignette pointer-events-none z-[1]" />

      {/* Top HUD Telemetry Bar */}
      <SystemStatus
        telemetry={telemetry}
        onOpenCommandLogs={() => setShowCommandLogs(true)}
        commandCount={userCommandCount}
      />

      {/* Main Command Center Canvas */}
      <main className="flex-1 flex flex-col items-center justify-between px-4 py-6 sm:py-8 z-10 max-w-6xl w-full mx-auto">
        {/* Central M.A.R.K Reactor Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full flex flex-col items-center"
        >
          <JarvisCore
            state={state}
            onActivate={toggleListening}
            isListening={state === 'LISTENING'}
            isSpeaking={isSpeakingAudio}
          />

          {/* Live Acoustic Transcription Stream */}
          <AnimatePresence>
            {(liveTranscript || interimTranscript) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-2 px-5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)] text-center max-w-lg mx-auto"
              >
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono-tech text-emerald-400 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>TRANSCRIBING SPEECH</span>
                </div>
                <p className="text-sm font-sans text-emerald-100 italic">
                  "{liveTranscript || interimTranscript}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Waveform Spectrum */}
          <VoiceVisualizer
            frequencies={audioFrequencies}
            state={state}
            isSpeaking={isSpeakingAudio}
            isListening={state === 'LISTENING'}
          />

          {/* Real-Time Search Status Panel */}
          <SearchPanel
            searchInfo={currentSearch}
            isSearching={isSearching}
          />

          {/* Tactical Mic & Wake-Word Controls */}
          <div className="mt-2 mb-4">
            <MicButton
              state={state}
              isListening={state === 'LISTENING'}
              onToggle={toggleListening}
              wakeWordEnabled={wakeWordEnabled}
              onToggleWakeWord={toggleWakeWord}
              permissionState={permissionState}
              micError={micError}
            />

            {!hasSpeechSupport && (
              <div className="mt-2 text-center text-xs font-mono-tech text-amber-400 flex items-center justify-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5" />
                <span>Speech Recognition unavailable in this browser. Please use text input or Chrome/Edge.</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Conversation Telemetry Terminal */}
        <div className="w-full">
          <ChatPanel
            messages={messages}
            onSendMessage={(text) => executeCommand(text)}
            onReplayAudio={replayAudio}
            onClearChat={clearChat}
            isListening={state === 'LISTENING'}
            onToggleMic={toggleListening}
            isThinking={isThinking}
            onOpenCommandLogs={() => setShowCommandLogs(true)}
          />
        </div>
      </main>

      {/* Command Logs Side Drawer */}
      <CommandLogsPanel
        isOpen={showCommandLogs}
        onClose={() => setShowCommandLogs(false)}
        messages={messages}
        onSelectCommand={(cmd) => {
          setShowCommandLogs(false);
          executeCommand(cmd);
        }}
        onReplayAudio={replayAudio}
      />

      {/* Bottom Technical HUD Footer */}
      <footer className="w-full border-t border-emerald-900/30 bg-slate-950/80 px-4 py-2 flex flex-wrap items-center justify-between text-[10px] font-mono-tech text-emerald-600/80 z-10">
        <div className="flex items-center gap-2">
          <span>PROTOCOLS: AI CORE // SEARCHAPI // ELEVENLABS [VOICE: 3AMU7jXQuQa3oRvRqUmb]</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-500">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            SECURE SERVER PROXIED ENCLAVE
          </span>
          <span className="hidden sm:inline">ALL SECRETS ISOLATED</span>
        </div>
      </footer>
    </div>
  );
};
