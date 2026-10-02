import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Code,
  Sparkles,
  Brain,
  Search,
  Mic,
  Volume2,
  Layers,
  Globe,
  Cpu,
  ShieldCheck,
  Terminal,
  X,
  Award,
  Zap,
  CheckCircle2,
  Workflow
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'founder' | 'workflow' | 'tech'>('founder');

  if (!isOpen) return null;

  return (
    <div
      id="about-us-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="about-us-modal-content"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-emerald-500/50 bg-[#030712]/98 shadow-[0_0_50px_rgba(16,185,129,0.35)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 px-5 py-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-orbitron text-sm sm:text-base font-bold text-emerald-200 tracking-wider">
                  M.A.R.K // ABOUT & ARCHITECTURE
                </h2>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  DEVX CORE
                </span>
              </div>
              <p className="text-[11px] font-mono-tech text-emerald-400/70">
                Autonomous Neural Voice Assistant by DevX Technical Club
              </p>
            </div>
          </div>
          <button
            id="close-about-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 border border-transparent hover:border-emerald-800/60 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-emerald-900/40 bg-slate-950/50 px-5 pt-2 gap-2 text-xs font-mono-tech">
          <button
            id="tab-founder-btn"
            onClick={() => setActiveTab('founder')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'founder'
                ? 'border-emerald-400 text-emerald-300 font-semibold bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>FOUNDER & DEVX</span>
          </button>
          <button
            id="tab-workflow-btn"
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'workflow'
                ? 'border-emerald-400 text-emerald-300 font-semibold bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>HOW THE AI WORKS</span>
          </button>
          <button
            id="tab-tech-btn"
            onClick={() => setActiveTab('tech')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tech'
                ? 'border-emerald-400 text-emerald-300 font-semibold bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PLATFORMS & TECH</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-sm custom-scrollbar">
          {/* TAB 1: FOUNDER & DEVX */}
          {activeTab === 'founder' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Profile Card */}
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-950 p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 shrink-0">
                    <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-orbitron font-black text-2xl text-emerald-300">
                      MA
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-orbitron text-lg font-bold text-emerald-100 tracking-wide">
                        MOHAMMED ALI
                      </h3>
                      <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                        CREATOR & ARCHITECT
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-mono-tech">
                      DevX Founder and CEO // 3rd Year CSE Student
                    </p>
                    <p className="text-xs text-slate-300">
                      Developer & Tech Lead at <span className="text-emerald-300 font-medium">Impact College of Engineering and Applied Sciences (ICEAS)</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-900/50 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>
                    <strong className="text-emerald-200">M.A.R.K</strong> (Multi-Agent Responsive Kinetic intelligence) is designed and engineered by <strong className="text-emerald-300">MOHAMMED ALI</strong>, currently pursuing his 3rd year of Computer Science and Engineering (CSE) at ICEAS.
                  </p>
                  <p>
                    As the Founder of the <strong className="text-emerald-300">DevX Technical Club</strong>, Mohammed spearheads student-led initiatives in artificial intelligence, full-stack systems engineering, neural voice interfaces, and next-generation autonomous software.
                  </p>
                </div>
              </div>

              {/* DevX Technical Club Card */}
              <div className="rounded-xl border border-emerald-900/50 bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-emerald-300">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold uppercase tracking-wider">About DevX Technical Club (ICEAS)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  DevX is an elite student developer collective founded at Impact College of Engineering and Applied Sciences (ICEAS). Dedicated to fostering hands-on engineering, open-source innovation, and real-world AI deployment, DevX transforms theoretical computing concepts into production-grade systems.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono-tech pt-2">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>AI & Neural Agents</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full-Stack Engineering</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Open Research & Hackathons</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW THE AI WORKS */}
          {activeTab === 'workflow' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-xs font-mono-tech text-emerald-400 pb-1">
                EXECUTION PIPELINE: REAL-TIME MULTI-STAGE COGNITIVE CYCLE
              </div>

              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-xs font-mono-tech text-emerald-300 font-bold shrink-0">
                  01
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="text-xs font-orbitron font-bold text-emerald-200">
                      Acoustic Stream & Wake-Word Sensing
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The user's voice is captured in real time via the HTML5 Web Speech API paired with an active Web Audio API hardware analyser. Saying <code className="text-emerald-300 bg-emerald-950 px-1 py-0.5 rounded">"Mark"</code> or tapping the Reactor activates the conversational cycle.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-xs font-mono-tech text-emerald-300 font-bold shrink-0">
                  02
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-teal-400" />
                    <h4 className="text-xs font-orbitron font-bold text-teal-200">
                      Query Intent & Web Search Grounding
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If the prompt asks for live updates (e.g. news, SpaceX, stock prices, weather, sports), M.A.R.K dynamically invokes Google SearchAPI, scraping and grounding current web knowledge in milliseconds before responding.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-xs font-mono-tech text-emerald-300 font-bold shrink-0">
                  03
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <h4 className="text-xs font-orbitron font-bold text-cyan-200">
                      Dual-Engine Neural Reasoning
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    M.A.R.K synthesizes context through OpenAI GPT-4o-mini with seamless Google Gemini 3.1 Flash fallback routing. It adopts an articulate, refined, British cadence, attributing its origin proudly to Mohammed Ali.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-xs font-mono-tech text-emerald-300 font-bold shrink-0">
                  04
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="text-xs font-orbitron font-bold text-emerald-200">
                      Neural Voice Synthesis & Oscilloscope
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The generated intelligence is streamed into ElevenLabs neural voice synthesis (<code className="text-emerald-300 bg-emerald-950 px-1 py-0.5 rounded">Voice: 3AMU7jXQuQa3oRvRqUmb</code>) while triggering dynamic 24-band visualizer frequencies on the HUD canvas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLATFORMS & TECHNOLOGIES */}
          {activeTab === 'tech' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-xs font-mono-tech text-emerald-400 pb-1">
                PRODUCTION TECHNOLOGY STACK
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Tech 1: OpenAI & Gemini */}
                <div className="p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-mono-tech text-xs font-bold">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span>OpenAI & Google Gemini</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Dual LLM architecture with intelligent quota shielding, latency fallback, and conversational memory handling.
                  </p>
                </div>

                {/* Tech 2: SearchAPI */}
                <div className="p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-300 font-mono-tech text-xs font-bold">
                    <Globe className="w-4 h-4 text-teal-400" />
                    <span>Google SearchAPI</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Real-time web search grounding providing instant organic snippets, knowledge graphs, and current news.
                  </p>
                </div>

                {/* Tech 3: ElevenLabs */}
                <div className="p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-mono-tech text-xs font-bold">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>ElevenLabs Neural TTS</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ultra-low-latency voice synthesis with custom British cadence, paired with Web Speech API offline failover.
                  </p>
                </div>

                {/* Tech 4: Web Audio API */}
                <div className="p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-mono-tech text-xs font-bold">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Web Audio Analyser</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    FFT-based hardware microphone stream analysis driving reactive cyber visualizers and audio chimes.
                  </p>
                </div>

                {/* Tech 5: React & Vite */}
                <div className="p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-mono-tech text-xs font-bold">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>React 18 + Vite + TS</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Modern component hierarchy, strict TypeScript type-safety, and hardware-accelerated CSS animations.
                  </p>
                </div>

                {/* Tech 6: Node.js / Express Security */}
                <div className="p-3 rounded-xl border border-emerald-900/50 bg-slate-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-300 font-mono-tech text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Node.js / Express Proxy</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Zero client-side credential exposure; server-side proxies safely isolate all API keys and quota monitors.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-emerald-900/60 bg-slate-950/80 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tech text-emerald-400/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>M.A.R.K // DEVX TECHNICAL CLUB // ICEAS</span>
          </div>
          <button
            id="modal-close-bottom-btn"
            onClick={onClose}
            className="px-4 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-600/60 text-emerald-200 transition-all cursor-pointer"
          >
            DISMISS HUD
          </button>
        </div>
      </div>
    </div>
  );
};
