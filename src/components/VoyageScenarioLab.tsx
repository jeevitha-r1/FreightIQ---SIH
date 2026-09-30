import React, { useState } from "react";
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Ship,
  ShieldAlert,
  Clock,
  Building2,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  AnalysisHorizon,
  CargoType,
  ContractType,
  DestinationPort,
  OriginCountry,
  VoyageAnalysisResult,
  VoyageConfig,
} from "../types";
import { CARGO_OPTIONS, DESTINATION_OPTIONS, ORIGIN_OPTIONS, PORT_DATABASE } from "../data/maritimeData";

interface VoyageScenarioLabProps {
  currentConfig: VoyageConfig;
  analysis: VoyageAnalysisResult;
  onApplyScenario: (newConfig: VoyageConfig) => void;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
}

export const VoyageScenarioLab: React.FC<VoyageScenarioLabProps> = ({
  currentConfig,
  analysis,
  onApplyScenario,
  onOpenWhy,
}) => {
  const [labConfig, setLabConfig] = useState<VoyageConfig>({ ...currentConfig });
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      onApplyScenario(labConfig);
      setIsRunning(false);
    }, 400);
  };

  const handleReset = () => {
    setLabConfig({ ...currentConfig });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Digital Twin Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#071329] via-[#09152e] to-[#0a1224] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-cyan-400 animate-pulse" />
              <h2 className="text-xl font-extrabold text-white font-mono tracking-wide">
                Voyage Scenario Lab (Maritime Digital Twin)
              </h2>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
                SIMULATION SANDBOX
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Stress-test chartering decisions in a dynamic simulation sandbox. Adjust market shocks, port congestion bottlenecks, and parcel sizes to observe real-time impacts on freight rates, vessel suitability, and idle demurrage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Levers</span>
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className={`h-4 w-4 fill-current ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "COMPUTING TWIN..." : "RUN SCENARIO"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Levers Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Levers */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#081020]/90 p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Scenario Variables</span>
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">Live Inputs</span>
          </div>

          {/* Row 1: Cargo and Qty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Cargo Commodity</label>
              <select
                value={labConfig.cargoType}
                onChange={(e) => setLabConfig({ ...labConfig, cargoType: e.target.value as CargoType })}
                className="w-full rounded-lg bg-[#0d172a] border border-slate-700 px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {CARGO_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Cargo Quantity:</span>
                <span className="text-cyan-300 font-bold">{(labConfig.cargoQty / 1000).toFixed(0)}k MT</span>
              </div>
              <input
                type="range"
                min={25000}
                max={180000}
                step={5000}
                value={labConfig.cargoQty}
                onChange={(e) => setLabConfig({ ...labConfig, cargoQty: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Handysize (30k)</span>
                <span>Panamax (70k)</span>
                <span>Capesize (150k)</span>
              </div>
            </div>
          </div>

          {/* Row 2: Route Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Origin Loading Zone</label>
              <select
                value={labConfig.origin}
                onChange={(e) => setLabConfig({ ...labConfig, origin: e.target.value as OriginCountry })}
                className="w-full rounded-lg bg-[#0d172a] border border-slate-700 px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {ORIGIN_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Destination (East Coast)</label>
              <select
                value={labConfig.destinationPort}
                onChange={(e) => setLabConfig({ ...labConfig, destinationPort: e.target.value as DestinationPort })}
                className="w-full rounded-lg bg-[#0d172a] border border-slate-700 px-3 py-2 text-xs font-medium text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                {DESTINATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d} (Draft {PORT_DATABASE[d].maxDraft}m)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Freight Change % Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#0a1428] border border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Market Rate Shock / Shift:</span>
              <span
                className={`font-bold ${
                  labConfig.freightShiftPercent > 0
                    ? "text-amber-400"
                    : labConfig.freightShiftPercent < 0
                    ? "text-emerald-400"
                    : "text-slate-300"
                }`}
              >
                {labConfig.freightShiftPercent > 0 ? `+${labConfig.freightShiftPercent}%` : `${labConfig.freightShiftPercent}%`}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={labConfig.freightShiftPercent}
              onChange={(e) => setLabConfig({ ...labConfig, freightShiftPercent: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>-20% (Market Slump)</span>
              <span>Baseline Index</span>
              <span>+20% (Pacific Freight Surge)</span>
            </div>
          </div>

          {/* Row 4: Congestion & Demand Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Port Congestion</label>
              <div className="grid grid-cols-3 gap-1">
                {(["Low", "Medium", "High"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setLabConfig({ ...labConfig, congestionLevel: c })}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                      labConfig.congestionLevel === c
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                        : "bg-[#0d172a] text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Commodity Demand</label>
              <div className="grid grid-cols-3 gap-1">
                {(["Low", "Medium", "High"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLabConfig({ ...labConfig, demandLevel: d })}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                      labConfig.demandLevel === d
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                        : "bg-[#0d172a] text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Contract Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Contract Preference Strategy</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Spot", "Short-Term", "Medium-Term", "Multiple Voyage"] as ContractType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLabConfig({ ...labConfig, contractPreference: t })}
                  className={`py-2 px-2 text-[11px] font-mono rounded-lg border transition-all truncate ${
                    labConfig.contractPreference === t
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold"
                      : "bg-[#0d172a] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Live Twin Output Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#081020]/90 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Simulated Outcomes Preview</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">Live Engine</span>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#09152b] border border-cyan-900/40">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Voyage Intelligence Index
                </span>
                <div className="text-2xl font-bold font-mono text-white">
                  {analysis.intelligenceScore} / 100
                </div>
                <span className="text-xs text-cyan-300">{analysis.scoreLabel}</span>
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                <div>Route: {labConfig.origin} → {labConfig.destinationPort}</div>
                <div className="text-slate-300">{(labConfig.cargoQty / 1000).toFixed(0)}k MT {labConfig.cargoType}</div>
              </div>
            </div>

            {/* Vessel Recommendation Result */}
            <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Vessel Class Match:</span>
                <span className="text-cyan-300 font-bold">
                  {analysis.recommendedVessel} ({analysis.recommendedVesselMatchScore}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Port Feasibility:</span>
                <span
                  className={`font-semibold ${
                    analysis.portCompatibilityStatus === "Fully Compatible"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {analysis.portCompatibilityStatus}
                </span>
              </div>
            </div>

            {/* Rates comparison */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#091224] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CURRENT SPOT</span>
                <span className="text-base font-bold text-white">${analysis.currentRate.toFixed(2)}/MT</span>
              </div>
              <div className="p-3 rounded-lg bg-[#091224] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">30D PROJECTION</span>
                <span className="text-base font-bold text-cyan-300">${analysis.forecastRate30d.toFixed(2)}/MT</span>
              </div>
            </div>

            {/* Risk & Idle */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#091224] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">OVERALL RISK</span>
                <span
                  className={`text-sm font-bold ${
                    analysis.overallRiskLevel === "Low"
                      ? "text-emerald-400"
                      : analysis.overallRiskLevel === "Moderate"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {analysis.overallRiskLevel} Risk
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#091224] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">IDLE DEMURRAGE</span>
                <span className="text-sm font-bold text-amber-400">
                  {analysis.estimatedIdleDays}d (~${(analysis.estimatedIdleCostUSD / 1000).toFixed(0)}k)
                </span>
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={handleRun}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-md shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>APPLY SCENARIO TO MAIN COCKPIT</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
