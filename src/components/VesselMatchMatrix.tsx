import React from "react";
import {
  Ship,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Award,
  Maximize2,
  Gauge,
  Fuel,
  Info,
} from "lucide-react";
import { VesselClass, VesselSuitability, VoyageConfig } from "../types";
import { VESSEL_DATABASE } from "../data/maritimeData";

interface VesselMatchMatrixProps {
  vessels: VesselSuitability[];
  config: VoyageConfig;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
}

export const VesselMatchMatrix: React.FC<VesselMatchMatrixProps> = ({
  vessels,
  config,
  onOpenWhy,
}) => {
  const recommended = vessels.find((v) => v.isRecommended) || vessels[0];
  const recSpec = VESSEL_DATABASE[recommended.vesselClass];

  const handleWhyVessel = (v: VesselSuitability) => {
    const spec = VESSEL_DATABASE[v.vesselClass];
    onOpenWhy(
      `Vessel Class Evaluation: ${v.vesselClass} (${v.suitabilityScore}% Match)`,
      <div className="space-y-4 text-sm text-slate-300">
        <div className="p-3 rounded-xl bg-[#0d172a] border border-cyan-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">{v.vesselClass} Class</span>
            <span className="text-cyan-300 font-mono font-bold">{v.suitabilityScore}% Suitability</span>
          </div>
          <p className="text-xs text-slate-300">{v.recommendationReason}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#091224] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">DEADWEIGHT CAPACITY</span>
            <span className="text-slate-200 font-semibold">{spec.dwtMin.toLocaleString()} – {spec.dwtMax.toLocaleString()} DWT</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#091224] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">FULL DRAFT</span>
            <span className="text-slate-200 font-semibold">{spec.draftFullyLaden}m Laden</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#091224] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">DAILY TIME-CHARTER</span>
            <span className="text-slate-200 font-semibold">~${spec.dailyCharterEstimate.toLocaleString()}/day</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#091224] border border-slate-800">
            <span className="text-slate-400 block text-[10px]">BUNKER CONSUMPTION</span>
            <span className="text-slate-200 font-semibold">{spec.bunkerConsumptionTonsPerDay} MT/day VLSFO</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="font-semibold text-slate-300">Deadweight Utilization:</span> Your requested parcel of{" "}
          <span className="text-cyan-300 font-mono">{config.cargoQty.toLocaleString()} MT</span> yields a{" "}
          <span className="text-emerald-400 font-mono">{v.utilizationPercent}%</span> utilization factor for this hull type.
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
            <Ship className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              Vessel Match Engine & Hull Optimization
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              DWT PARCEL FIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic vessel sizing balancing parcel volume, fuel economy, and port draft restrictions.
          </p>
        </div>

        {/* Recommended Vessel Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          <Award className="h-4 w-4 text-cyan-400" />
          <span>Recommended: </span>
          <span className="font-bold text-white uppercase">{recommended.vesselClass}</span>
          <span className="text-emerald-400 font-bold">({recommended.suitabilityScore}% Match)</span>
        </div>
      </div>

      {/* Grid of 4 Vessel Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {vessels.map((vessel) => {
          const spec = VESSEL_DATABASE[vessel.vesselClass];
          const isRec = vessel.isRecommended;

          return (
            <div
              key={vessel.vesselClass}
              className={`relative rounded-xl p-4 transition-all flex flex-col justify-between ${
                isRec
                  ? "bg-[#0c1833] border-2 border-cyan-400 shadow-xl shadow-cyan-950/50"
                  : "bg-[#091122] border border-slate-800/90 hover:border-slate-700"
              }`}
            >
              {/* Recommended Ribbon */}
              {isRec && (
                <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-mono font-black text-slate-950 uppercase tracking-wider shadow-md">
                  <Award className="h-3 w-3" />
                  Optimal Match
                </div>
              )}

              <div>
                {/* Vessel Header */}
                <div className="flex items-center justify-between mb-3 pt-1">
                  <div>
                    <h4 className="text-base font-bold font-mono text-white flex items-center gap-1.5">
                      {vessel.vesselClass}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(spec.dwtMin / 1000).toFixed(0)}k – {(spec.dwtMax / 1000).toFixed(0)}k DWT
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-extrabold font-mono ${
                        vessel.suitabilityScore >= 80
                          ? "text-emerald-400"
                          : vessel.suitabilityScore >= 60
                          ? "text-cyan-400"
                          : vessel.suitabilityScore >= 45
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {vessel.suitabilityScore}%
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">Match Score</span>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="space-y-2 py-2 border-y border-slate-800 text-xs">
                  {/* Cargo fit */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Cargo Parcel Fit:</span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        vessel.cargoCompatibility === "Optimal"
                          ? "text-emerald-400"
                          : vessel.cargoCompatibility === "Sub-optimal"
                          ? "text-cyan-300"
                          : "text-amber-400"
                      }`}
                    >
                      {vessel.cargoCompatibility} ({vessel.utilizationPercent}%)
                    </span>
                  </div>

                  {/* Port fit */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Port Feasibility:</span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        vessel.portCompatibility === "Fully Compatible"
                          ? "text-emerald-400"
                          : vessel.portCompatibility === "Draft Restricted"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {vessel.portCompatibility}
                    </span>
                  </div>

                  {/* Idle risk */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Idle / Demurrage:</span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        vessel.estimatedIdleRisk === "Low"
                          ? "text-emerald-400"
                          : vessel.estimatedIdleRisk === "Moderate"
                          ? "text-cyan-300"
                          : "text-amber-400"
                      }`}
                    >
                      {vessel.estimatedIdleRisk}
                    </span>
                  </div>
                </div>

                {/* Dimensions & Daily Cost */}
                <div className="grid grid-cols-2 gap-1.5 py-2.5 text-[10px] font-mono text-slate-400">
                  <div>LOA: <span className="text-slate-200">{spec.loa}m</span></div>
                  <div>Beam: <span className="text-slate-200">{spec.beam}m</span></div>
                  <div>Draft: <span className="text-slate-200">{spec.draftFullyLaden}m</span></div>
                  <div>Charter: <span className="text-slate-200">${(spec.dailyCharterEstimate / 1000).toFixed(1)}k/d</span></div>
                </div>

                {/* Recommendation Reason */}
                <p className="text-[11px] text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  {vessel.recommendationReason}
                </p>
              </div>

              {/* Action */}
              <button
                onClick={() => handleWhyVessel(vessel)}
                className={`w-full py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isRec
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Why {vessel.vesselClass}?</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Explanation Banner */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#09152b] p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white font-mono">
            Algorithm Rationale: {recommended.vesselClass} Selected ({recommended.suitabilityScore}% Match)
          </div>
          <p className="text-slate-300 leading-relaxed">
            Cargo volume of <span className="text-cyan-300 font-mono">{config.cargoQty.toLocaleString()} MT</span> on the{" "}
            <span className="text-white font-semibold">{config.origin} → {config.destinationPort}</span> sea lane achieves{" "}
            <span className="text-emerald-400 font-mono font-semibold">{recommended.utilizationPercent}% deadweight capacity</span> without exceeding{" "}
            <span className="text-slate-200 font-semibold">{config.destinationPort}'s draft ceiling</span>.{" "}
            Capesize vessels would risk severe draft penalties, while Supramax would split parcels across multiple voyages increasing bunker overhead.
          </p>
        </div>
      </div>
    </div>
  );
};
