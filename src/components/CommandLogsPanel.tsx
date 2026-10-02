import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types.js';
import {
  History,
  X,
  Search,
  User,
  Bot,
  Volume2,
  Clock,
  Sparkles,
  Terminal,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Copy,
  Check,
} from 'lucide-react';

export interface CommandLogEntry {
  id: string;
  commandNumber: number;
  userMessage: ChatMessage;
  assistantMessage?: ChatMessage;
  timestamp: number;
  executionDurationMs?: number;
  modelUsed?: string;
  searched?: boolean;
}

interface CommandLogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSelectCommand?: (commandText: string) => void;
  onReplayAudio?: (text: string) => void;
}

export const CommandLogsPanel: React.FC<CommandLogsPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onSelectCommand,
  onReplayAudio,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'VOICE' | 'SEARCH'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Group messages into interactions (Pairs of User command + AI response)
  const commandEntries: CommandLogEntry[] = useMemo(() => {
    const list: CommandLogEntry[] = [];
    let commandCounter = 1;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        // Look ahead for the assistant response immediately following this user query
        const nextMsg = messages[i + 1];
        const assistantMsg = nextMsg && nextMsg.role === 'assistant' ? nextMsg : undefined;

        list.push({
          id: msg.id,
          commandNumber: commandCounter++,
          userMessage: msg,
          assistantMessage: assistantMsg,
          timestamp: msg.timestamp,
          executionDurationMs: assistantMsg
            ? Math.max(120, assistantMsg.timestamp - msg.timestamp)
            : undefined,
          modelUsed: assistantMsg?.modelUsed,
          searched: Boolean(assistantMsg?.searchInfo?.sources?.length),
        });
      }
    }

    return list.reverse(); // Newest interactions first
  }, [messages]);

  // Filter logs by search keyword and filter criteria
  const filteredEntries = useMemo(() => {
    return commandEntries.filter((entry) => {
      const q = searchTerm.toLowerCase();
      const matchesQuery =
        !q ||
        entry.userMessage.content.toLowerCase().includes(q) ||
        (entry.assistantMessage?.content.toLowerCase().includes(q) ?? false) ||
        (entry.modelUsed?.toLowerCase().includes(q) ?? false);

      if (!matchesQuery) return false;

      if (selectedFilter === 'SEARCH') {
        return entry.searched;
      }
      if (selectedFilter === 'VOICE') {
        return Boolean(entry.assistantMessage?.content);
      }
      return true;
    });
  }, [commandEntries, searchTerm, selectedFilter]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Side Drawer Panel */}
          <motion.aside
            id="command-logs-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md sm:max-w-lg z-50 flex flex-col bg-slate-950/95 border-l border-emerald-500/30 shadow-[-15px_0_40px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-slate-200"
            role="dialog"
            aria-label="Command Logs Drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-emerald-900/50 bg-slate-900/60 font-mono-tech select-none">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    <h2 className="font-orbitron font-bold text-sm text-emerald-200 tracking-wider">
                      COMMAND LOGS
                    </h2>
                  </div>
                  <p className="text-[10px] text-emerald-400/70 font-mono-tech tracking-wide">
                    SESSION AUDIT // {commandEntries.length} COMMANDS RECORDED
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 transition-colors border border-transparent hover:border-emerald-800/60 cursor-pointer"
                aria-label="Close command logs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3.5 border-b border-emerald-900/40 bg-slate-950/60 space-y-2.5">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by keyword, model, or response..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/80 border border-emerald-900/60 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-sans"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Quick Filter Badges */}
              <div className="flex items-center justify-between gap-1.5 text-[11px] font-mono-tech">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-emerald-500" />
                  <button
                    onClick={() => setSelectedFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md text-[10px] uppercase transition-all ${
                      selectedFilter === 'ALL'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-900/80 text-emerald-400/80 hover:bg-slate-800'
                    }`}
                  >
                    All ({commandEntries.length})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('SEARCH')}
                    className={`px-2.5 py-1 rounded-md text-[10px] uppercase transition-all ${
                      selectedFilter === 'SEARCH'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-900/80 text-emerald-400/80 hover:bg-slate-800'
                    }`}
                  >
                    Web Grounded
                  </button>
                </div>

                <span className="text-[10px] text-emerald-500/60">
                  {filteredEntries.length} found
                </span>
              </div>
            </div>

            {/* Scrollable Command Log Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-emerald-900/40">
              {filteredEntries.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-emerald-900/50 rounded-2xl bg-slate-900/30">
                  <Terminal className="w-8 h-8 text-emerald-600/60 mb-2" />
                  <p className="text-xs font-mono-tech text-emerald-400/80 uppercase tracking-wider">
                    {commandEntries.length === 0
                      ? 'No commands logged yet'
                      : 'No matches found'}
                  </p>
                  <p className="text-xs text-slate-400 font-sans mt-1 max-w-xs">
                    {commandEntries.length === 0
                      ? 'Say "Mark" or use the central terminal to execute commands in this session.'
                      : 'Try clearing the search query or adjusting your filters.'}
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const isExpanded = expandedLogId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="group rounded-xl border border-emerald-900/60 bg-slate-900/60 hover:bg-slate-900/90 hover:border-emerald-600/60 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-[0_0_18px_rgba(16,185,129,0.12)]"
                    >
                      {/* Interaction Meta Header */}
                      <div className="px-3.5 py-2 bg-slate-950/70 border-b border-emerald-900/40 flex items-center justify-between gap-2 text-[10px] font-mono-tech">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-300 font-bold">
                            CMD #{String(entry.commandNumber).padStart(2, '0')}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {entry.modelUsed && (
                            <span className="text-emerald-400/80 px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-900/50">
                              {entry.modelUsed}
                            </span>
                          )}
                          {entry.executionDurationMs && (
                            <span className="text-slate-500">
                              {(entry.executionDurationMs / 1000).toFixed(2)}s
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-3.5 space-y-3">
                        {/* User Command */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono-tech text-emerald-400/90 mb-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-emerald-400" />
                              COMMAND QUERY
                            </span>
                            <div className="flex items-center gap-2">
                              {onSelectCommand && (
                                <button
                                  onClick={() => onSelectCommand(entry.userMessage.content)}
                                  className="text-[10px] text-emerald-400 hover:text-emerald-200 flex items-center gap-0.5 transition-colors cursor-pointer"
                                  title="Re-run or populate command into terminal"
                                >
                                  <span>Re-run</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleCopy(`user-${entry.id}`, entry.userMessage.content)}
                                className="text-slate-400 hover:text-emerald-300 transition-colors p-0.5 cursor-pointer"
                                title="Copy command"
                              >
                                {copiedId === `user-${entry.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm font-sans font-medium text-slate-100 bg-slate-950/60 p-2.5 rounded-lg border border-emerald-950">
                            {entry.userMessage.content}
                          </p>
                        </div>

                        {/* M.A.R.K AI Response */}
                        {entry.assistantMessage ? (
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono-tech text-emerald-400/90 mb-1">
                              <span className="flex items-center gap-1">
                                <Bot className="w-3 h-3 text-emerald-400" />
                                M.A.R.K RESPONSE
                              </span>
                              <div className="flex items-center gap-2">
                                {onReplayAudio && (
                                  <button
                                    onClick={() => onReplayAudio(entry.assistantMessage!.content)}
                                    className="text-[10px] text-emerald-400 hover:text-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Speak response aloud"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                    <span>Vocalize</span>
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleCopy(`bot-${entry.id}`, entry.assistantMessage!.content)
                                  }
                                  className="text-slate-400 hover:text-emerald-300 transition-colors p-0.5 cursor-pointer"
                                  title="Copy response"
                                >
                                  {copiedId === `bot-${entry.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="text-xs font-sans text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-emerald-950/80 leading-relaxed whitespace-pre-wrap">
                              {isExpanded
                                ? entry.assistantMessage.content
                                : entry.assistantMessage.content.slice(0, 220) +
                                  (entry.assistantMessage.content.length > 220 ? '...' : '')}

                              {entry.assistantMessage.content.length > 220 && (
                                <button
                                  onClick={() =>
                                    setExpandedLogId(isExpanded ? null : entry.id)
                                  }
                                  className="block mt-1.5 text-[10px] font-mono-tech text-emerald-400 hover:underline cursor-pointer"
                                >
                                  {isExpanded ? 'Show less' : 'Read full response →'}
                                </button>
                              )}
                            </div>

                            {/* Search citations / web grounding */}
                            {entry.assistantMessage.searchInfo?.sources &&
                              entry.assistantMessage.searchInfo.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-emerald-900/30">
                                  <div className="text-[10px] font-mono-tech text-emerald-500/80 mb-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                    <span>
                                      LIVE WEB GROUNDING (
                                      {entry.assistantMessage.searchInfo.sources.length} SOURCES)
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {entry.assistantMessage.searchInfo.sources
                                      .slice(0, 3)
                                      .map((src, sIdx) => (
                                        <a
                                          key={sIdx}
                                          href={src.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-[10px] text-emerald-300 hover:text-emerald-100 hover:border-emerald-400 transition-colors"
                                        >
                                          <span className="truncate max-w-[140px]">
                                            {src.title || src.source || 'Source'}
                                          </span>
                                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                        </a>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-[11px] font-mono-tech text-emerald-400/70">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Processing command or awaiting neural response...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-3.5 border-t border-emerald-900/50 bg-slate-900/80 flex items-center justify-between text-[11px] font-mono-tech text-emerald-400/80">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                <span>SESSION AUDIT ACTIVE</span>
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
