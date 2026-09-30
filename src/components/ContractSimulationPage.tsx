import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Sliders,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  HelpCircle,
  Scale,
  Play,
  Layers,
  Anchor,
  AlertTriangle,
  Compass,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ContractStrategyOption,
  ContractType,
  VoyageAnalysisResult,
  VoyageConfig,
} from "../types";
import { PORT_DATABASE, VESSEL_DATABASE } from "../data/maritimeData";

interface ContractSimulationPageProps {
  config: VoyageConfig;
  analysis: VoyageAnalysisResult;
  onUpdateConfig: (updated: Partial<VoyageConfig>) => void;
  onBackToDashboard: () => void;
  onBackToVoyageIntelligence: () => void;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
  onOpenBrief: () => void;
  onOpenCopilot: () => void;
}

export const ContractSimulationPage: React.FC<ContractSimulationPageProps> = ({
  config,
  analysis,
  onUpdateConfig,
  onBackToDashboard,
  onBackToVoyageIntelligence,
  onOpenWhy,
  onOpenBrief,
  onOpenCopilot,
}) => {
  const [freightSlider, setFreightSlider] = useState<number>(
    config.freightShiftPercent
  );
  const [congestion, setCongestion] = useState<"Low" | "Medium" | "High">(
    config.congestionLevel
  );
  const [demand, setDemand] = useState<"Low" | "Medium" | "High">(
    config.demandLevel
  );
  const [voyageCount, setVoyageCount] = useState<number>(6);
  const [bunkerPriceMT, setBunkerPriceMT] = useState<number>(620);
  const [useVirtualArrivalClause, setUseVirtualArrivalClause] =
    useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    `Monte Carlo & CoA Simulation Active · ${voyageCount} Consecutive Voyages (${(
      (config.cargoQty * voyageCount) /
      1000
    ).toFixed(0)}k MT Total Program)`
  );

  const portSpec = PORT_DATABASE[config.destinationPort];
  const vesselSpec = VESSEL_DATABASE[analysis.recommendedVessel];

  // Apply changes immediately when user adjusts levers or clicks Re-Run
  const handleRunContractSim = (
    overrideShift = freightSlider,
    overrideCong = congestion,
    overrideDem = demand
  ) => {
    setIsSimulating(true);
    onUpdateConfig({
      freightShiftPercent: overrideShift,
      congestionLevel: overrideCong,
      demandLevel: overrideDem,
    });
    setTimeout(() => {
      setIsSimulating(false);
      setStatusMessage(
        `Simulation Updated @ ${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}: Rate Shift ${
          overrideShift > 0 ? `+${overrideShift}%` : `${overrideShift}%`
        } · Congestion ${overrideCong} · Demand ${overrideDem} · ${voyageCount} Liftings`
      );
    }, 350);
  };

  // Multi-voyage trajectory calculation across N voyages
  const multiVoyageData = useMemo(() => {
    const spotOpt =
      analysis.contractOptions.find((o) => o.type === "Spot") ||
      analysis.contractOptions[0];
    const shortOpt =
      analysis.contractOptions.find((o) => o.type === "Short-Term") ||
      analysis.contractOptions[1];
    const coaOpt =
      analysis.contractOptions.find((o) => o.type === "Medium-Term") ||
      analysis.contractOptions[2];

    const bunkerDeltaPerTon = ((bunkerPriceMT - 600) / 100) * 0.65;
    const demurragePerVoyageSpot =
      analysis.estimatedIdleCostUSD * (useVirtualArrivalClause ? 0.75 : 1.0);
    const demurragePerVoyageCoA =
      analysis.estimatedIdleCostUSD * (useVirtualArrivalClause ? 0.42 : 0.78);

    const rows = [];
    let cumSpot = 0;
    let cumShort = 0;
    let cumCoA = 0;

    for (let v = 1; v <= voyageCount; v++) {
      // Progressive market drift across consecutive voyages
      const cycleDrift =
        1 +
        (freightSlider / 100) * (v / voyageCount) * 0.55 +
        Math.sin(v * 0.9) * 0.035;

      const vSpotCost =
        (spotOpt.baseRatePerTon * cycleDrift + bunkerDeltaPerTon) *
          config.cargoQty +
        demurragePerVoyageSpot;

      const vShortCost =
        (shortOpt.baseRatePerTon * (1 + (cycleDrift - 1) * 0.45) +
          bunkerDeltaPerTon * 0.6) *
          config.cargoQty +
        demurragePerVoyageSpot * 0.8;

      const vCoACost =
        (coaOpt.baseRatePerTon + bunkerDeltaPerTon * 0.25) * config.cargoQty +
        demurragePerVoyageCoA;

      cumSpot += Math.round(vSpotCost);
      cumShort += Math.round(vShortCost);
      cumCoA += Math.round(vCoACost);

      rows.push({
        voyage: `Voyage ${v}`,
        tonnageMoved: `${((v * config.cargoQty) / 1000).toFixed(0)}k MT`,
        spotCumulativeUSD: Math.round(cumSpot / 1000), // in $k
        shortTermCumulativeUSD: Math.round(cumShort / 1000), // in $k
        coaCumulativeUSD: Math.round(cumCoA / 1000), // in $k
        netCoASavingsUSD: Math.round((cumSpot - cumCoA) / 1000), // in $k
      });
    }
    return rows;
  }, [
    analysis.contractOptions,
    analysis.estimatedIdleCostUSD,
    bunkerPriceMT,
    config.cargoQty,
    freightSlider,
    useVirtualArrivalClause,
    voyageCount,
  ]);

  const finalVoyageSummary = multiVoyageData[multiVoyageData.length - 1] || {
    spotCumulativeUSD: 0,
    shortTermCumulativeUSD: 0,
    coaCumulativeUSD: 0,
    netCoASavingsUSD: 0,
  };

  // Recommended BIMCO clauses tailored to scenario
  const recommendedClauses = [
    {
      code: "BIMCO-VA-2023",
      title: "BIMCO Virtual Arrival & Slow-Steaming Clause",
      status: useVirtualArrivalClause ? "ACTIVE IN SIMULATION" : "OPTIONAL",
      impact: `Converts ${analysis.estimatedIdleDays}d anchorage queue at ${config.destinationPort} into 16–21% VLSFO bunker reduction and cuts demurrage by 58%.`,
    },
    {
      code: "BIMCO-BAF-CORRIDOR",
      title: "Bunker Price Volatility Collar ($550–$680/MT VLSFO)",
      status: "RECOMMENDED FOR CoA",
      impact: `Caps bunker fuel pass-through surcharge at ±4.5% across all ${voyageCount} consecutive liftings from ${config.origin}.`,
    },
    {
      code: portSpec.tidalRestricted
        ? "EAST-COAST-NEAP-DRAFT"
        : "EAST-COAST-BERTH-PRIORITY",
      title: portSpec.tidalRestricted
        ? `Neap-Tide Draft & Lightering Protection (${config.destinationPort} ${portSpec.maxDraft}m Limit)`
        : `Mechanized Berth Window Guarantee (${config.destinationPort} ${portSpec.dischargeRatePerDay.toLocaleString()} MT/d)`,
      status: "PORT MANDATORY",
      impact: portSpec.tidalRestricted
        ? `Protects charterer from deadfreight or tidal bore waiting time when ${analysis.recommendedVessel} arrives at ${vesselSpec.draftFullyLaden}m draft.`
        : `Locks in high-speed conveyor discharge rate of ${portSpec.dischargeRatePerDay.toLocaleString()} MT/day to earn despatch credits.`,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Command Bar */}
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
                <span>Main Cockpit</span>
              </button>

              <button
                type="button"
                onClick={onBackToVoyageIntelligence}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1c38] hover:bg-[#132850] text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span>Voyage Intelligence Page</span>
              </button>

              <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                CONTRACT STRATEGY & CoA SIMULATOR
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight pt-1">
              Multi-Voyage Contract Strategy & Financial Risk Simulator
            </h1>
            <p className="text-xs text-slate-300">
              Stress-testing Spot vs Short-Term (60–90d) vs Medium-Term CoA (180d) for{" "}
              <span className="text-cyan-300 font-mono font-semibold">
                {config.origin} → {config.destinationPort}
              </span>{" "}
              · Active Strategy:{" "}
              <span className="text-emerald-400 font-mono font-bold">
                {config.contractPreference}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCopilot}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono font-bold text-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Ask Copilot on CoA</span>
            </button>

            <button
              type="button"
              onClick={onOpenBrief}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Export Contract Tender Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Stress-Test Levers Console */}
      <div className="rounded-2xl border border-cyan-500/30 bg-[#081020]/95 p-5 lg:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              Interactive Multi-Voyage Stress-Test Levers
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {statusMessage}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Freight Market Rate Shift */}
          <div className="p-3.5 rounded-xl bg-[#0b1528] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Market Freight Shift:</span>
              <span
                className={`font-bold tabular-nums ${
                  freightSlider > 0
                    ? "text-amber-400"
                    : freightSlider < 0
                    ? "text-emerald-400"
                    : "text-cyan-300"
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
                const val = Number(e.target.value);
                setFreightSlider(val);
                handleRunContractSim(val, congestion, demand);
              }}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-20% (Backwardation)</span>
              <span>0% Base</span>
              <span>+20% (Rate Surge)</span>
            </div>
          </div>

          {/* 2. Consecutive Program Liftings */}
          <div className="p-3.5 rounded-xl bg-[#0b1528] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Consecutive Voyages (CoA):</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {voyageCount} Liftings (
                {((voyageCount * config.cargoQty) / 1000).toFixed(0)}k MT)
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {[2, 4, 6, 8, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setVoyageCount(cnt)}
                  className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                    voyageCount === cnt
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : "bg-[#081020] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {cnt}x
                </button>
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-500 block">
              Total Procurement Volume:{" "}
              {(voyageCount * config.cargoQty).toLocaleString()} MT
            </span>
          </div>

          {/* 3. VLSFO Bunker Fuel Price Lever */}
          <div className="p-3.5 rounded-xl bg-[#0b1528] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">VLSFO Bunker Index:</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                ${bunkerPriceMT}/MT
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={800}
              step={10}
              value={bunkerPriceMT}
              onChange={(e) => setBunkerPriceMT(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>$500/MT</span>
              <span>$620 Base</span>
              <span>$800/MT (Oil Spike)</span>
            </div>
          </div>

          {/* 4. Port Congestion Level */}
          <div className="p-3.5 rounded-xl bg-[#0b1528] border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-300 block">
              Port Congestion Regime ({config.destinationPort}):
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["Low", "Medium", "High"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setCongestion(lvl);
                    handleRunContractSim(freightSlider, lvl, demand);
                  }}
                  className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                    congestion === lvl
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : "bg-[#081020] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Steel Plant Commodity Demand */}
          <div className="p-3.5 rounded-xl bg-[#0b1528] border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-300 block">
              Blast Furnace Demand Run-Rate:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["Low", "Medium", "High"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setDemand(lvl);
                    handleRunContractSim(freightSlider, congestion, lvl);
                  }}
                  className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                    demand === lvl
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : "bg-[#081020] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 6. BIMCO Virtual Arrival Toggle + Run Button */}
          <div className="p-3.5 rounded-xl bg-[#0b1528] border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                BIMCO Virtual Arrival Shield:
              </span>
              <button
                type="button"
                onClick={() =>
                  setUseVirtualArrivalClause(!useVirtualArrivalClause)
                }
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  useVirtualArrivalClause
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {useVirtualArrivalClause ? "ENABLED (-58% Idle)" : "DISABLED"}
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                handleRunContractSim(freightSlider, congestion, demand)
              }
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer transition-all active:scale-95"
            >
              <Play
                className={`h-3.5 w-3.5 fill-current ${
                  isSimulating ? "animate-spin" : ""
                }`}
              />
              <span>
                {isSimulating
                  ? "RE-SIMULATING STRATEGIES..."
                  : "RE-RUN CONTRACT SIMULATION"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Voyage Cumulative Outlay & CoA Savings Trajectory Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#081020]/95 p-5 lg:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Cumulative Multi-Voyage Charter Outlay: Spot vs Short-Term vs CoA
              </h3>
              <p className="text-xs text-slate-400">
                Projected cumulative expenditure ($ Thousands USD) across{" "}
                {voyageCount} consecutive parcels of{" "}
                {config.cargoQty.toLocaleString()} MT {config.cargoType}.
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block">
                PROJECTED CoA PROGRAM SAVINGS
              </span>
              <span className="text-lg font-extrabold text-emerald-400 tabular-nums">
                {finalVoyageSummary.netCoASavingsUSD >= 0 ? "+" : ""}$
                {finalVoyageSummary.netCoASavingsUSD.toLocaleString()}k USD
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={multiVoyageData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="spotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="coaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="voyage"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `$${v}k`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#091326",
                    borderColor: "#1e3a8a",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                  formatter={(value: any, name: string) => [
                    `$${Number(value).toLocaleString()}k USD`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                <Area
                  type="monotone"
                  dataKey="spotCumulativeUSD"
                  name="Reactive Spot Charter"
                  stroke="#f59e0b"
                  fill="url(#spotGrad)"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="shortTermCumulativeUSD"
                  name="Short-Term (60-90d)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="coaCumulativeUSD"
                  name="Medium-Term CoA (Recommended)"
                  stroke="#10b981"
                  fill="url(#coaGrad)"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Executive Financial Summary & BIMCO Clauses */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#081020]/95 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Recommended BIMCO Clauses</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Contractual protections tailored for {config.destinationPort} Port.
            </p>
          </div>

          <div className="space-y-3">
            {recommendedClauses.map((clause) => (
              <div
                key={clause.code}
                className="p-3 rounded-xl bg-[#0b152b] border border-slate-800/90 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold">{clause.code}</span>
                  <span className="text-emerald-400 font-semibold">
                    {clause.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">
                  {clause.title}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {clause.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Contract Strategy Cards (Interactive Lock-In) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {analysis.contractOptions.map((opt) => {
          const isRec = opt.isRecommendedForScenario;
          const isSelected = config.contractPreference === opt.type;
          const multiVoyageTotalUSD =
            opt.totalCostUSD * voyageCount +
            Math.round(
              analysis.estimatedIdleCostUSD *
                voyageCount *
                (opt.type === "Medium-Term" ? 0.45 : opt.type === "Short-Term" ? 0.75 : 1)
            );

          return (
            <div
              key={opt.type}
              className={`rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                isRec
                  ? "bg-[#0b162f] border-2 border-cyan-400 shadow-xl shadow-cyan-950/50"
                  : "bg-[#091122] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold font-mono text-white">
                      {opt.title}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {opt.voyageCoverage}
                    </span>
                  </div>
                  {isRec && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-mono font-bold uppercase">
                      AI Optimal
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#070e1c] border border-slate-800/80 mb-4 space-y-1.5 font-mono">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">
                      Simulated Rate / MT:
                    </span>
                    <span className="text-xl font-bold text-cyan-300 tabular-nums">
                      ${opt.baseRatePerTon.toFixed(2)}/MT
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Single Parcel Outlay:</span>
                    <span className="text-white font-semibold tabular-nums">
                      ${opt.totalCostUSD.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">
                      {voyageCount}-Voyage Program Est.:
                    </span>
                    <span className="text-emerald-300 font-bold tabular-nums">
                      ${multiVoyageTotalUSD.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 py-2 border-y border-slate-800 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Exposure:</span>
                    <span className="text-slate-200 font-semibold">
                      {opt.marketExposure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Operational Flexibility:
                    </span>
                    <span className="text-slate-200">{opt.flexibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost Stability:</span>
                    <span className="text-emerald-400 font-semibold">
                      {opt.expectedCostStability}
                    </span>
                  </div>
                </div>

                <div className="my-3 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">
                    Strategic Advantages:
                  </span>
                  <ul className="space-y-1">
                    {opt.pros.map((p, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-1.5 text-slate-300 text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onUpdateConfig({ contractPreference: opt.type });
                  setStatusMessage(
                    `Locked In Strategy: ${opt.title} ($${opt.baseRatePerTon.toFixed(
                      2
                    )}/MT) applied to main cockpit.`
                  );
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {isSelected
                  ? `✓ Active Strategy (${opt.type})`
                  : `Lock In ${opt.type} Strategy`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
