import React from 'react';
import { SearchInfo } from '../types.js';
import { Globe, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';

interface SearchPanelProps {
  searchInfo: SearchInfo | null;
  isSearching: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ searchInfo, isSearching }) => {
  if (!isSearching && (!searchInfo || searchInfo.sources.length === 0)) {
    return null;
  }

  return (
    <div
      id="mark-search-panel"
      className="w-full max-w-xl mx-auto my-3 rounded-xl border border-emerald-800/60 bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-orbitron text-xs font-bold text-emerald-300 tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            REAL-TIME WEB RECONNAISSANCE // SEARCHAPI
          </span>
        </div>
        <span className="text-[10px] font-mono-tech text-emerald-500">
          GOOGLE INDEX VIA SEARCHAPI.IO
        </span>
      </div>

      {/* Searching steps animation */}
      {isSearching && (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-emerald-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>QUERYING GLOBAL LIVE FEED: "{searchInfo?.query || 'Connecting...'}"</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-950/80 text-[11px] font-mono-tech">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>1. SearchAPI Connect</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>2. Analyzing Results</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>3. AI Synthesize</span>
            </div>
          </div>
        </div>
      )}

      {/* Sources retrieved */}
      {searchInfo && searchInfo.sources && searchInfo.sources.length > 0 && (
        <div className="space-y-2 mt-1">
          <div className="flex items-center justify-between text-[11px] font-mono-tech text-emerald-400/90 mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              RETRIEVED {searchInfo.sources.length} VERIFIED SOURCES
            </span>
            <span className="text-emerald-500/70">QUERY: "{searchInfo.query}"</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {searchInfo.sources.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-900/40 hover:border-emerald-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-200 group-hover:text-emerald-100 truncate max-w-[85%]">
                    {item.title}
                  </span>
                  <ExternalLink className="w-3 h-3 text-emerald-500 group-hover:text-emerald-300 shrink-0 ml-1" />
                </div>
                <p className="text-[11px] text-slate-300/80 line-clamp-1 mt-0.5 font-sans">
                  {item.snippet}
                </p>
                {item.source && (
                  <span className="inline-block mt-1 text-[9px] font-mono-tech text-emerald-400/70 uppercase">
                    Source: {item.source}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
