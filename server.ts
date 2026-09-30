import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Failed to initialize Gemini client:", e);
    }
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "FreightIQ Intelligence Engine",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // API: AI Copilot
  app.post("/api/copilot", async (req, res) => {
    try {
      const { question, voyageContext } = req.body;
      const ai = getGemini();

      if (ai) {
        const prompt = `You are FreightIQ Copilot, an elite maritime freight chartering expert and logistics decision-support assistant for bulk cargo procurement to the East Coast of India (Ministry of Steel domain).
Current Voyage Context:
${JSON.stringify(voyageContext, null, 2)}

User Question: "${question}"

Provide a concise, direct, professional, explainable maritime chartering assessment (maximum 3-4 sentences or tight bullet points). Focus on Baltic index trends, vessel deadweight, draft constraints, port congestion, demurrage mitigation, or chartering contract flexibility. Do not use generic filler.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const text = response.text;
        if (text) {
          return res.json({ answer: text, source: "gemini-2.5-flash" });
        }
      }

      // Fallback deterministic response handled gracefully
      return res.json({
        answer: generateDeterministicCopilotResponse(question, voyageContext),
        source: "deterministic-maritime-engine",
      });
    } catch (error: any) {
      console.error("Copilot error:", error);
      return res.json({
        answer: generateDeterministicCopilotResponse(req.body?.question || "", req.body?.voyageContext || {}),
        source: "deterministic-maritime-engine-fallback",
      });
    }
  });

  // API: Generate Voyage Brief
  app.post("/api/generate-brief", async (req, res) => {
    try {
      const { voyageContext } = req.body;
      const ai = getGemini();

      if (ai) {
        const prompt = `You are the Chief Chartering Strategist for FreightIQ (Ministry of Steel bulk logistics).
Draft a concise, executive-ready "FreightIQ Voyage Chartering Brief" based on this active scenario:
${JSON.stringify(voyageContext, null, 2)}

Structure your response into:
1. Executive Summary & Market Timing (1-2 sentences)
2. Vessel & Berth Allocation Analysis
3. Demurrage & Congestion Mitigation
4. Recommended Procurement & Contract Action (Spot vs CoA/Medium-Term)
Keep it sharp, professional, and practical for immediate tender/chartering approval.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        if (response.text) {
          return res.json({ brief: response.text, source: "gemini-2.5-flash" });
        }
      }

      return res.json({
        brief: generateDeterministicVoyageBrief(voyageContext),
        source: "deterministic-maritime-engine",
      });
    } catch (error: any) {
      console.error("Brief generation error:", error);
      return res.json({
        brief: generateDeterministicVoyageBrief(req.body?.voyageContext || {}),
        source: "deterministic-maritime-engine-fallback",
      });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FreightIQ intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

function generateDeterministicCopilotResponse(question: string, ctx: any): string {
  const q = question.toLowerCase();
  const vessel = ctx.recommendedVessel || "Panamax";
  const port = ctx.destinationPort || "Paradip";
  const cargo = ctx.cargoType || "Coking Coal";
  const qty = ctx.cargoQty || 60000;
  const origin = ctx.origin || "Australia";

  if (q.includes("panamax") || q.includes("why was") || q.includes("vessel")) {
    return `${vessel} is recommended because your cargo parcel of ${qty.toLocaleString()} MT aligns with the optimal deadweight tonnage utilization (86%) on the ${origin} → ${port} sea lane, while staying strictly within ${port}'s maximum allowable permissible draft of 14.5m. Capesize would incur draft de-ballasting penalties or require offshore lightering at Sandheads.`;
  }
  if (q.includes("15%") || q.includes("freight increases") || q.includes("rate change") || q.includes("increase")) {
    return `A +15% freight surge on the ${origin} to ${port} route would expand spot voyage charter expenditure by ~$3.20/MT (est. $192,000 extra on a ${qty.toLocaleString()} MT shipment). We advise shifting to a 90-day Medium-Term multiple-voyage contract (CoA) with bunker escalation clauses to lock in current base rates.`;
  }
  if (q.includes("yellow") || q.includes("port compatibility") || q.includes("warning") || q.includes("draft")) {
    return `The yellow warning at ${port} is triggered by tidal draft variability. During neap tides, maximum permissible draft drops to 14.1m, leaving only a 0.6m safety under-keel clearance (UKC) for fully laden ${vessel} vessels. Pre-arrival draft trimming is recommended.`;
  }
  if (q.includes("risk") || q.includes("factor")) {
    return `The primary risk contributor currently is Port Congestion & Monsoon Sea State (index 68/100) at ${port} with 3.8 days pre-berthing wait, combined with Pacific bunker fuel price volatility. Idle-time demurrage risk is assessed at $18,500/day.`;
  }
  if (q.includes("compare") || q.includes("spot vs") || q.includes("strategy") || q.includes("contract")) {
    return `Spot charters offer flexibility if your steel plant's stocking yard is near capacity, but carry 100% Baltic spot rate volatility exposure. A Medium-Term Contract of Affreightment (CoA) guarantees 3 consecutive voyages, dampening market exposure by 42% and trimming overall procurement cost variance.`;
  }

  return `Based on current Baltic Capesize/Panamax indices and East Coast India queue analytics for ${cargo} (${qty.toLocaleString()} MT from ${origin} to ${port}): Market conditions favour structured 60-day multiple-voyage chartering with proactive pre-berthing laytime scheduling.`;
}

function generateDeterministicVoyageBrief(ctx: any): string {
  const vessel = ctx.recommendedVessel || "Panamax";
  const port = ctx.destinationPort || "Paradip";
  const cargo = ctx.cargoType || "Coking Coal";
  const qty = ctx.cargoQty || 60000;
  const origin = ctx.origin || "Australia";
  const rate = ctx.currentRate || 22.4;
  const forecastRate = ctx.forecastRate || 24.1;

  return `### EXECUTIVE CHARTERING BRIEF — BULK CARGO PROCUREMENT
**Route**: ${origin} → ${port} (East Coast India)
**Cargo**: ${cargo} (${qty.toLocaleString()} MT bulk) | **Recommended Class**: ${vessel}
**Current Spot**: $${rate.toFixed(2)}/MT | **30-Day Forecast**: $${forecastRate.toFixed(2)}/MT (+${(((forecastRate - rate) / rate) * 100).toFixed(1)}%)

1. **Market Direction & Timing**: Upward pressure anticipated due to seasonal Pacific cyclonic disruptions and tightening tonnage supply around Singapore straits. Prompt charter fixing is strongly indicated within the next 5-7 business days.
2. **Vessel Allocation**: ${vessel} provides ideal 88% capacity utilization without triggering high-draft penalties at ${port} iron/coal berths.
3. **Port & Congestion Strategy**: Current anchorage wait is 3.4 days. Implement virtual arrival speed optimization (slow steaming 11.5 knots vs 13.5 knots) to save 14% bunker consumption and coincide arrival directly with berth clearance.
4. **Contract Recommendation**: Execute a 3-Voyage Medium-Term Contract of Affreightment (CoA) with collar ceiling caps at $${(forecastRate * 1.05).toFixed(2)}/MT.`;
}

startServer();
