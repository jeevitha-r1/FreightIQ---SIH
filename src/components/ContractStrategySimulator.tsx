import React, { useState, useEffect } from "react";
import {
  Building2,
  Sliders,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
  DollarSign,
  ArrowRight,
  Sparkles,
  Zap,
  Play,
} from "lucide-react";
import { ContractStrategyOption, VoyageAnalysisResult, VoyageConfig } from "../types";

interface ContractStrategySimulatorProps {
  contractOptions: ContractStrategyOption[];
  config: VoyageConfig;
  onUpdateConfig: (updated: Partial<VoyageConfig>) => void;
  onRunSimulation: () => void;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
}

export const ContractStrategySimulator: React.FC<ContractStrategySimulatorProps> = ({
  contractOptions,
  config,
  onUpdateConfig,
  onRunSimulation,
  onOpenWhy,
}) => {
  const [freightSlider, setFreightSlider] = useState<number>(config.freightShiftPercent);
  const [congestion, setCongestion] = useState<"Low" | "Medium" | "High">(config.congestionLevel);
  const [demand, setDemand] = useState<"Low" | "Medium" | "High">(config.demandLevel);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    setFreightSlider(config.freightShiftPercent);
    setCongestion(config.congestionLevel);
    setDemand(config.demandLevel);
  }, [config.freightShiftPercent, config.congestionLevel, config.demandLevel]);

  const handleApplySimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    onUpdateConfig({
      freightShiftPercent: freightSlider,
      congestionLevel: congestion,
      demandLevel: demand,
    });
    setTimeout(() => {
      setIsSimulating(false);
      onRunSimulation();
    }, 380);
  };

  const handleWhyContracts = () => {
    onOpenWhy(
      "Contract Strategy Matrix: Spot vs Multi-Voyage (CoA)",
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          For bulk procurement to the East Coast of India (SAIL / RINL / private steel makers), charter contract structure dictates landed raw material cost certainty:
        </p>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-[#0d172a] border border-slate-800 space-y-1">
            <span className="font-bold text-white">Spot Voyage Charter</span>
            <p className="text-xs text-slate-400">
              High volatility exposure. Suitable only when local plant silos are saturated or forward freight curves are steeply backwardated (falling).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#0d172a] border border-slate-800 space-y-1">
            <span className="font-bold text-white">Short-Term (60–90 Days)</span>
            <p className="text-xs text-slate-400">
              Locks in 2–3 consecutive liftings. Provides protection against sudden Pacific cyclonic rate spikes while preserving volume flexibility.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#0d172a] border border-cyan-800/60 space-y-1">
            <span className="font-bold text-cyan-300">Medium-Term Contract of Affreightment (CoA)</span>
            <p className="text-xs text-slate-400">
              Guaranteed vessel commitment across 4–6 voyages with predetermined bunker escalation formulas. Mitigates market risk by up to 42%.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
          Disclaimer: Simulations model scenario cost variances and do not constitute financial underwriting.
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
            <Building2 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              Contract Strategy Simulator (Spot vs Multi-Voyage CoA)
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              SIGNATURE FEATURE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate financial exposure, flexibility, and landed raw material stability across chartering frameworks.
          </p>
        </div>

        <button
          onClick={handleWhyContracts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors self-start sm:self-auto"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>WHY STRATEGY?</span>
        </button>
      </div>

      {/* Interactive What-If Simulation Controls Bar */}
      <div className="p-4 rounded-xl bg-[#0a1428] border border-cyan-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Interactive What-If Scenario Levers</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Adjust sliders to simulate stress test
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Freight Rate Change Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Freight Rate Shift:</span>
              <span
                className={`font-bold ${
                  freightSlider > 0
                    ? "text-amber-400"
                    : freightSlider < 0
                    ? "text-emerald-400"
                    : "text-slate-300"
                }`}
              >
                {freightSlider > 0 ? `+${freightSlider}%` : `${freightSlider}%`}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={freightSlider}
              onChange={(e) => {
                const nextVal = Number(e.target.value);
                setFreightSlider(nextVal);
                onUpdateConfig({ freightShiftPercent: nextVal });
              }}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>-20% (Soft Market)</span>
              <span>Baseline</span>
              <span>+20% (Rate Surge)</span>
            </div>
          </div>

          {/* Port Congestion Level */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-slate-300 block">Port Congestion Level:</span>
            <div className="grid grid-cols-3 gap-1">
              {(["Low", "Medium", "High"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setCongestion(lvl);
                    onUpdateConfig({ congestionLevel: lvl });
                  }}
                  className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                    congestion === lvl
                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                      : "bg-[#0c1830] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">
              {congestion === "High" ? "3.8d – 5.2d anchorage queues" : "Rapid clearance"}
            </span>
          </div>

          {/* Commodity Demand Level */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-slate-300 block">Commodity Demand:</span>
            <div className="grid grid-cols-3 gap-1">
              {(["Low", "Medium", "High"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setDemand(lvl);
                    onUpdateConfig({ demandLevel: lvl });
                  }}
                  className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                    demand === lvl
                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                      : "bg-[#0c1830] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">
              {demand === "High" ? "High steel plant run-rates" : "Stockyard buffering"}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-cyan-300/90">
            Launch full Multi-Voyage CoA Trajectory & BIMCO Clause Simulator →
          </span>
          <button
            type="button"
            onClick={handleApplySimulation}
            disabled={isSimulating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isSimulating ? "animate-spin" : ""}`} />
            <span>
              {isSimulating
                ? "OPENING CONTRACT SIMULATOR..."
                : "SIMULATE CONTRACT STRATEGIES →"}
            </span>
          </button>
        </div>
      </div>

      {/* Contract Options Comparison Cards (3 Options) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {contractOptions.map((opt) => {
          const isRec = opt.isRecommendedForScenario;

          return (
            <div
              key={opt.type}
              className={`rounded-xl p-5 flex flex-col justify-between border transition-all ${
                isRec
                  ? "bg-[#0b162f] border-2 border-cyan-400 shadow-xl shadow-cyan-950/50"
                  : "bg-[#091122] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold font-mono text-white">
                      {opt.title}
                    </h4>
                    <span className="text-xs text-slate-400">{opt.voyageCoverage}</span>
                  </div>
                  {isRec && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-mono font-bold uppercase">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Price & Outlay */}
                <div className="p-3 rounded-lg bg-[#070e1c] border border-slate-800/80 mb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-slate-400">Rate / Tonne:</span>
                    <span className="text-xl font-bold font-mono text-cyan-300">
                      ${opt.baseRatePerTon.toFixed(2)}/MT
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1 text-xs font-mono text-slate-400">
                    <span>Total Parcel Outlay:</span>
                    <span className="text-white font-semibold">
                      ${opt.totalCostUSD.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Metric Matrix */}
                <div className="space-y-2 py-2 border-y border-slate-800 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Exposure:</span>
                    <span
                      className={`font-semibold ${
                        opt.marketExposure === "Low"
                          ? "text-emerald-400"
                          : opt.marketExposure === "Moderate"
                          ? "text-cyan-300"
                          : "text-amber-400"
                      }`}
                    >
                      {opt.marketExposure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operational Flexibility:</span>
                    <span className="text-slate-200">{opt.flexibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost Stability:</span>
                    <span
                      className={`font-semibold ${
                        opt.expectedCostStability === "High"
                          ? "text-emerald-400"
                          : opt.expectedCostStability === "Good"
                          ? "text-cyan-300"
                          : "text-amber-400"
                      }`}
                    >
                      {opt.expectedCostStability}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Planning Risk:</span>
                    <span
                      className={`font-semibold ${
                        opt.planningRisk === "Low"
                          ? "text-emerald-400"
                          : opt.planningRisk === "Medium"
                          ? "text-cyan-300"
                          : "text-amber-400"
                      }`}
                    >
                      {opt.planningRisk}
                    </span>
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="space-y-2 my-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold mb-1">
                      Key Advantages:
                    </span>
                    <ul className="space-y-1">
                      {opt.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig({ contractPreference: opt.type });
                  onRunSimulation();
                }}
                className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  config.contractPreference === opt.type
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {config.contractPreference === opt.type ? "Active Selected Strategy" : `Select ${opt.type} Strategy`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Simulator Disclaimer Note */}
      <div className="text-[11px] text-slate-500 italic flex items-center justify-between border-t border-slate-800 pt-3">
        <span>
          * Contract strategy calculations represent multi-voyage scenario projections for chartering decision support.
        </span>
        <span className="font-mono text-cyan-400/80">
          Parcel: {config.cargoQty.toLocaleString()} MT · {config.cargoType}
        </span>
      </div>
    </div>
  );
};
