import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Ship,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  DollarSign,
  Compass,
  Zap,
} from "lucide-react";
import { VoyageAnalysisResult, VoyageConfig } from "../types";

interface VoyageScoreCardProps {
  analysis: VoyageAnalysisResult;
  config: VoyageConfig;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
  onOpenCopilot?: () => void;
}

export const VoyageScoreCard: React.FC<VoyageScoreCardProps> = ({
  analysis,
  config,
  onOpenWhy,
  onOpenCopilot,
}) => {
  const isUp = analysis.rateChangePercent > 0;

  // Ring stroke calculation for score (0-100)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.intelligenceScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 stroke-emerald-400";
    if (score >= 65) return "text-cyan-400 stroke-cyan-400";
    if (score >= 50) return "text-amber-400 stroke-amber-400";
    return "text-rose-400 stroke-rose-400";
  };

  const handleWhyScore = () => {
    onOpenWhy(
      `Voyage Intelligence Score: ${analysis.intelligenceScore}/100`,
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          The <span className="text-cyan-300 font-semibold">Voyage Intelligence Score</span> is a composite decision-support index synthesized from multi-factor chartering feasibility:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d172a] border border-slate-800">
            <span className="text-slate-200">Vessel Deadweight Fit ({analysis.recommendedVessel})</span>
            <span className="text-emerald-400 font-mono font-semibold">+{analysis.recommendedVesselMatchScore}% match</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d172a] border border-slate-800">
            <span className="text-slate-200">Port Physical Compatibility ({config.destinationPort})</span>
            <span className={`font-mono font-semibold ${analysis.portCompatibilityStatus === "Fully Compatible" ? "text-emerald-400" : "text-amber-400"}`}>
              {analysis.portCompatibilityStatus}
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d172a] border border-slate-800">
            <span className="text-slate-200">Port Waiting & Congestion Factor</span>
            <span className="text-cyan-300 font-mono font-semibold">
              {analysis.estimatedIdleDays} days ({config.congestionLevel})
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d172a] border border-slate-800">
            <span className="text-slate-200">Baltic Forward Curve Direction</span>
            <span className={`font-mono font-semibold ${isUp ? "text-amber-300" : "text-emerald-400"}`}>
              {analysis.marketTrend} ({isUp ? "+" : ""}{analysis.rateChangePercent}%)
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="font-semibold text-slate-300">Charterer Recommendation:</span> Locking in {config.contractPreference} fixtures early mitigates projected upward freight momentum.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Current Freight Rate */}
        <div className="rounded-xl border border-slate-800/90 bg-[#091020]/90 p-3.5 backdrop-blur-sm shadow-sm relative group hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Current Freight Rate
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              ${analysis.currentRate.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/ MT</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Spot Index</span>
            <span className="text-cyan-400">BPI Linked</span>
          </div>
        </div>

        {/* 2. Forecast Freight Rate */}
        <div className="rounded-xl border border-slate-800/90 bg-[#091020]/90 p-3.5 backdrop-blur-sm shadow-sm relative group hover:border-cyan-900/50 transition-colors">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            {config.analysisHorizon}d Forecast Rate
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              ${analysis.forecastRate30d.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/ MT</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold mt-1">
            {isUp ? (
              <span className="text-amber-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" />+{analysis.rateChangePercent}%
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center">
                <TrendingDown className="h-3 w-3 mr-0.5" />
                {analysis.rateChangePercent}%
              </span>
            )}
            <span className="text-slate-500">vs spot</span>
          </div>
        </div>

        {/* 3. Market Trend */}
        <div className="rounded-xl border border-slate-800/90 bg-[#091020]/90 p-3.5 backdrop-blur-sm shadow-sm relative group hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Market Trend
          </div>
          <div className="text-base font-bold text-white truncate">
            {analysis.marketTrend.split(" ")[0]}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${
                isUp ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span className="text-slate-300 font-mono text-[10px]">
              {analysis.marketTrend.includes("Bullish") ? "Tightening Tonnage" : "Soft Supply"}
            </span>
          </div>
        </div>

        {/* 4. Recommended Vessel */}
        <div className="rounded-xl border border-cyan-900/50 bg-[#0a1428]/90 p-3.5 backdrop-blur-sm shadow-sm relative group hover:border-cyan-500/40 transition-colors">
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Recommended Vessel</span>
            <Ship className="h-3 w-3 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {analysis.recommendedVessel}
          </div>
          <div className="text-[11px] text-cyan-300 font-mono mt-1 font-semibold">
            {analysis.recommendedVesselMatchScore}% Match Fit
          </div>
        </div>

        {/* 5. Port Compatibility */}
        <div className="rounded-xl border border-slate-800/90 bg-[#091020]/90 p-3.5 backdrop-blur-sm shadow-sm relative group hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Port Compatibility
          </div>
          <div className="text-sm font-bold text-white truncate">
            {analysis.portCompatibilityStatus}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${
                analysis.portCompatibilityStatus === "Fully Compatible"
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            <span>{config.destinationPort} Berth</span>
          </div>
        </div>

        {/* 6. Overall Risk */}
        <div className="rounded-xl border border-slate-800/90 bg-[#091020]/90 p-3.5 backdrop-blur-sm shadow-sm relative group hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Overall Risk
          </div>
          <div
            className={`text-base font-bold font-mono ${
              analysis.overallRiskLevel === "Low"
                ? "text-emerald-400"
                : analysis.overallRiskLevel === "Moderate"
                ? "text-amber-400"
                : "text-rose-400"
            }`}
          >
            {analysis.overallRiskLevel} Risk
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Idle: {analysis.estimatedIdleDays}d (~${(analysis.estimatedIdleCostUSD / 1000).toFixed(0)}k)
          </div>
        </div>
      </div>

      {/* Large Central Voyage Intelligence Score Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-[#0a1329] via-[#081020] to-[#040812] p-6 lg:p-7 shadow-2xl shadow-cyan-950/40">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Circular Score Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`${getScoreColor(analysis.intelligenceScore)} transition-all duration-1000 ease-out`}
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {analysis.intelligenceScore}
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  / 100
                </span>
              </div>
            </div>

            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-semibold text-cyan-300">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                {analysis.scoreLabel}
              </span>
            </div>
          </div>

          {/* AI Justification & Narrative */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-lg font-bold text-white font-mono tracking-wide">
                  Voyage Intelligence Synthesis
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWhyScore}
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>WHY?</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">
              {analysis.scoreExplanation}
            </p>

            {/* Micro Highlights Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg bg-[#0b152b]/80 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Optimal Action</span>
                <span className="font-semibold text-cyan-300">
                  {config.contractPreference} Charter
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0b152b]/80 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Vessel Recommendation</span>
                <span className="font-semibold text-emerald-300">
                  {analysis.recommendedVessel} ({analysis.recommendedVesselMatchScore}%)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0b152b]/80 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Port Feasibility</span>
                <span className="font-semibold text-slate-200">
                  {config.destinationPort} ({analysis.portCompatibilityStatus})
                </span>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="text-[11px] text-slate-500 italic pt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>
                Composite decision-support score based on multi-criteria maritime modeling and forward freight curves.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
