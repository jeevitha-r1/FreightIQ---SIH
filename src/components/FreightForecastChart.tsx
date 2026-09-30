import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  HelpCircle,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import { ForecastExplanationFactor, ForecastPoint, VoyageConfig } from "../types";

interface FreightForecastChartProps {
  data: ForecastPoint[];
  currentRate: number;
  forecastRate: number;
  rateChangePercent: number;
  marketTrend: string;
  factors: ForecastExplanationFactor[];
  config: VoyageConfig;
  onOpenWhy: (title: string, content: React.ReactNode) => void;
}

export const FreightForecastChart: React.FC<FreightForecastChartProps> = ({
  data,
  currentRate,
  forecastRate,
  rateChangePercent,
  marketTrend,
  factors,
  config,
  onOpenWhy,
}) => {
  const [selectedFactor, setSelectedFactor] = useState<ForecastExplanationFactor | null>(null);

  const isUp = rateChangePercent > 0;

  // Chart data formatting
  const chartData = data.map((d) => ({
    ...d,
    historicalRate: !d.isForecast ? d.rate : null,
    forecastRate: d.isForecast ? d.rate : null,
    // Connect historical to forecast at "Today"
    connectedForecast: d.dayLabel === "Today" ? d.rate : d.isForecast ? d.rate : null,
    confidenceRange: d.isForecast && d.confidenceUpper && d.confidenceLower
      ? [d.confidenceLower, d.confidenceUpper]
      : null,
  }));

  const handleWhyForecast = () => {
    onOpenWhy(
      "Why is the freight forecast projecting this trajectory?",
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          FreightIQ’s predictive engine models forward curve trajectory for{" "}
          <span className="text-cyan-300 font-semibold">{config.origin} → {config.destinationPort}</span> bulk routes using 5 core market drivers:
        </p>
        <ul className="space-y-2.5">
          {factors.map((f, i) => (
            <li key={i} className="p-3 rounded-lg bg-[#0d172a] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{f.name}</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    f.impact === "bullish"
                      ? "bg-amber-950 text-amber-300 border border-amber-600/40"
                      : f.impact === "bearish"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-600/40"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {f.impact.toUpperCase()} ({f.percentageScore > 0 ? "+" : ""}{f.percentageScore}%)
                </span>
              </div>
              <p className="text-xs text-slate-400">{f.description}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
          Confidence score is computed at 88.4% based on 180-day historical Baltic dry backtesting.
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#081020]/90 backdrop-blur-md p-5 lg:p-6 shadow-xl shadow-black/40 space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              Intelligent Freight Forecast Engine
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              TIME-SERIES ML
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical 30-day Baltic spot benchmark vs 7, 14 & 30-day AI confidence forecast.
          </p>
        </div>

        {/* Top summary pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0e192f] border border-slate-700/80 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] font-mono text-slate-400 block">Current Spot</span>
            <span className="text-sm font-bold font-mono text-white">
              ${currentRate.toFixed(2)}/MT
            </span>
          </div>

          <div className="bg-[#0e192f] border border-cyan-700/60 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] font-mono text-cyan-400 block">30-Day Forecast</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-cyan-300">
                ${forecastRate.toFixed(2)}/MT
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isUp ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                ({isUp ? "+" : ""}{rateChangePercent}%)
              </span>
            </div>
          </div>

          <div className="bg-[#0e192f] border border-slate-700/80 px-3 py-1.5 rounded-lg text-right hidden md:block">
            <span className="text-[10px] font-mono text-slate-400 block">Model Confidence</span>
            <span className="text-sm font-bold font-mono text-emerald-400">88.4%</span>
          </div>

          <button
            onClick={handleWhyForecast}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>WHY?</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] sm:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#182742" vertical={false} />

            <XAxis
              dataKey="dayLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              tickFormatter={(v) => `$${v}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as ForecastPoint;
                return (
                  <div className="rounded-lg border border-cyan-800/80 bg-[#091224]/95 p-3 shadow-xl text-xs font-mono">
                    <div className="text-slate-400 mb-1">{point.dayLabel} ({point.date})</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Rate:</span>
                      <span className="text-cyan-300">${point.rate.toFixed(2)} / MT</span>
                    </div>
                    {point.isForecast && point.confidenceLower && point.confidenceUpper && (
                      <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1">
                        Confidence Band: ${point.confidenceLower.toFixed(2)} – ${point.confidenceUpper.toFixed(2)}
                      </div>
                    )}
                    <div className="mt-1 text-[10px] text-slate-500">
                      {point.isForecast ? "AI Forecast Model" : "Baltic Historic Index"}
                    </div>
                  </div>
                );
              }}
            />

            {/* Reference Line at Today */}
            <ReferenceLine
              x="Today"
              stroke="#00f0ff"
              strokeDasharray="4 4"
              label={{
                value: "TODAY (Charter Tender Window)",
                position: "top",
                fill: "#38bdf8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            />

            {/* Historical Solid Line */}
            <Line
              type="monotone"
              dataKey="historicalRate"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#38bdf8" }}
              activeDot={{ r: 5, fill: "#ffffff" }}
              name="Historical Spot ($/MT)"
            />

            {/* Forecast Dashed Line with Area Glow */}
            <Area
              type="monotone"
              dataKey="connectedForecast"
              fill="url(#forecastAreaGradient)"
              stroke="none"
            />

            <Line
              type="monotone"
              dataKey="connectedForecast"
              stroke="#00f0ff"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#00f0ff", stroke: "#000", strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: "#ffffff" }}
              name="Projected Forecast ($/MT)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Period Separator */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 bg-sky-400 rounded-sm" />
            <span className="text-slate-200">Historical Baltic Index (T-28 to T-0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 border-t-2 border-dashed border-cyan-400" />
            <span className="text-cyan-300">Forward AI Projection (+7d to +30d)</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Source: Baltic Exchange synthetic feed & AIS queue models
        </div>
      </div>

      {/* Explain Forecast Section: Contributing Factors */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Explain Forecast: Key Predictive Drivers</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            Click factors for simulation context
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {factors.map((factor, idx) => {
            const isBullish = factor.impact === "bullish";
            const isBearish = factor.impact === "bearish";
            return (
              <div
                key={idx}
                onClick={() => setSelectedFactor(factor)}
                className="cursor-pointer rounded-xl border border-slate-800 bg-[#091326] p-3 hover:border-cyan-500/40 hover:bg-[#0c1a33] transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold truncate max-w-[120px]">
                    {factor.name}
                  </span>
                  {isBullish ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  ) : isBearish ? (
                    <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isBullish ? "text-amber-400" : isBearish ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {factor.percentageScore > 0 ? "+" : ""}
                    {factor.percentageScore}% Impact
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{factor.weight} Weight</span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 group-hover:text-slate-300 transition-colors">
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
