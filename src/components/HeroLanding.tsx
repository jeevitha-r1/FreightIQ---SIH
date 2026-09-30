import React from "react";
import {
  TrendingUp,
  Ship,
  ShieldAlert,
  ArrowRight,
  Compass,
  Anchor,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle2,
} from "lucide-react";

import { DemoScenario } from "../types";
import { DEMO_SCENARIOS } from "../data/maritimeData";

interface HeroLandingProps {
  onStartAnalysis?: () => void;
  onExploreDemo?: () => void;
  currentScenario?: DemoScenario;
  onSelectScenario?: (scenario: DemoScenario) => void;
  onLaunchCockpit?: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartAnalysis,
  onExploreDemo,
  currentScenario,
  onSelectScenario,
  onLaunchCockpit,
}) => {
  const handleStart = onLaunchCockpit || onStartAnalysis || (() => {});
  const handleExplore = onExploreDemo || handleStart;
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-65px)] flex flex-col justify-between py-8 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Background Maritime Grid & Radials */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#16254415_1px,transparent_1px),linear-gradient(to_bottom,#16254415_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Banner / Maritime Context */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-sm shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>East Coast India Maritime Corridor</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-mono">Bulk Vessel Chartering Decision Cockpit</span>
        </div>
      </div>

      {/* Hero Content + Animated Route Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column: Headlines & CTAs */}
        <div className="lg:col-span-6 text-left space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm tracking-widest uppercase font-semibold">
              <Compass className="h-4 w-4 animate-spin-slow" />
              <span>Next-Gen Maritime Decision Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight font-mono">
              Freight<span className="text-cyan-400">IQ</span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-slate-200">
                Predict before you charter.
              </span>
            </h1>
          </div>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
            AI-powered freight forecasting, vessel matching and voyage intelligence for bulk cargo procurement from overseas to the East Coast of India.
          </p>

          <p className="text-xs text-slate-400 max-w-lg border-l-2 border-cyan-500/40 pl-3">
            Transitioning public & private steel logistics managers from reactive daily spot-market tenders toward predictive multiple-voyage contract optimization.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 transition-all active:scale-95 cursor-pointer"
            >
              <span>Launch Maritime Cockpit</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleExplore}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0d1627]/80 hover:bg-[#13223f] px-5 py-3.5 text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Explore 3 Built-In Scenarios</span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
            <div>
              <div className="text-xl font-bold font-mono text-cyan-300">7–60 Days</div>
              <div className="text-[11px] text-slate-400">Predictive Horizon</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-emerald-300">7 East Ports</div>
              <div className="text-[11px] text-slate-400">Paradip, Vizag, etc.</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-blue-300">4 Vessel Classes</div>
              <div className="text-[11px] text-slate-400">Handysize to Capesize</div>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Maritime Route Visualization (Australia -> Indian Ocean -> East Coast India) */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-2xl border border-cyan-500/30 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-2xl shadow-cyan-950/40 overflow-hidden">
            {/* Header / Telemetry of the route visualizer */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-slate-200 tracking-wider">
                  MARITIME SEA LANE: AUS → BAY OF BENGAL
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                4,850 NM · 14.6 DAYS
              </span>
            </div>

            {/* SVG Ocean & Route Canvas */}
            <div className="relative w-full h-[240px] sm:h-[280px] bg-[#050b17] rounded-xl border border-slate-800/80 overflow-hidden">
              {/* Bathymetry & Grid lines */}
              <svg className="w-full h-full" viewBox="0 0 500 280">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#00f0ff" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>

                {/* Latitude / Longitude grid lines */}
                <line x1="50" y1="0" x2="50" y2="280" stroke="#13243f" strokeDasharray="3 3" />
                <line x1="150" y1="0" x2="150" y2="280" stroke="#13243f" strokeDasharray="3 3" />
                <line x1="250" y1="0" x2="250" y2="280" stroke="#13243f" strokeDasharray="3 3" />
                <line x1="350" y1="0" x2="350" y2="280" stroke="#13243f" strokeDasharray="3 3" />
                <line x1="450" y1="0" x2="450" y2="280" stroke="#13243f" strokeDasharray="3 3" />

                <line x1="0" y1="70" x2="500" y2="70" stroke="#13243f" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#13243f" strokeDasharray="3 3" />
                <line x1="0" y1="210" x2="500" y2="210" stroke="#13243f" strokeDasharray="3 3" />

                {/* Landmass contours simplified */}
                {/* Australia Coast (Bottom-Right) */}
                <path
                  d="M 380 280 C 400 240, 430 200, 480 190 L 500 280 Z"
                  fill="#0f1d36"
                  stroke="#1e3a6a"
                  strokeWidth="1.5"
                />
                <text x="415" y="245" fill="#64748b" fontSize="10" fontFamily="monospace">AUSTRALIA</text>

                {/* Indonesia / Sunda Arc (Center) */}
                <path
                  d="M 230 170 Q 280 165, 340 160 Q 320 175, 260 180 Z"
                  fill="#0f1d36"
                  stroke="#1e3a6a"
                  strokeWidth="1.5"
                />
                <text x="270" y="160" fill="#64748b" fontSize="9" fontFamily="monospace">INDONESIA</text>

                {/* India East Coast (Top-Left) */}
                <path
                  d="M 60 0 C 70 50, 95 90, 110 130 C 130 170, 160 210, 170 240 L 0 240 L 0 0 Z"
                  fill="#0f1d36"
                  stroke="#1e3a6a"
                  strokeWidth="1.5"
                />
                <text x="30" y="60" fill="#64748b" fontSize="11" fontFamily="monospace" fontWeight="bold">INDIA</text>
                <text x="40" y="75" fill="#38bdf8" fontSize="9" fontFamily="monospace">East Coast</text>

                {/* Maritime Route Arc: Hay Point (440, 210) -> Sunda Strait (270, 170) -> Bay of Bengal -> Paradip (120, 85) */}
                <path
                  id="voyagePath"
                  d="M 440 210 Q 300 215, 260 170 T 120 85"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  filter="url(#glow)"
                />

                {/* Origin Port: Hay Point / Gladstone */}
                <circle cx="440" cy="210" r="5" fill="#38bdf8" />
                <circle cx="440" cy="210" r="10" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                <text x="375" y="200" fill="#bae6fd" fontSize="10" fontFamily="monospace">Hay Point (AUS)</text>

                {/* Waypoint: Sunda / Malacca entry */}
                <circle cx="260" cy="170" r="3" fill="#00f0ff" />
                <text x="235" y="195" fill="#94a3b8" fontSize="8" fontFamily="monospace">Sunda Lane WP</text>

                {/* Destination: Paradip / Vizag */}
                <circle cx="120" cy="85" r="6" fill="#22c55e" />
                <circle cx="120" cy="85" r="12" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
                <text x="135" y="85" fill="#86efac" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  Paradip Port
                </text>
                <text x="135" y="98" fill="#64748b" fontSize="9" fontFamily="monospace">
                  Draft: 14.5m
                </text>

                {/* Moving Vessel Icon with pulse along path */}
                <g>
                  <animateMotion
                    path="M 440 210 Q 300 215, 260 170 T 120 85"
                    dur="9s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  {/* Vessel icon */}
                  <rect x="-10" y="-4" width="20" height="8" rx="2" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                  <polygon points="10,-4 15,0 10,4" fill="#ffffff" />
                  <circle cx="0" cy="0" r="14" fill="#00f0ff" opacity="0.25">
                    <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              </svg>

              {/* Inset live voyage telemetry tag */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-[#070e1c]/85 border border-slate-800/80 px-3 py-1.5 rounded-lg text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300">Vessel: PANAMAX (76k DWT)</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">Speed: 13.8 kts</span>
                </div>
                <div className="text-emerald-400">ETA: Day +14.6</div>
              </div>
            </div>

            {/* Micro route checkpoints */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
              <div className="bg-[#0b1424] p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">ORIGIN</span>
                <span className="text-xs font-semibold text-slate-200">Australia Coal Terminals</span>
              </div>
              <div className="bg-[#0b1424] p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">SEA PASSAGE</span>
                <span className="text-xs font-semibold text-cyan-300">Indian Ocean Corridor</span>
              </div>
              <div className="bg-[#0b1424] p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">DISCHARGE</span>
                <span className="text-xs font-semibold text-emerald-300">East Coast Steel Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capability Cards: 3 Concise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-800 bg-[#091020]/80 p-5 hover:border-cyan-500/40 hover:bg-[#0c162c] transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Freight Forecasting</h3>
              <p className="text-xs text-slate-400">7, 14 & 30-Day Horizons</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Time-series predictive modeling anchored on Baltic indices, bunker trends, commodity demand, and seasonal cyclonic risks with confidence intervals.
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-slate-800 bg-[#091020]/80 p-5 hover:border-cyan-500/40 hover:bg-[#0c162c] transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 group-hover:scale-105 transition-transform">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Vessel Intelligence</h3>
              <p className="text-xs text-slate-400">Handysize to Capesize</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dynamic suitability matching based on parcel tonnage, bunker fuel consumption, deadfreight penalties, and multi-voyage economies of scale.
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-800 bg-[#091020]/80 p-5 hover:border-cyan-500/40 hover:bg-[#0c162c] transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Risk & Port Analytics</h3>
              <p className="text-xs text-slate-400">Draft, Queues & Demurrage</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real-time physical constraint checks for LOA, beam, and neap-tide draft limits across East Coast ports to prevent costly anchorage idle-time.
          </p>
        </div>
      </div>
    </div>
  );
};
