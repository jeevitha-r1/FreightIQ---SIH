import React from "react";
import {
  Compass,
  LayoutDashboard,
  Sliders,
  TrendingUp,
  Ship,
  Anchor,
  ShieldAlert,
  Cpu,
  Building2,
  Sparkles,
  FileText,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { DemoScenario, VoyageAnalysisResult } from "../types";

export type NavSection =
  | "overview"
  | "analysis"
  | "forecast"
  | "vessel"
  | "port"
  | "risk"
  | "lab"
  | "contracts"
  | "copilot";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  currentScenario: DemoScenario;
  analysis: VoyageAnalysisResult;
  onGenerateBrief: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  currentScenario,
  analysis,
  onGenerateBrief,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems = [
    { id: "overview" as NavSection, label: "Overview", icon: LayoutDashboard, badge: `${analysis.intelligenceScore}/100` },
    { id: "analysis" as NavSection, label: "Voyage Analysis", icon: Sliders },
    { id: "forecast" as NavSection, label: "Freight Forecast", icon: TrendingUp, badge: `${analysis.rateChangePercent > 0 ? "+" : ""}${analysis.rateChangePercent}%` },
    { id: "vessel" as NavSection, label: "Vessel Intelligence", icon: Ship, badge: analysis.recommendedVessel },
    { id: "port" as NavSection, label: "Port Intelligence", icon: Anchor },
    { id: "risk" as NavSection, label: "Risk Center", icon: ShieldAlert, badge: analysis.overallRiskLevel },
    { id: "lab" as NavSection, label: "Scenario Lab", icon: Cpu, highlight: true },
    { id: "contracts" as NavSection, label: "Contract Simulator", icon: Building2 },
    { id: "copilot" as NavSection, label: "FreightIQ Copilot", icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-[61px] left-0 bottom-0 z-30 w-64 border-r border-slate-800/80 bg-[#070d1a] flex flex-col justify-between transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Navigation Section */}
        <div className="p-3 space-y-4 overflow-y-auto">
          {/* Active Scenario Card */}
          <div className="p-3 rounded-xl bg-[#0a1428] border border-cyan-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                ACTIVE SCENARIO
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs font-semibold text-white truncate">
              {currentScenario.title.split(":")[1] || currentScenario.title}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentScenario.subtitle}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-3 py-1 font-semibold">
              Cockpit Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-[#0c162b]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-700/50"
                          : "bg-[#0f1d38] text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Status Indicators */}
        <div className="p-3 border-t border-slate-800/80 bg-[#060b16] space-y-2">
          {/* Status 1: Engine Status */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Engine Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          {/* Status 2: Baltic Data status */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Baltic Dry Feed:</span>
            <span className="text-cyan-300">Synchronized</span>
          </div>

          {/* Status 3: Corridor */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Corridor:</span>
            <span className="text-slate-300">East Coast India</span>
          </div>

          {/* Quick Brief CTA */}
          <button
            onClick={onGenerateBrief}
            className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-md shadow-cyan-950/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Generate Voyage Brief</span>
          </button>
        </div>
      </aside>
    </>
  );
};
