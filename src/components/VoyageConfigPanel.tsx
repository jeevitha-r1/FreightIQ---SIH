import React, { useState } from "react";
import {
  Play,
  Sparkles,
  Sliders,
  Anchor,
  Compass,
  Building2,
  Calendar,
  Layers,
  Scale,
  RotateCcw,
} from "lucide-react";
import {
  AnalysisHorizon,
  CargoType,
  ContractType,
  DestinationPort,
  OriginCountry,
  VoyageConfig,
} from "../types";
import {
  CARGO_OPTIONS,
  DEMO_SCENARIOS,
  DESTINATION_OPTIONS,
  ORIGIN_OPTIONS,
  PORT_DATABASE,
} from "../data/maritimeData";

import { DemoScenario } from "../types";

interface VoyageConfigPanelProps {
  config: VoyageConfig;
  onChange?: (updated: Partial<VoyageConfig>) => void;
  onUpdateConfig?: (updated: Partial<VoyageConfig>) => void;
  onRunIntelligence?: () => void;
  onRunSimulation?: () => void;
  isSimulating?: boolean;
  currentScenario?: DemoScenario;
  onSelectScenario?: (scenario: DemoScenario) => void;
}

export const VoyageConfigPanel: React.FC<VoyageConfigPanelProps> = ({
  config,
  onChange,
  onUpdateConfig,
  onRunIntelligence,
  onRunSimulation,
  isSimulating = false,
  currentScenario,
  onSelectScenario,
}) => {
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [localSimulating, setLocalSimulating] = useState(false);
  const [simStepText, setSimStepText] = useState<string>("");

  const handleUpdate = onUpdateConfig || onChange || (() => {});
  const externalRun = onRunSimulation || onRunIntelligence || (() => {});

  const handleTriggerRun = () => {
    if (localSimulating || isSimulating) return;
    setLocalSimulating(true);
    setSimStepText("Calibrating Baltic Dry & Route Telemetry...");
    setTimeout(() => {
      setSimStepText("Validating Port Draft & Vessel Match Matrix...");
    }, 220);
    setTimeout(() => {
      setLocalSimulating(false);
      setSimStepText("");
      externalRun();
    }, 480);
  };

  const activeSimulating = isSimulating || localSimulating;
  const portInfo = PORT_DATABASE[config.destinationPort];

  return (
    <div className="rounded-2xl border border-cyan-900/40 bg-[#081020]/90 backdrop-blur-md p-5 lg:p-6 shadow-xl shadow-black/40">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              Voyage Configuration Cockpit
              <span className="text-[10px] font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                INPUT PARAMETERS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure bulk cargo specifications, sea lanes, and charter terms for AI forecasting.
            </p>
          </div>
        </div>

        {/* Quick Demo Scenario Loader for Judges */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1b33] border border-cyan-500/30 text-cyan-300 hover:bg-[#152749] text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Load Demo Scenario</span>
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#091224] border border-cyan-700/60 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                Standard Maritime Scenarios:
              </div>
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => {
                    if (onSelectScenario) {
                      onSelectScenario(scenario);
                    } else {
                      handleUpdate(scenario.config);
                    }
                    setShowScenarioMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/60 hover:text-cyan-200 text-xs transition-all group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-300">
                    {scenario.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{scenario.subtitle}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Cargo Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Cargo Type</span>
          </label>
          <select
            value={config.cargoType}
            onChange={(e) => handleUpdate({ cargoType: e.target.value as CargoType })}
            className="w-full rounded-lg bg-[#0d172a] border border-slate-700 hover:border-slate-600 focus:border-cyan-500 px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none transition-colors"
          >
            {CARGO_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 block">Bulk metallurgical parcel</span>
        </div>

        {/* Cargo Quantity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-cyan-400" />
              <span>Cargo Quantity</span>
            </label>
            <span className="text-[11px] font-mono text-cyan-300 font-semibold">
              {(config.cargoQty / 1000).toFixed(0)}k MT
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              min={10000}
              max={200000}
              step={5000}
              value={config.cargoQty}
              onChange={(e) => handleUpdate({ cargoQty: Number(e.target.value) || 60000 })}
              className="w-full rounded-lg bg-[#0d172a] border border-slate-700 hover:border-slate-600 focus:border-cyan-500 px-3 py-2 text-xs font-mono font-medium text-slate-100 focus:outline-none transition-colors"
            />
            <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-400">
              Tonnes
            </span>
          </div>
          {/* Quick preset buttons */}
          <div className="flex items-center gap-1 pt-0.5">
            {[45000, 60000, 75000, 120000].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => handleUpdate({ cargoQty: qty })}
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono transition-all ${
                  config.cargoQty === qty
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {qty / 1000}k
              </button>
            ))}
          </div>
        </div>

        {/* Origin */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            <span>Origin</span>
          </label>
          <select
            value={config.origin}
            onChange={(e) => handleUpdate({ origin: e.target.value as OriginCountry })}
            className="w-full rounded-lg bg-[#0d172a] border border-slate-700 hover:border-slate-600 focus:border-cyan-500 px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none transition-colors"
          >
            {ORIGIN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 block">Export port & anchorage</span>
        </div>

        {/* Destination (East Coast India) */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Anchor className="h-3.5 w-3.5 text-cyan-400" />
            <span>Destination (East Coast)</span>
          </label>
          <select
            value={config.destinationPort}
            onChange={(e) => handleUpdate({ destinationPort: e.target.value as DestinationPort })}
            className="w-full rounded-lg bg-[#0d172a] border border-slate-700 hover:border-slate-600 focus:border-cyan-500 px-3 py-2 text-xs font-medium text-cyan-300 focus:outline-none transition-colors"
          >
            {DESTINATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} Port ({PORT_DATABASE[d].maxDraft}m Draft)
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 truncate block">
            Draft: {portInfo?.maxDraft}m · Queue: {portInfo?.currentWaitingDays}d
          </span>
        </div>

        {/* Contract Preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Contract Strategy</span>
          </label>
          <select
            value={config.contractPreference}
            onChange={(e) => handleUpdate({ contractPreference: e.target.value as ContractType })}
            className="w-full rounded-lg bg-[#0d172a] border border-slate-700 hover:border-slate-600 focus:border-cyan-500 px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none transition-colors"
          >
            <option value="Spot">Spot (Single Voyage)</option>
            <option value="Short-Term">Short-Term (60-90 Days)</option>
            <option value="Medium-Term">Medium-Term (CoA 180 Days)</option>
            <option value="Multiple Voyage">Multiple Voyage (Annual)</option>
          </select>
          <span className="text-[10px] text-slate-500 block">Chartering framework</span>
        </div>

        {/* Analysis Horizon */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            <span>Forecast Horizon</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {([7, 14, 30, 60] as AnalysisHorizon[]).map((hz) => (
              <button
                key={hz}
                type="button"
                onClick={() => handleUpdate({ analysisHorizon: hz })}
                className={`py-2 text-xs font-mono font-medium rounded-lg border transition-all ${
                  config.analysisHorizon === hz
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-[#0d172a] text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
              >
                {hz}d
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 block">Lookahead window</span>
        </div>
      </div>

      {/* Action Button Strip */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Active Sea Route:</span>
          <span className="font-semibold text-slate-200">
            {config.origin} → {config.destinationPort}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300 font-mono">
            {config.cargoType} · {config.cargoQty.toLocaleString()} MT
          </span>
        </div>

        <button
          type="button"
          onClick={handleTriggerRun}
          disabled={activeSimulating}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
        >
          <Play className={`h-4 w-4 fill-current ${activeSimulating ? "animate-spin" : ""}`} />
          <span>
            {activeSimulating
              ? simStepText || "COMPUTING VOYAGE INTELLIGENCE..."
              : "RUN VOYAGE INTELLIGENCE →"}
          </span>
        </button>
      </div>
    </div>
  );
};
