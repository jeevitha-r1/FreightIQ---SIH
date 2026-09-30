import React from "react";
import {
  Anchor,
  Compass,
  FileText,
  Sparkles,
  RotateCcw,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { DemoScenario, VoyageAnalysisResult } from "../types";
import { DEMO_SCENARIOS } from "../data/maritimeData";

export interface NavbarProps {
  currentScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  onOpenCopilot: () => void;
  onOpenBrief: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onReset?: () => void;
  onGenerateBrief?: () => void;
  onToggleCopilot?: () => void;
  isCopilotOpen?: boolean;
  onOpenWhy?: (title: string, content: React.ReactNode) => void;
  activeView?: string;
  setActiveView?: (view: any) => void;
  analysis?: VoyageAnalysisResult;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScenario,
  onSelectScenario,
  onOpenCopilot,
  onOpenBrief,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onReset,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-[61px] border-b border-cyan-950/70 bg-[#070b14]/95 backdrop-blur-md px-4 lg:px-6">
      <div className="h-full flex items-center justify-between gap-3 max-w-[1720px] mx-auto">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Sidebar"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/30">
              <Anchor className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white font-mono">
                  Freight<span className="text-cyan-400">IQ</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden md:block">
                Predictive Maritime Chartering & Bulk Logistics Cockpit
              </p>
            </div>
          </div>
        </div>

        {/* Center / Scenario Quick Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0e172a] border border-cyan-900/60 rounded-xl px-3 py-1.5 shadow-inner">
            <Compass className="h-3.5 w-3.5 text-cyan-400 hidden sm:block" />
            <span className="text-[11px] text-slate-400 font-mono hidden lg:inline">Scenario:</span>
            <select
              value={currentScenario.id}
              onChange={(e) => {
                const found = DEMO_SCENARIOS.find((s) => s.id === e.target.value);
                if (found) onSelectScenario(found);
              }}
              className="bg-transparent text-xs font-mono font-semibold text-cyan-200 focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[320px] truncate"
            >
              {DEMO_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0a101d] text-slate-100">
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="hidden xl:flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-[#0d1627] transition-all"
              title="Reset scenario levers"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          {/* Executive Voyage Brief Trigger */}
          <button
            onClick={onOpenBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-md shadow-cyan-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Voyage Brief</span>
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 font-mono font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
