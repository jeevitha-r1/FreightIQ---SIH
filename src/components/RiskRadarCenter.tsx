import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Clock,
  Waves,
  Zap,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { RiskIndicator, VoyageAnalysisResult, VoyageConfig } from "../types";

interface RiskRadarCenterProps {
  riskIndicators: RiskIndicator[];
  activeAlerts: string[];
  overallRiskLevel: "Low" | "Moderate" | "High";
  config: VoyageConfig;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
}

export const RiskRadarCenter: React.FC<RiskRadarCenterProps> = ({
  riskIndicators,
  activeAlerts,
  overallRiskLevel,
  config,
  onOpenWhy,
}) => {
  const handleWhyRisk = () => {
    onOpenWhy(
      "Comprehensive Risk Matrix Breakdown",
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          FreightIQ’s Risk Radar evaluates operational, market, and physical berthing exposures for this charter voyage:
        </p>
        <div className="space-y-2.5">
          {riskIndicators.map((r, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#0d172a] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">{r.name}</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    r.level === "Low"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-600/40"
                      : r.level === "Moderate"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-600/40"
                      : "bg-rose-950 text-rose-300 border border-rose-600/40"
                  }`}
                >
                  {r.level.toUpperCase()} ({r.score}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-slate-300 font-semibold">Primary Driver:</span> {r.driver}
              </p>
              <p className="text-xs text-cyan-300 pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Recommended Mitigation:</span> {r.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#081020]/90 backdrop-blur-md p-5 lg:p-6 shadow-xl shadow-black/40 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              Risk Intelligence & Operational Exposure Radar
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              DECISION DEFENSE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stress analysis across freight volatility, congestion queues, and vessel mismatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
              overallRiskLevel === "Low"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                : overallRiskLevel === "Moderate"
                ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                : "bg-rose-950/80 text-rose-300 border-rose-500/40"
            }`}
          >
            Composite Risk: {overallRiskLevel.toUpperCase()}
          </div>

          <button
            onClick={handleWhyRisk}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>WHY?</span>
          </button>
        </div>
      </div>

      {/* Live Active Alert Feed Tickers */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
            <span>Active Operational Alerts ({activeAlerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeAlerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#1a1408] border border-amber-600/40 text-xs text-amber-200"
              >
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
                <span className="font-medium">{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Metric Risk Radar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {riskIndicators.map((risk) => {
          const isLow = risk.level === "Low";
          const isMod = risk.level === "Moderate";
          const isHigh = risk.level === "High";

          return (
            <div
              key={risk.name}
              className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                isHigh
                  ? "bg-[#210c13]/80 border-rose-900/60"
                  : isMod
                  ? "bg-[#1f1708]/80 border-amber-900/60"
                  : "bg-[#09152b]/80 border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {risk.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isLow
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-600/40"
                        : isMod
                        ? "bg-amber-950 text-amber-300 border border-amber-600/40"
                        : "bg-rose-950 text-rose-300 border border-rose-600/40"
                    }`}
                  >
                    {risk.level}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full ${
                      isLow ? "bg-emerald-400" : isMod ? "bg-amber-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${risk.score}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono text-slate-400 mb-2">
                  Index Score: <strong className="text-slate-200">{risk.score}/100</strong>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {risk.driver}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-cyan-300 font-mono">
                Mitigation: {risk.mitigation.slice(0, 42)}...
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
