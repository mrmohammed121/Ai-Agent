import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types.js';
import { Send, Mic, Volume2, Trash2, Globe, Sparkles, ChevronDown, ChevronUp, Bot, User, History } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, forceSearch?: boolean) => void;
  onReplayAudio: (text: string) => void;
  onClearChat: () => void;
  isListening: boolean;
  onToggleMic: () => void;
  isThinking: boolean;
  onOpenCommandLogs?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onReplayAudio,
  onClearChat,
  isListening,
  onToggleMic,
  isThinking,
  onOpenCommandLogs,
}) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const samplePrompts = [
    "Who built you?",
    "What's the latest news about SpaceX?",
    "Search Google for recent AI breakthroughs",
    "What's happening in tech right now?",
  ];

  return (
    <div
      id="mark-chat-terminal"
      className="w-full max-w-3xl mx-auto mt-4 rounded-2xl border border-emerald-900/60 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_35px_rgba(16,185,129,0.12)] overflow-hidden transition-all duration-300 hud-glow-green"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-emerald-900/50 text-xs font-mono-tech select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-900/40" />
          </div>
          <span className="font-orbitron font-semibold text-emerald-200 tracking-wider flex items-center gap-1.5 ml-2">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            CONVERSATION TELEMETRY & LOGS
          </span>
          <span className="text-[10px] text-emerald-500/70 hidden sm:inline">
            ({messages.length} ENTRIES)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCommandLogs && (
            <button
              onClick={onOpenCommandLogs}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-[10px] text-emerald-300 hover:text-emerald-100 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer"
              title="Open Command Logs Side Panel"
            >
              <History className="w-3 h-3 text-emerald-400" />
              <span>COMMAND LOGS</span>
            </button>
          )}
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 transition-colors cursor-pointer"
            title="Clear Terminal Cache"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">CLEAR LOG</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/60 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Scrollable Message History Area */}
          <div className="p-4 h-64 sm:h-72 overflow-y-auto space-y-3.5 text-sm font-sans">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  {/* Sender Label & Timestamp */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-emerald-500/80 mb-1 px-1">
                    {isAssistant ? (
                      <>
                        <Bot className="w-3 h-3 text-emerald-400" />
                        <span className="font-bold text-emerald-300">M.A.R.K</span>
                        {msg.modelUsed && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-[9px] text-emerald-400 border border-emerald-800/40">
                            {msg.modelUsed}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-emerald-300">USER</span>
                        <User className="w-3 h-3 text-emerald-400" />
                      </>
                    )}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`relative max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 transition-all text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'rounded-tl-sm bg-slate-900/90 border border-emerald-900/60 text-slate-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'rounded-tr-sm bg-emerald-950/60 border border-emerald-700/60 text-emerald-50'
                    }`}
                  >
                    {/* Search Info Badge if web search was executed */}
                    {msg.searchInfo && (
                      <div className="mb-2 p-2 rounded-lg bg-slate-950/70 border border-emerald-900/50 flex items-center justify-between text-[10px] font-mono-tech text-emerald-300">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          SEARCHAPI: "{msg.searchInfo.query}"
                        </span>
                        <span className="text-emerald-500">
                          {msg.searchInfo.sources?.length || 0} SOURCES
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Audio Replay Button for Assistant Messages */}
                    {isAssistant && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-950 flex items-center justify-between text-[10px] font-mono-tech text-emerald-400/80">
                        <span>VOICE SYNC</span>
                        <button
                          onClick={() => onReplayAudio(msg.content)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>REPLAY AUDIO</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Neural Processing / Thinking Indicator */}
            {isThinking && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-emerald-400 mb-1 px-1">
                  <Bot className="w-3 h-3 text-emerald-400" />
                  <span className="font-bold">J.A.R.V.I.S COMPUTING...</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-900/90 border border-emerald-900/60 p-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono-tech text-emerald-300 animate-pulse">
                    Synthesizing reply via AI Engine & SearchAPI...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions Chips */}
          <div className="px-4 py-2 border-t border-emerald-950/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono-tech text-emerald-400/80 scrollbar-none">
            <span className="shrink-0 text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> SUGGESTED:
            </span>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(prompt)}
                className="shrink-0 px-2.5 py-1 rounded-full border border-emerald-900/60 hover:border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-950/50 text-emerald-300 transition-all cursor-pointer whitespace-nowrap"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Text Chat Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-emerald-900/50 bg-slate-950/90 flex items-center gap-2"
          >
            <input
              id="mark-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask M.A.R.K anything or type a search query..."
              disabled={isThinking}
              className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-900/60 bg-slate-900/70 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-sans"
            />

            {/* Mic trigger */}
            <button
              id="chat-mic-btn"
              type="button"
              onClick={onToggleMic}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'border-emerald-400 bg-emerald-500 text-slate-950 animate-pulse'
                  : 'border-emerald-900/60 bg-slate-900/80 text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950'
              }`}
              title="Speak to M.A.R.K"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Submit button */}
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-orbitron font-semibold text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
