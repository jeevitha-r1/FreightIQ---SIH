import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Ship,
  Anchor,
  TrendingUp,
  ShieldAlert,
  Clock,
  Building2,
  FileText,
  Sparkles,
  CheckCircle2,
  Sliders,
  Zap,
  Navigation,
  Gauge,
  Waves,
  Fuel,
  Play,
  HelpCircle,
  Layers,
  Scale,
  Calendar,
} from "lucide-react";
import {
  AnalysisHorizon,
  CargoType,
  ContractType,
  DemoScenario,
  DestinationPort,
  OriginCountry,
  VoyageAnalysisResult,
  VoyageConfig,
} from "../types";
import {
  CARGO_OPTIONS,
  DEMO_SCENARIOS,
  DESTINATION_OPTIONS,
  ORIGIN_DATABASE,
  ORIGIN_OPTIONS,
  PORT_DATABASE,
  VESSEL_DATABASE,
} from "../data/maritimeData";
import { VoyageScoreCard } from "./VoyageScoreCard";
import { FreightForecastChart } from "./FreightForecastChart";
import { VesselMatchMatrix } from "./VesselMatchMatrix";
import { PortCompatibilityMatrix } from "./PortCompatibilityMatrix";
import { RiskRadarCenter } from "./RiskRadarCenter";
import { IdleTimePredictor } from "./IdleTimePredictor";

interface VoyageIntelligencePageProps {
  config: VoyageConfig;
  analysis: VoyageAnalysisResult;
  currentScenario: DemoScenario;
  onUpdateConfig: (updated: Partial<VoyageConfig>) => void;
  onSelectScenario: (scenario: DemoScenario) => void;
  onBackToDashboard: () => void;
  onNavigateToContracts: () => void;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
  onOpenCopilot: () => void;
  onOpenBrief: () => void;
}

type SteamingMode = "standard" | "eco" | "virtual-arrival";

export const VoyageIntelligencePage: React.FC<VoyageIntelligencePageProps> = ({
  config,
  analysis,
  currentScenario,
  onUpdateConfig,
  onSelectScenario,
  onBackToDashboard,
  onNavigateToContracts,
  onOpenWhy,
  onOpenCopilot,
  onOpenBrief,
}) => {
  const [steamingMode, setSteamingMode] = useState<SteamingMode>("virtual-arrival");
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number>(2);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [recomputeBanner, setRecomputeBanner] = useState<string | null>(
    `AI Telemetry Synchronized: ${config.origin} → ${config.destinationPort} (${config.cargoQty.toLocaleString()} MT ${config.cargoType})`
  );

  const portSpec = PORT_DATABASE[config.destinationPort];
  const originSpec = ORIGIN_DATABASE[config.origin];
  const vesselSpec = VESSEL_DATABASE[analysis.recommendedVessel];

  // Calculate dynamic speed, bunker fuel, and demurrage savings based on steaming mode
  const baseSpeed = vesselSpec.speedKnots;
  const effectiveSpeed =
    steamingMode === "standard"
      ? baseSpeed
      : steamingMode === "eco"
      ? Number((baseSpeed - 1.3).toFixed(1))
      : Number((baseSpeed - 0.9).toFixed(1));

  const effectiveTransitDays = Number(
    (analysis.nauticalMiles / (effectiveSpeed * 24)).toFixed(1)
  );

  const baseDailyBunker = vesselSpec.bunkerConsumptionTonsPerDay;
  const effectiveDailyBunker =
    steamingMode === "standard"
      ? baseDailyBunker
      : steamingMode === "eco"
      ? Math.round(baseDailyBunker * 0.79)
      : Math.round(baseDailyBunker * 0.84);

  const totalBunkerTons = Math.round(effectiveDailyBunker * effectiveTransitDays);
  const baselineBunkerTons = Math.round(baseDailyBunker * analysis.transitDays);
  const bunkerSavedTons = Math.max(0, baselineBunkerTons - totalBunkerTons);
  const bunkerSavedUSD = bunkerSavedTons * 610; // $610/MT VLSFO

  const effectiveIdleDays =
    steamingMode === "virtual-arrival"
      ? Number((analysis.estimatedIdleDays * 0.45).toFixed(1))
      : steamingMode === "eco"
      ? Number((analysis.estimatedIdleDays * 0.75).toFixed(1))
      : analysis.estimatedIdleDays;

  const demurrageSavedUSD = Math.round(
    (analysis.estimatedIdleDays - effectiveIdleDays) * vesselSpec.dailyCharterEstimate
  );

  const totalOptimizationSavingsUSD = bunkerSavedUSD + demurrageSavedUSD;

  // Dynamic Route Waypoints
  const waypoints = [
    {
      id: 0,
      label: `${originSpec.name.split("/")[0].trim()} Terminal`,
      region: `${config.origin} Loading Berth`,
      distanceNM: 0,
      dayMark: "Day 0.0 – 1.8",
      swellMeters: 1.4,
      windKnots: 14,
      status: "Optimal Loading",
      advisory: `Loading rate ${originSpec.typicalLoadingRate.toLocaleString()} MT/day · Max Berth Draft ${originSpec.berthDraft}m.`,
      coordinates: { x: 430, y: 215 },
    },
    {
      id: 1,
      label:
        config.origin === "Australia" || config.origin === "Indonesia"
          ? "Sunda / Malacca Chokepoint"
          : config.origin === "USA" || config.origin === "Mozambique"
          ? "Mozambique / Indian Ocean Ridge"
          : "Luzon / Singapore Fairway",
      region: "Deep-Sea Transit Corridor",
      distanceNM: Math.round(analysis.nauticalMiles * 0.42),
      dayMark: `Day +${(effectiveTransitDays * 0.42).toFixed(1)}`,
      swellMeters: 2.3,
      windKnots: 19,
      status: "Bunker Optimization Zone",
      advisory: `Vessel maintaining ${effectiveSpeed} kts (${steamingMode.toUpperCase()} profile) burning ${effectiveDailyBunker} MT/day VLSFO.`,
      coordinates: { x: 295, y: 175 },
    },
    {
      id: 2,
      label: "Bay of Bengal Six-Degree Channel",
      region: "East Coast India Approach",
      distanceNM: Math.round(analysis.nauticalMiles * 0.78),
      dayMark: `Day +${(effectiveTransitDays * 0.78).toFixed(1)}`,
      swellMeters: config.congestionLevel === "High" ? 3.1 : 1.9,
      windKnots: config.congestionLevel === "High" ? 24 : 16,
      status:
        steamingMode === "virtual-arrival"
          ? "Virtual Arrival Synced"
          : "Standard Approach",
      advisory:
        steamingMode === "virtual-arrival"
          ? `BIMCO Virtual Arrival active: arrival synced with ${config.destinationPort} berth window, cutting anchorage wait to ${effectiveIdleDays}d.`
          : `Approaching East Coast corridor. Recommend syncing speed with ${config.destinationPort} port control to avoid ${analysis.estimatedIdleDays}d queue.`,
      coordinates: { x: 195, y: 125 },
    },
    {
      id: 3,
      label: `${config.destinationPort} Port Berth`,
      region: `${portSpec.state}, East Coast India`,
      distanceNM: analysis.nauticalMiles,
      dayMark: `Day +${effectiveTransitDays}`,
      swellMeters: 1.2,
      windKnots: 12,
      status: analysis.portCompatibilityStatus,
      advisory: `Max Draft ${portSpec.maxDraft}m vs ${analysis.recommendedVessel} Laden Draft ${vesselSpec.draftFullyLaden}m · Discharge ${portSpec.dischargeRatePerDay.toLocaleString()} MT/day.`,
      coordinates: { x: 115, y: 82 },
    },
  ];

  const activeWaypoint = waypoints[selectedWaypointIndex] || waypoints[2];

  const handleQuickRecompute = () => {
    setIsRecomputing(true);
    setTimeout(() => {
      setIsRecomputing(false);
      setRecomputeBanner(
        `Re-Computed @ ${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}: ${config.origin} → ${config.destinationPort} · Score ${analysis.intelligenceScore}/100 · ${analysis.recommendedVessel} (${analysis.recommendedVesselMatchScore}% Fit)`
      );
    }, 450);
  };

  const scrollToModule = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pipelineSteps = [
    { id: "vi-config", num: "01", label: "Cargo & Route", sub: `${(config.cargoQty / 1000).toFixed(0)}k MT ${config.cargoType}` },
    { id: "vi-scorecard", num: "02", label: "Voyage Score", sub: `${analysis.intelligenceScore}/100 Index` },
    { id: "vi-corridor", num: "03", label: "Sea-Lane Twin", sub: `${analysis.nauticalMiles.toLocaleString()} NM` },
    { id: "vi-forecast", num: "04", label: "Freight Forecast", sub: `$${analysis.forecastRate30d.toFixed(2)}/MT` },
    { id: "vi-vessel", num: "05", label: "Vessel Match", sub: `${analysis.recommendedVessel}` },
    { id: "vi-port", num: "06", label: "Port Clearance", sub: `${config.destinationPort}` },
    { id: "vi-risk", num: "07", label: "Risk & Demurrage", sub: `${effectiveIdleDays}d Queue` },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action Command Bar */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#07142b] via-[#0a1936] to-[#071224] p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
                <span>Back to Main Cockpit</span>
              </button>
              <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                VOYAGE INTELLIGENCE COMMAND CENTER
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight pt-1">
              {config.origin} → {config.destinationPort} Port · Predictive Chartering Analysis
            </h1>
            <p className="text-xs text-slate-300">
              End-to-end AI voyage synthesis for{" "}
              <span className="text-cyan-300 font-mono font-semibold">
                {config.cargoQty.toLocaleString()} MT {config.cargoType}
              </span>{" "}
              under{" "}
              <span className="text-cyan-300 font-mono font-semibold">
                {config.contractPreference}
              </span>{" "}
              framework ({config.analysisHorizon}-day lookahead).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onNavigateToContracts}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e2040] hover:bg-[#152d59] text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs transition-all cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-cyan-400" />
              <span>Simulate Contract Strategies</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenBrief}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Export Executive Brief</span>
            </button>
          </div>
        </div>

        {/* Interactive 8-Stage Pipeline Navigation Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/90">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {pipelineSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToModule(step.id)}
                className="text-left p-2 rounded-xl bg-[#081121]/90 hover:bg-[#0f1f3d] border border-slate-800 hover:border-cyan-500/40 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>STEP {step.num}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs font-bold text-white truncate mt-0.5">
                  {step.label}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {step.sub}
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={onNavigateToContracts}
              className="text-left p-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
                <span>STEP 08</span>
                <ArrowRight className="h-3 w-3 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-xs font-bold text-cyan-200 truncate mt-0.5">
                Contract Sim
              </div>
              <div className="text-[10px] font-mono text-cyan-400 truncate">
                CoA vs Spot →
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Live Re-Compute Parameter Bar */}
      <div
        id="vi-config"
        className="rounded-2xl border border-slate-800 bg-[#081020]/95 p-4 sm:p-5 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-white">
              Live Voyage Parameter Controller
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              · Modify any parameter to dynamically recompute all modules below
            </span>
          </div>

          <div className="flex items-center gap-2">
            {DEMO_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  onSelectScenario(sc);
                  handleQuickRecompute();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  currentScenario.id === sc.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                Demo {idx + 1}: {sc.config.origin} → {sc.config.destinationPort}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Cargo Type */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Cargo Commodity
            </label>
            <select
              value={config.cargoType}
              onChange={(e) => {
                onUpdateConfig({ cargoType: e.target.value as CargoType });
                handleQuickRecompute();
              }}
              className="w-full rounded-lg bg-[#0d172a] border border-slate-700 px-2.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {CARGO_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Parcel Size (MT)
            </label>
            <input
              type="number"
              min={15000}
              max={200000}
              step={5000}
              value={config.cargoQty}
              onChange={(e) => {
                onUpdateConfig({ cargoQty: Number(e.target.value) || 60000 });
                handleQuickRecompute();
              }}
              className="w-full rounded-lg bg-[#0d172a] border border-slate-700 px-2.5 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Origin */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Origin Country
            </label>
            <select
              value={config.origin}
              onChange={(e) => {
                onUpdateConfig({ origin: e.target.value as OriginCountry });
                handleQuickRecompute();
              }}
              className="w-full rounded-lg bg-[#0d172a] border border-slate-700 px-2.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {ORIGIN_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              East Coast Port
            </label>
            <select
              value={config.destinationPort}
              onChange={(e) => {
                onUpdateConfig({
                  destinationPort: e.target.value as DestinationPort,
                });
                handleQuickRecompute();
              }}
              className="w-full rounded-lg bg-[#0d172a] border border-slate-700 px-2.5 py-2 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
            >
              {DESTINATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} ({PORT_DATABASE[d].maxDraft}m)
                </option>
              ))}
            </select>
          </div>

          {/* Horizon */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-4 gap-1">
              {([7, 14, 30, 60] as AnalysisHorizon[]).map((hz) => (
                <button
                  key={hz}
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ analysisHorizon: hz });
                    handleQuickRecompute();
                  }}
                  className={`py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                    config.analysisHorizon === hz
                      ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                      : "bg-[#0d172a] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {hz}d
                </button>
              ))}
            </div>
          </div>

          {/* Recompute Action */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleQuickRecompute}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer transition-all active:scale-95"
            >
              <Play
                className={`h-3.5 w-3.5 fill-current ${
                  isRecomputing ? "animate-spin" : ""
                }`}
              />
              <span>
                {isRecomputing ? "COMPUTING..." : "RE-RUN INTELLIGENCE"}
              </span>
            </button>
          </div>
        </div>

        {recomputeBanner && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{recomputeBanner}</span>
            </div>
            <span className="text-[10px] text-cyan-400 hidden sm:inline">
              tabular-nums verified
            </span>
          </div>
        )}
      </div>

      {/* INNOVATIVE MODULE: Interactive Sea-Lane Corridor & BIMCO Virtual Arrival Optimizer */}
      <div
        id="vi-corridor"
        className="rounded-2xl border border-cyan-500/30 bg-[#081020]/95 p-5 lg:p-6 shadow-xl space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-mono tracking-wide">
                Interactive Sea-Lane Telemetry & BIMCO Virtual Arrival Optimizer
              </h2>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                INNOVATION MODULE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Click any sea-lane waypoint to inspect hydrographic swell, bunker consumption, and dynamic speed-to-berth synchronization.
            </p>
          </div>

          {/* Steaming Profile Selector */}
          <div className="flex items-center gap-1.5 bg-[#0b1528] p-1.5 rounded-xl border border-slate-800">
            {[
              { id: "standard" as SteamingMode, label: "Standard Speed" },
              { id: "eco" as SteamingMode, label: "Eco Slow-Steam" },
              {
                id: "virtual-arrival" as SteamingMode,
                label: "BIMCO Virtual Arrival",
              },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSteamingMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  steamingMode === mode.id
                    ? "bg-cyan-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Interactive SVG Maritime Telemetry Map */}
          <div className="lg:col-span-7 relative rounded-xl bg-[#050b16] border border-slate-800 p-4 overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-cyan-300 font-semibold">
                CORRIDOR: {config.origin.toUpperCase()} →{" "}
                {config.destinationPort.toUpperCase()} ({analysis.nauticalMiles.toLocaleString()} NM)
              </span>
              <span className="text-emerald-400">
                Est. Savings: +${totalOptimizationSavingsUSD.toLocaleString()}
              </span>
            </div>

            <svg className="w-full h-[250px]" viewBox="0 0 500 260">
              <defs>
                <linearGradient id="viRouteGrad" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Coordinate Grid */}
              {[60, 140, 220, 300, 380, 460].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="260"
                  stroke="#112240"
                  strokeDasharray="3 3"
                />
              ))}
              {[55, 115, 175, 235].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="500"
                  y2={y}
                  stroke="#112240"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Simplified India East Coast & Origin Contours */}
              <path
                d="M 55 0 C 65 45, 90 80, 108 115 C 125 150, 150 185, 160 220 L 0 220 L 0 0 Z"
                fill="#0c1930"
                stroke="#1e3a6a"
                strokeWidth="1.5"
              />
              <text
                x="22"
                y="50"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                INDIA EAST COAST
              </text>

              <path
                d="M 370 260 C 390 225, 425 195, 485 185 L 500 260 Z"
                fill="#0c1930"
                stroke="#1e3a6a"
                strokeWidth="1.5"
              />
              <text
                x="405"
                y="242"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
              >
                {config.origin.toUpperCase()}
              </text>

              {/* Active Sea Route Curve */}
              <path
                d="M 430 215 Q 345 205, 295 175 T 195 125 T 115 82"
                fill="none"
                stroke="url(#viRouteGrad)"
                strokeWidth="3"
                strokeDasharray="7 4"
              />

              {/* Animated Vessel Marker */}
              <g>
                <animateMotion
                  path="M 430 215 Q 345 205, 295 175 T 195 125 T 115 82"
                  dur={steamingMode === "standard" ? "7s" : "9.5s"}
                  repeatCount="indefinite"
                  rotate="auto"
                />
                <rect
                  x="-9"
                  y="-4"
                  width="18"
                  height="8"
                  rx="2"
                  fill="#22d3ee"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                <circle cx="0" cy="0" r="12" fill="#22d3ee" opacity="0.2" />
              </g>

              {/* Interactive Waypoint Nodes */}
              {waypoints.map((wp, idx) => {
                const isSelected = idx === selectedWaypointIndex;
                return (
                  <g
                    key={wp.id}
                    onClick={() => setSelectedWaypointIndex(idx)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={wp.coordinates.x}
                      cy={wp.coordinates.y}
                      r={isSelected ? 13 : 8}
                      fill={isSelected ? "#06b6d4" : "#0f172a"}
                      fillOpacity={isSelected ? "0.25" : "0.6"}
                      stroke={isSelected ? "#22d3ee" : "#38bdf8"}
                      strokeWidth={isSelected ? "2" : "1.2"}
                    />
                    <circle
                      cx={wp.coordinates.x}
                      cy={wp.coordinates.y}
                      r={isSelected ? 6 : 4.5}
                      fill={idx === 3 ? "#10b981" : isSelected ? "#22d3ee" : "#38bdf8"}
                    />
                    <text
                      x={wp.coordinates.x - 30}
                      y={wp.coordinates.y - 14}
                      fill={isSelected ? "#ffffff" : "#94a3b8"}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {wp.label.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Waypoint Selector Strip */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {waypoints.map((wp, idx) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => setSelectedWaypointIndex(idx)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedWaypointIndex === idx
                      ? "bg-cyan-950/70 border-cyan-400 text-white"
                      : "bg-[#091326] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-[10px] font-mono text-cyan-400">
                    WP 0{idx + 1} · {wp.dayMark}
                  </div>
                  <div className="text-xs font-semibold truncate">
                    {wp.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Waypoint Telemetry & Steaming Optimization Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selected Waypoint Telemetry Card */}
            <div className="rounded-xl bg-[#0a1529] border border-cyan-500/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  SELECTED WAYPOINT TELEMETRY (WP 0{selectedWaypointIndex + 1})
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {activeWaypoint.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  {activeWaypoint.label}
                </h3>
                <p className="text-xs text-slate-400">{activeWaypoint.region}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#070f1e] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">DISTANCE</span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {activeWaypoint.distanceNM.toLocaleString()} NM
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#070f1e] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SEA SWELL</span>
                  <span className="text-sm font-bold text-cyan-300 tabular-nums">
                    {activeWaypoint.swellMeters}m / {activeWaypoint.windKnots}kt
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#070f1e] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">TIMELINE</span>
                  <span className="text-sm font-bold text-emerald-300 tabular-nums">
                    {activeWaypoint.dayMark}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#070f1e] p-3 rounded-lg border border-slate-800/80">
                {activeWaypoint.advisory}
              </p>
            </div>

            {/* Speed & Bunker Optimization Summary */}
            <div className="rounded-xl bg-[#091224] border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Fuel className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Propulsion & Demurrage Optimization</span>
                </span>
                <span className="text-cyan-400 uppercase">{steamingMode}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#070e1c] border border-slate-800/90">
                  <span className="text-[10px] text-slate-400 block">
                    SPEED & TRANSIT
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {effectiveSpeed} kts · {effectiveTransitDays}d
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#070e1c] border border-slate-800/90">
                  <span className="text-[10px] text-slate-400 block">
                    VLSFO BUNKER BURN
                  </span>
                  <span className="text-sm font-bold text-cyan-300 tabular-nums">
                    {totalBunkerTons} MT ({effectiveDailyBunker} MT/d)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#070e1c] border border-slate-800/90">
                  <span className="text-[10px] text-slate-400 block">
                    EFFECTIVE PORT QUEUE
                  </span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    {effectiveIdleDays}d (vs {analysis.estimatedIdleDays}d)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#070e1c] border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block">
                    NET VOYAGE SAVINGS
                  </span>
                  <span className="text-sm font-bold text-emerald-300 tabular-nums">
                    +${totalOptimizationSavingsUSD.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module 02: Decision Scorecard */}
      <div id="vi-scorecard">
        <VoyageScoreCard
          analysis={analysis}
          config={config}
          onOpenWhy={onOpenWhy}
          onOpenCopilot={onOpenCopilot}
        />
      </div>

      {/* Module 04: Freight Forecast Chart */}
      <div id="vi-forecast">
        <FreightForecastChart
          data={analysis.forecastData}
          currentRate={analysis.currentRate}
          forecastRate={analysis.forecastRate30d}
          rateChangePercent={analysis.rateChangePercent}
          marketTrend={analysis.marketTrend}
          factors={analysis.forecastFactors}
          config={config}
          onOpenWhy={onOpenWhy}
        />
      </div>

      {/* Module 05: Vessel Match Engine */}
      <div id="vi-vessel">
        <VesselMatchMatrix
          vessels={analysis.vesselComparisons}
          config={config}
          onOpenWhy={onOpenWhy}
        />
      </div>

      {/* Module 06: Port Compatibility Matrix */}
      <div id="vi-port">
        <PortCompatibilityMatrix
          checks={analysis.compatibilityChecks}
          config={config}
          recommendedVessel={analysis.recommendedVessel}
          transitDays={analysis.transitDays}
          nauticalMiles={analysis.nauticalMiles}
          onOpenWhy={onOpenWhy}
        />
      </div>

      {/* Module 07: Risk & Idle Time */}
      <div id="vi-risk" className="space-y-6">
        <RiskRadarCenter
          riskIndicators={analysis.riskIndicators}
          activeAlerts={analysis.activeAlerts}
          overallRiskLevel={analysis.overallRiskLevel}
          config={config}
          onOpenWhy={onOpenWhy}
        />

        <IdleTimePredictor
          timelinePhases={analysis.timelinePhases}
          estimatedIdleDays={analysis.estimatedIdleDays}
          estimatedIdleCostUSD={analysis.estimatedIdleCostUSD}
          utilizationPercent={analysis.utilizationPercent}
          idleReductionAdvice={analysis.idleReductionAdvice}
          onOpenWhy={onOpenWhy}
        />
      </div>

      {/* Next Step Call-To-Action Banner: Redirect to Contract Strategy Simulator */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#07142b] via-[#0d1f42] to-[#07142b] p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
            NEXT WORKFLOW STAGE · STEP 08
          </div>
          <h3 className="text-lg font-bold text-white font-mono">
            Proceed to Multi-Voyage Contract Strategy Simulation
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Compare Spot vs Short-Term (60–90d) vs Medium-Term CoA (180d) financial exposure across consecutive steel plant liftings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToContracts}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
          >
            <Building2 className="h-4 w-4" />
            <span>LAUNCH CONTRACT STRATEGY SIMULATOR</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
