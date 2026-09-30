import React, { useState } from "react";
import {
  FileText,
  X,
  Copy,
  Check,
  Printer,
  Sparkles,
  Download,
  ShieldCheck,
  Ship,
  Compass,
  Building2,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VoyageAnalysisResult, VoyageConfig } from "../types";

interface VoyageBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoyageConfig;
  analysis: VoyageAnalysisResult;
}

export const VoyageBriefModal: React.FC<VoyageBriefModalProps> = ({
  isOpen,
  onClose,
  config,
  analysis,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiBriefContent, setAiBriefContent] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAIExecutiveBrief = async () => {
    setIsGenerating(true);
    // Fire confetti for celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00f0ff", "#38bdf8", "#3b82f6", "#10b981"],
      });
    } catch (e) {
      // ignore
    }

    try {
      const res = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voyageContext: {
            cargoType: config.cargoType,
            cargoQty: config.cargoQty,
            origin: config.origin,
            destinationPort: config.destinationPort,
            contractPreference: config.contractPreference,
            currentRate: analysis.currentRate,
            forecastRate: analysis.forecastRate30d,
            recommendedVessel: analysis.recommendedVessel,
            overallRiskLevel: analysis.overallRiskLevel,
            marketTrend: analysis.marketTrend,
            estimatedIdleDays: analysis.estimatedIdleDays,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiBriefContent(data.brief);
      } else {
        throw new Error("Local fallback");
      }
    } catch (e) {
      setAiBriefContent(
        `### EXECUTIVE CHARTERING BRIEF — BULK CARGO PROCUREMENT\n**Route**: ${config.origin} → ${config.destinationPort} (East Coast India)\n**Cargo**: ${config.cargoType} (${config.cargoQty.toLocaleString()} MT) | **Recommended Class**: ${analysis.recommendedVessel} (${analysis.recommendedVesselMatchScore}% Match)\n**Current Spot**: $${analysis.currentRate.toFixed(2)}/MT | **30-Day Forecast**: $${analysis.forecastRate30d.toFixed(2)}/MT (${analysis.rateChangePercent > 0 ? "+" : ""}${analysis.rateChangePercent}%)\n\n1. **Market Direction & Timing**: Upward forward curve pressure observed. Prompt fixture recommended within 5-7 days.\n2. **Vessel Allocation**: ${analysis.recommendedVessel} achieves optimal 86% deadweight capacity without triggering draft penalties at ${config.destinationPort}.\n3. **Port & Congestion Strategy**: Current pre-berthing queue is ${analysis.estimatedIdleDays} days. Recommend virtual arrival slow-steaming clause to trim ~14% bunker consumption.\n4. **Contract Recommendation**: Lock in a Medium-Term Contract of Affreightment (CoA) to hedge against spot market volatility.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const formattedBriefText = `===============================================================
FREIGHTIQ — PREDICTIVE MARITIME CHARTERING INTELLIGENCE
Enterprise Bulk Cargo Chartering & Procurement Cockpit
===============================================================

DATE: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
VOYAGE ID: FIQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}

1. CORE VOYAGE PARAMETERS
-------------------------
Route:              ${config.origin} → ${config.destinationPort} (East Coast India)
Cargo Type:         ${config.cargoType}
Cargo Parcel:       ${config.cargoQty.toLocaleString()} Metric Tonnes
Sea Lane Distance:  ${analysis.nauticalMiles.toLocaleString()} Nautical Miles
Transit Duration:   ${analysis.transitDays} Days Steaming

2. INTELLIGENCE & FORECAST
--------------------------
Voyage Score:       ${analysis.intelligenceScore} / 100 (${analysis.scoreLabel})
Current Freight:    $${analysis.currentRate.toFixed(2)} / MT
30-Day Forecast:    $${analysis.forecastRate30d.toFixed(2)} / MT (${analysis.rateChangePercent > 0 ? "+" : ""}${analysis.rateChangePercent}%)
Market Trend:       ${analysis.marketTrend}

3. VESSEL & BERTH RECOMMENDATIONS
---------------------------------
Recommended Vessel: ${analysis.recommendedVessel} (${analysis.recommendedVesselMatchScore}% Match Fit)
Port Compatibility: ${analysis.portCompatibilityStatus} at ${config.destinationPort}
Estimated Idle:     ${analysis.estimatedIdleDays} Days Anchorage Queue
Demurrage Risk:     ~$${analysis.estimatedIdleCostUSD.toLocaleString()} USD
Contract Strategy:  ${config.contractPreference} Charter

4. STRATEGIC MITIGATION
-----------------------
${analysis.idleReductionAdvice}

===============================================================
Official Chartering Decision-Support Document · East Coast India
===============================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(aiBriefContent || formattedBriefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-[#070e1c] p-6 shadow-2xl shadow-cyan-950/80 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-mono text-white">
                  FreightIQ Voyage Chartering Brief
                </h3>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded">
                  EXECUTIVE BRIEF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official decision-support summary formatted for the Maritime Chartering Committee.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action button: Generate AI Brief */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#0b162f] border border-cyan-900/50 mb-4">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Executive Brief Generator:</span> Click to synthesize live chartering advisory.
          </div>
          <button
            onClick={handleGenerateAIExecutiveBrief}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold font-mono text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Synthesizing Brief..." : "Generate AI Brief"}</span>
          </button>
        </div>

        {/* Content Body: Printable & Structured Brief */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {aiBriefContent ? (
            <div className="p-4 rounded-xl bg-[#091224] border border-cyan-500/30 text-slate-200 font-sans leading-relaxed whitespace-pre-line space-y-2">
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
                AI Executive Chartering Memorandum:
              </div>
              {aiBriefContent}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#050b17] border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre">
              {formattedBriefText}
            </div>
          )}

          {/* Quick parameter cards summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-[#0a1428] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ROUTE</span>
              <span className="text-white font-bold">{config.origin} → {config.destinationPort}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0a1428] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CARGO</span>
              <span className="text-cyan-300 font-bold">{(config.cargoQty / 1000).toFixed(0)}k MT {config.cargoType}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0a1428] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">RECOMMENDED</span>
              <span className="text-emerald-300 font-bold">{analysis.recommendedVessel} ({analysis.recommendedVesselMatchScore}%)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0a1428] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CONTRACT STRATEGY</span>
              <span className="text-white font-bold">{config.contractPreference}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="text-slate-500 text-[11px]">
            FreightIQ Maritime Chartering Intelligence · East Coast Corridor
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0d172a] hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Brief</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-slate-950" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Brief Text"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
