import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  HelpCircle,
  Ship,
  Compass,
  Zap,
} from "lucide-react";
import { CopilotMessage, VoyageAnalysisResult, VoyageConfig } from "../types";

interface FreightIQCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoyageConfig;
  analysis: VoyageAnalysisResult;
}

const QUICK_QUESTIONS = [
  "Why was Panamax recommended?",
  "What happens if freight increases by 15%?",
  "Why is the port compatibility warning yellow?",
  "Which factor is increasing my risk?",
  "Compare spot vs medium-term strategy.",
];

export const FreightIQCopilot: React.FC<FreightIQCopilotProps> = ({
  isOpen,
  onClose,
  config,
  analysis,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `Hello! I am FreightIQ Copilot, your maritime chartering intelligence advisor for bulk cargo procurement to the East Coast of India.\n\nCurrently tracking: ${config.origin} → ${config.destinationPort} (${(config.cargoQty / 1000).toFixed(0)}k MT ${config.cargoType}). Recommended vessel: ${analysis.recommendedVessel}. How can I assist your chartering decisions today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const voyageContext = {
      cargoType: config.cargoType,
      cargoQty: config.cargoQty,
      origin: config.origin,
      destinationPort: config.destinationPort,
      contractPreference: config.contractPreference,
      currentRate: analysis.currentRate,
      forecastRate: analysis.forecastRate30d,
      recommendedVessel: analysis.recommendedVessel,
      recommendedVesselMatchScore: analysis.recommendedVesselMatchScore,
      portCompatibilityStatus: analysis.portCompatibilityStatus,
      overallRiskLevel: analysis.overallRiskLevel,
      estimatedIdleDays: analysis.estimatedIdleDays,
      estimatedIdleCostUSD: analysis.estimatedIdleCostUSD,
      marketTrend: analysis.marketTrend,
    };

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, voyageContext }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: "assistant",
            text: data.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            source: data.source,
          },
        ]);
      } else {
        throw new Error("API route unavailable");
      }
    } catch (e) {
      // Deterministic fallback if server fails
      const fallbackAnswer = getClientFallbackAnswer(questionText, voyageContext);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: fallbackAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "client-maritime-engine",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] rounded-2xl border border-cyan-500/40 bg-[#070e1c]/95 backdrop-blur-xl shadow-2xl shadow-cyan-950/60 flex flex-col transition-all duration-300 ${
        isMinimized ? "h-14" : "h-[580px] max-h-[85vh]"
      }`}
    >
      {/* Copilot Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-[#0a1428]/80 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Sparkles className="h-4 w-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                FreightIQ Copilot
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Chartering Decision Advisor · {config.destinationPort}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-sans">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-7 w-7 rounded-lg items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-cyan-950 border border-cyan-500/40 text-cyan-300"
                    }`}
                  >
                    {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-xl p-3 leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white font-medium"
                        : "bg-[#0c162b] border border-slate-800 text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-line text-[11px]">{m.text}</p>
                    <div className="flex items-center justify-between gap-2 mt-1.5 text-[9px] text-slate-400 font-mono">
                      <span>{m.timestamp}</span>
                      {m.source && (
                        <span className="text-cyan-400/70">{m.source}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0c162b] border border-slate-800 text-xs text-cyan-300 font-mono">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Analyzing Baltic curves & port berth constraints...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-slate-800/80 bg-[#081122]">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">
              Recommended Inquiries:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-[10px] whitespace-nowrap px-2 py-1 rounded-md bg-[#0f1d38] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 transition-all font-mono"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-slate-800 bg-[#0a1428] rounded-b-2xl flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FreightIQ Copilot about this voyage..."
              className="flex-1 bg-[#070e1c] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

function getClientFallbackAnswer(question: string, ctx: any): string {
  const q = question.toLowerCase();
  const vessel = ctx.recommendedVessel || "Panamax";
  const port = ctx.destinationPort || "Paradip";
  const qty = ctx.cargoQty || 60000;
  const origin = ctx.origin || "Australia";

  if (q.includes("panamax") || q.includes("why was") || q.includes("vessel")) {
    return `${vessel} is recommended because your cargo parcel of ${qty.toLocaleString()} MT achieves 86% deadweight capacity utilization on the ${origin} → ${port} sea lane, satisfying ${port}'s draft ceiling of 14.5m without incurring lightering charges.`;
  }
  if (q.includes("15%") || q.includes("freight increases") || q.includes("rate change")) {
    return `A +15% freight surge raises voyage charter expenses by ~$3.20/MT (est. $192,000 extra on a ${qty.toLocaleString()} MT shipment). We advise fixing a 90-day Medium-Term multiple-voyage contract (CoA) with bunker escalation clauses to lock in current rates.`;
  }
  if (q.includes("yellow") || q.includes("port compatibility") || q.includes("warning") || q.includes("draft")) {
    return `The yellow warning at ${port} is due to tidal draft variation. During neap tides, maximum permissible draft tightens to 14.1m, leaving minimal safety under-keel clearance (UKC) for fully laden ${vessel} hulls. Pre-arrival draft trimming is advised.`;
  }
  if (q.includes("risk") || q.includes("factor")) {
    return `The primary risk contributor is Port Congestion & Monsoon Sea State at ${port} with ~3.4 days pre-berthing wait, combined with Pacific bunker fuel price volatility. Idle demurrage exposure is ~$${(ctx.estimatedIdleCostUSD || 65000).toLocaleString()}.`;
  }
  if (q.includes("compare") || q.includes("spot vs") || q.includes("strategy")) {
    return `Spot charters offer maximum scheduling flexibility but 100% Baltic spot price volatility. A Medium-Term Contract of Affreightment (CoA) guarantees 3-4 consecutive liftings, trimming market exposure by 42% and locking in volume discounts.`;
  }
  return `FreightIQ Analysis: Current market conditions for ${qty.toLocaleString()} MT ${ctx.cargoType} from ${origin} to ${port} indicate tightening tonnage in the Bay of Bengal. Recommend locking in ${ctx.contractPreference} fixtures within 7 business days.`;
}
