import React, { useState } from "react";
import {
  Anchor,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Navigation,
  Compass,
  ArrowRight,
  Maximize2,
  Ship,
  Wind,
  Waves,
} from "lucide-react";
import { CompatibilityCheck, DestinationPort, OriginCountry, VesselClass, VoyageConfig } from "../types";
import { ORIGIN_DATABASE, PORT_DATABASE, VESSEL_DATABASE } from "../data/maritimeData";

interface PortCompatibilityMatrixProps {
  checks: CompatibilityCheck[];
  config: VoyageConfig;
  recommendedVessel: VesselClass;
  transitDays: number;
  nauticalMiles: number;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
}

export const PortCompatibilityMatrix: React.FC<PortCompatibilityMatrixProps> = ({
  checks,
  config,
  recommendedVessel,
  transitDays,
  nauticalMiles,
  onOpenWhy,
}) => {
  const destPort = PORT_DATABASE[config.destinationPort];
  const originSpec = ORIGIN_DATABASE[config.origin];
  const vesselSpec = VESSEL_DATABASE[recommendedVessel];

  const handleWhyPort = () => {
    onOpenWhy(
      `Port Compatibility Matrix: ${destPort.name} vs ${recommendedVessel}`,
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          Comprehensive physical and operational compatibility evaluation for berthing at{" "}
          <span className="text-cyan-300 font-semibold">{destPort.name} Port ({destPort.state}, India)</span>:
        </p>
        <div className="space-y-3">
          {checks.map((c, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#0d172a] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">{c.metric}</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    c.status === "pass"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-600/40"
                      : c.status === "warn"
                      ? "bg-amber-950 text-amber-300 border border-amber-600/40"
                      : "bg-rose-950 text-rose-300 border border-rose-600/40"
                  }`}
                >
                  {c.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Vessel: {c.vesselValue}</span>
                <span>Port Limit: {c.portLimit}</span>
              </div>
              <p className="text-xs text-slate-300 pt-1">{c.details}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="font-semibold text-slate-300">Harbour Pilot Advisory:</span> {destPort.notes}
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#081020]/90 backdrop-blur-md p-5 lg:p-6 shadow-xl shadow-black/40 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              Port Compatibility Matrix & Maritime Routing
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              BERTH & DRAFT CHECKS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physical validation of Length Overall, Beam, Maximum Draft, and Discharge Handling rates.
          </p>
        </div>

        <button
          onClick={handleWhyPort}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors self-start sm:self-auto"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>WHY PORT STATUS?</span>
        </button>
      </div>

      {/* Interactive 4-Factor Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {checks.map((check) => {
          const isPass = check.status === "pass";
          const isWarn = check.status === "warn";
          const isFail = check.status === "fail";

          return (
            <div
              key={check.metric}
              className={`rounded-xl p-4 border transition-all ${
                isPass
                  ? "bg-[#09152b]/80 border-emerald-900/50 hover:border-emerald-700/60"
                  : isWarn
                  ? "bg-[#1f1708]/80 border-amber-800/60 hover:border-amber-600/70"
                  : "bg-[#250d12]/80 border-rose-800/60 hover:border-rose-600/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-200">
                  {check.metric} Check
                </span>
                {isPass ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    PASS
                  </span>
                ) : isWarn ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    WARNING
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                    <XCircle className="h-3.5 w-3.5" />
                    FAIL
                  </span>
                )}
              </div>

              {/* Values comparison */}
              <div className="space-y-1 py-1.5 border-y border-slate-800/80 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Vessel Spec:</span>
                  <span className="text-white font-semibold">{check.vesselValue}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Port Ceiling:</span>
                  <span className="text-cyan-300 font-semibold">{check.portLimit}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                {check.details}
              </p>
            </div>
          );
        })}
      </div>

      {/* Simplified Interactive Animated Ocean Route: Origin -> Ocean -> Destination */}
      <div className="rounded-xl border border-slate-800 bg-[#060c18] p-4 lg:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Transit Corridor: {originSpec.country} → {destPort.name} Port
            </h4>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Distance: <strong className="text-cyan-300">{nauticalMiles.toLocaleString()} NM</strong></span>
            <span>·</span>
            <span>Transit: <strong className="text-emerald-400">{transitDays} Days</strong></span>
          </div>
        </div>

        {/* Route Animation Track */}
        <div className="relative my-6 px-4">
          {/* Track line */}
          <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 w-full animate-pulse opacity-80" />
          </div>

          {/* Animated Vessel traversing the bar */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 pointer-events-none">
            <div className="relative w-full h-8">
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center animate-bounce-subtle"
                style={{
                  animation: "vesselVoyage 12s linear infinite",
                }}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50">
                  <Ship className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-cyan-800 whitespace-nowrap mt-1">
                  {recommendedVessel} ({vesselSpec.speedKnots} kts)
                </span>
              </div>
            </div>
          </div>

          {/* Key Waypoint Pins */}
          <div className="flex justify-between items-start mt-4 pt-1">
            {/* Origin */}
            <div className="text-left">
              <span className="text-[10px] font-mono text-cyan-400 block font-semibold">ORIGIN PORT</span>
              <span className="text-xs font-bold text-white">{originSpec.name}</span>
              <span className="text-[10px] text-slate-500 block font-mono">
                Load: {originSpec.typicalLoadingRate.toLocaleString()} MT/day
              </span>
            </div>

            {/* Middle Passage Waypoint */}
            <div className="text-center hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 block font-semibold">SEA PASSAGE</span>
              <span className="text-xs font-bold text-slate-300">
                {config.origin === "Australia" || config.origin === "Indonesia"
                  ? "Malacca / Sunda Deep-Sea Corridor"
                  : config.origin === "USA"
                  ? "Cape of Good Hope Atlantic Corridor"
                  : "Indian Ocean South-East Passage"}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                Fairway swell: 1.8m · Normal
              </span>
            </div>

            {/* Destination */}
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">DESTINATION PORT</span>
              <span className="text-xs font-bold text-white">{destPort.name} Port ({destPort.state})</span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Discharge: {destPort.dischargeRatePerDay.toLocaleString()} MT/day
              </span>
            </div>
          </div>
        </div>

        {/* Port Warning Banner if applicable */}
        {destPort.tidalRestricted && (
          <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-600/30 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold font-mono">Tidal & Draft Window Advisory: </span>
              {destPort.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
