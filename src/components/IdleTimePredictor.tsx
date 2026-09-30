import React from "react";
import {
  Clock,
  Zap,
  Ship,
  Sparkles,
  HelpCircle,
  TrendingDown,
  Anchor,
  Timer,
  DollarSign,
  Fuel,
} from "lucide-react";
import { VoyageTimelinePhase } from "../types";

interface IdleTimePredictorProps {
  timelinePhases: VoyageTimelinePhase[];
  estimatedIdleDays: number;
  estimatedIdleCostUSD: number;
  utilizationPercent: number;
  idleReductionAdvice: string;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
}

export const IdleTimePredictor: React.FC<IdleTimePredictorProps> = ({
  timelinePhases,
  estimatedIdleDays,
  estimatedIdleCostUSD,
  utilizationPercent,
  idleReductionAdvice,
  onOpenWhy,
}) => {
  const totalDays = timelinePhases.reduce((acc, p) => acc + p.durationDays, 0);

  const handleWhyIdle = () => {
    onOpenWhy(
      "Vessel Utilization & Idle Demurrage Economics",
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          Voyage turnaround efficiency directly affects landed steel raw material cost per metric tonne:
        </p>
        <div className="space-y-2">
          {timelinePhases.map((phase) => (
            <div key={phase.name} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d172a] border border-slate-800">
              <div>
                <span className="font-semibold text-white">{phase.name} Phase</span>
                <span className="text-xs text-slate-400 block">{phase.details}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-cyan-300 font-bold">{phase.durationDays} Days</span>
                <span className="text-[10px] text-slate-500 block">({phase.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200">
          <strong className="block font-mono mb-1">Demurrage Risk Calculation:</strong>
          {estimatedIdleDays} days estimated waiting @ standard charter demurrage of ~$21,500/day results in ~${estimatedIdleCostUSD.toLocaleString()} of avoidable voyage dead-loss.
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
            <Timer className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              Vessel Utilization Intelligence & Demurrage Predictor
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              TURNAROUND CYCLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Phase-by-phase voyage duration decomposition and idle anchorage mitigation strategies.
          </p>
        </div>

        {/* Top telemetry */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0e1b33] border border-cyan-800/50 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] font-mono text-slate-400 block">Total Voyage Time</span>
            <span className="text-sm font-bold font-mono text-white">
              {totalDays.toFixed(1)} Days
            </span>
          </div>

          <button
            onClick={handleWhyIdle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>WHY?</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estimated Idle Time */}
        <div className="rounded-xl border border-slate-800 bg-[#091224] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Estimated Idle Time
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold font-mono text-amber-400">
                {estimatedIdleDays} Days
              </span>
              <span className="text-xs text-slate-400">Anchorage Wait</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Demurrage exposure: ~${estimatedIdleCostUSD.toLocaleString()}
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Estimated Utilization */}
        <div className="rounded-xl border border-slate-800 bg-[#091224] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Estimated Utilization
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {utilizationPercent}%
              </span>
              <span className="text-xs text-slate-400">Active Steaming/Ops</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Benchmark target: &gt;82%
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Main Idle Risk */}
        <div className="rounded-xl border border-slate-800 bg-[#091224] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Main Idle Driver
            </span>
            <div className="text-sm font-bold text-white mt-1">
              Destination Anchorage Congestion
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">
              Berth clearance & tidal draft alignment
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Anchor className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Visual Voyage Timeline: Loading -> Sea Transit -> Port Waiting -> Discharge */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-semibold text-slate-300">VOYAGE TIMELINE DECOMPOSITION</span>
          <span>{totalDays.toFixed(1)} Days End-to-End Cycle</span>
        </div>

        {/* Multi-segment visual bar */}
        <div className="w-full h-8 bg-slate-900 rounded-xl overflow-hidden flex border border-slate-800 p-0.5">
          {timelinePhases.map((phase) => {
            const isWaiting = phase.name === "Port Waiting";
            const isTransit = phase.name === "Sea Transit";
            const isLoading = phase.name === "Loading";

            const bgColor = isWaiting
              ? "bg-amber-500/80 hover:bg-amber-400 text-slate-950"
              : isTransit
              ? "bg-cyan-500/80 hover:bg-cyan-400 text-slate-950"
              : isLoading
              ? "bg-blue-600/80 hover:bg-blue-500 text-white"
              : "bg-emerald-600/80 hover:bg-emerald-500 text-white";

            return (
              <div
                key={phase.name}
                style={{ width: `${Math.max(8, phase.percentage)}%` }}
                className={`h-full ${bgColor} transition-all relative flex items-center justify-center px-1 text-[10px] font-mono font-bold truncate cursor-pointer`}
                title={`${phase.name}: ${phase.durationDays} days (${phase.percentage}%) - ${phase.details}`}
              >
                <span className="truncate">{phase.name} ({phase.durationDays}d)</span>
              </div>
            );
          })}
        </div>

        {/* Timeline phase cards breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {timelinePhases.map((phase) => (
            <div
              key={phase.name}
              className="p-3 rounded-xl bg-[#091326] border border-slate-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{phase.name}</span>
                <span className="text-cyan-300 font-mono font-bold">{phase.durationDays} Days</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{phase.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestion for Reducing Idle Time */}
      <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-[#0a162d] to-[#0a1428] p-4 lg:p-5 flex items-start gap-3.5 shadow-md">
        <div className="h-9 w-9 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-400/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide">
              FreightIQ Prescriptive AI Action: Idle Mitigation
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {idleReductionAdvice}
          </p>
        </div>
      </div>
    </div>
  );
};
