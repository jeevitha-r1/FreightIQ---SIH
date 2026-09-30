import React, { useState, useMemo, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavSection } from "./components/Sidebar";
import { HeroLanding } from "./components/HeroLanding";
import { VoyageScoreCard } from "./components/VoyageScoreCard";
import { VoyageConfigPanel } from "./components/VoyageConfigPanel";
import { FreightForecastChart } from "./components/FreightForecastChart";
import { VesselMatchMatrix } from "./components/VesselMatchMatrix";
import { PortCompatibilityMatrix } from "./components/PortCompatibilityMatrix";
import { RiskRadarCenter } from "./components/RiskRadarCenter";
import { IdleTimePredictor } from "./components/IdleTimePredictor";
import { ContractStrategySimulator } from "./components/ContractStrategySimulator";
import { VoyageScenarioLab } from "./components/VoyageScenarioLab";
import { VoyageIntelligencePage } from "./components/VoyageIntelligencePage";
import { ContractSimulationPage } from "./components/ContractSimulationPage";
import { FreightIQCopilot } from "./components/FreightIQCopilot";
import { WhyModal } from "./components/WhyModal";
import { VoyageBriefModal } from "./components/VoyageBriefModal";
import { DEMO_SCENARIOS } from "./data/maritimeData";
import { simulateVoyageIntelligence } from "./data/simulationEngine";
import { DemoScenario, VoyageConfig } from "./types";
import {
  Sparkles,
  FileText,
  HelpCircle,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Ship,
  TrendingUp,
  Compass,
  Building2,
  LayoutDashboard,
} from "lucide-react";

export type ActivePageMode =
  | "dashboard"
  | "voyage-intelligence"
  | "contract-simulation";

export default function App() {
  // Active demo scenario (defaults to Scenario A: Australian Coking Coal to Paradip)
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);

  // Live voyage parameters
  const [config, setConfig] = useState<VoyageConfig>({
    ...DEMO_SCENARIOS[0].config,
  });

  // Page view mode: full dashboard vs dedicated Voyage Intelligence vs dedicated Contract Simulator
  const [activePage, setActivePage] = useState<ActivePageMode>("dashboard");

  // Navigation section
  const [activeSection, setActiveSection] = useState<NavSection>("overview");

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Copilot floating state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Voyage Brief Modal
  const [isBriefOpen, setIsBriefOpen] = useState(false);

  // Explainability "WHY?" modal state
  const [whyState, setWhyState] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: "",
    content: null,
  });

  // Compute live analysis whenever config changes
  const analysis = useMemo(() => {
    return simulateVoyageIntelligence(config);
  }, [config]);

  // Scenario switch handler
  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setConfig({ ...scenario.config });
  };

  const handleUpdateConfig = (updated: Partial<VoyageConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleOpenWhy = (title: string, content: React.ReactNode) => {
    setWhyState({
      isOpen: true,
      title,
      content,
    });
  };

  const handleCloseWhy = () => {
    setWhyState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleNavigateToVoyageIntelligence = () => {
    setActivePage("voyage-intelligence");
    setActiveSection("analysis");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToContractSim = () => {
    setActivePage("contract-simulation");
    setActiveSection("contracts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReturnToDashboard = (targetSection?: NavSection) => {
    setActivePage("dashboard");
    if (targetSection) {
      setActiveSection(targetSection);
      setTimeout(() => {
        const element = document.getElementById(`section-${targetSection}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToSection = (section: NavSection) => {
    setActiveSection(section);
    if (section === "copilot") {
      setIsCopilotOpen(true);
      return;
    }
    if (activePage !== "dashboard") {
      setActivePage("dashboard");
      setTimeout(() => {
        const element = document.getElementById(`section-${section}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 90);
      return;
    }
    const element = document.getElementById(`section-${section}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Global Navigation Bar */}
      <Navbar
        currentScenario={selectedScenario}
        onSelectScenario={handleSelectScenario}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenBrief={() => setIsBriefOpen(true)}
        isMobileMenuOpen={isMobileSidebarOpen}
        setIsMobileMenuOpen={setIsMobileSidebarOpen}
        onReset={() => {
          setConfig({ ...selectedScenario.config });
          setActivePage("dashboard");
        }}
      />

      {/* Main Layout: Sidebar + Cockpit Content Area */}
      <div className="flex-1 flex pt-[61px]">
        {/* Navigation Sidebar */}
        <Sidebar
          currentSection={activeSection}
          onSelectSection={scrollToSection}
          currentScenario={selectedScenario}
          analysis={analysis}
          onGenerateBrief={() => setIsBriefOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Primary Cockpit Stage */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto w-full space-y-8">
          {/* Interactive Workspace Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#081121]/90 border border-slate-800/90 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleReturnToDashboard()}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activePage === "dashboard"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-[#0d1930]"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Full Cockpit Dashboard</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateToVoyageIntelligence}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activePage === "voyage-intelligence"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-[#0d1930]"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Voyage Intelligence Hub</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateToContractSim}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activePage === "contract-simulation"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-[#0d1930]"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Contract Strategy Simulator</span>
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-2 px-3 text-[11px] font-mono text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Active Route: {config.origin} → {config.destinationPort}
              </span>
              <span>·</span>
              <span className="text-cyan-300">
                {config.cargoQty.toLocaleString()} MT {config.cargoType}
              </span>
            </div>
          </div>

          {activePage === "voyage-intelligence" ? (
            <VoyageIntelligencePage
              config={config}
              analysis={analysis}
              currentScenario={selectedScenario}
              onUpdateConfig={handleUpdateConfig}
              onSelectScenario={handleSelectScenario}
              onBackToDashboard={() => handleReturnToDashboard()}
              onNavigateToContracts={handleNavigateToContractSim}
              onOpenWhy={handleOpenWhy}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onOpenBrief={() => setIsBriefOpen(true)}
            />
          ) : activePage === "contract-simulation" ? (
            <ContractSimulationPage
              config={config}
              analysis={analysis}
              onUpdateConfig={handleUpdateConfig}
              onBackToDashboard={() => handleReturnToDashboard()}
              onBackToVoyageIntelligence={handleNavigateToVoyageIntelligence}
              onOpenWhy={handleOpenWhy}
              onOpenBrief={() => setIsBriefOpen(true)}
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          ) : (
            <>
              {/* Hero Landing Banner */}
              <HeroLanding
                currentScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
                onLaunchCockpit={() => scrollToSection("analysis")}
                onExploreDemo={handleNavigateToVoyageIntelligence}
              />

              {/* Top-Level Decision Scorecard */}
              <div id="section-overview">
                <VoyageScoreCard
                  analysis={analysis}
                  config={config}
                  onOpenWhy={handleOpenWhy}
                  onOpenCopilot={() => setIsCopilotOpen(true)}
                />
              </div>

              {/* Section 1: Voyage Intelligence Configuration */}
              <div id="section-analysis">
                <VoyageConfigPanel
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                  onRunSimulation={handleNavigateToVoyageIntelligence}
                  currentScenario={selectedScenario}
                  onSelectScenario={handleSelectScenario}
                />
              </div>

              {/* Section 2: Freight Forecast Module */}
              <div id="section-forecast">
                <FreightForecastChart
                  data={analysis.forecastData}
                  currentRate={analysis.currentRate}
                  forecastRate={analysis.forecastRate30d}
                  rateChangePercent={analysis.rateChangePercent}
                  marketTrend={analysis.marketTrend}
                  factors={analysis.forecastFactors}
                  config={config}
                  onOpenWhy={handleOpenWhy}
                />
              </div>

              {/* Section 3: Vessel Match Engine */}
              <div id="section-vessel">
                <VesselMatchMatrix
                  vessels={analysis.vesselComparisons}
                  config={config}
                  onOpenWhy={handleOpenWhy}
                />
              </div>

              {/* Section 4: Port Compatibility Matrix */}
              <div id="section-port">
                <PortCompatibilityMatrix
                  checks={analysis.compatibilityChecks}
                  config={config}
                  recommendedVessel={analysis.recommendedVessel}
                  transitDays={analysis.transitDays}
                  nauticalMiles={analysis.nauticalMiles}
                  onOpenWhy={handleOpenWhy}
                />
              </div>

              {/* Section 5: Risk Radar Center */}
              <div id="section-risk">
                <RiskRadarCenter
                  riskIndicators={analysis.riskIndicators}
                  activeAlerts={analysis.activeAlerts}
                  overallRiskLevel={analysis.overallRiskLevel}
                  config={config}
                  onOpenWhy={handleOpenWhy}
                />
              </div>

              {/* Section 6: Vessel Utilization & Idle-Time Predictor */}
              <div id="section-idle">
                <IdleTimePredictor
                  timelinePhases={analysis.timelinePhases}
                  estimatedIdleDays={analysis.estimatedIdleDays}
                  estimatedIdleCostUSD={analysis.estimatedIdleCostUSD}
                  utilizationPercent={analysis.utilizationPercent}
                  idleReductionAdvice={analysis.idleReductionAdvice}
                  onOpenWhy={handleOpenWhy}
                />
              </div>

              {/* Section 7: Contract Strategy Simulator */}
              <div id="section-contracts">
                <ContractStrategySimulator
                  contractOptions={analysis.contractOptions}
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                  onRunSimulation={handleNavigateToContractSim}
                  onOpenWhy={handleOpenWhy}
                />
              </div>

              {/* Section 8: Voyage Scenario Lab (What-If Digital Twin) */}
              <div id="section-lab">
                <VoyageScenarioLab
                  currentConfig={config}
                  analysis={analysis}
                  onApplyScenario={(newCfg) => setConfig(newCfg)}
                  onOpenWhy={handleOpenWhy}
                />
              </div>
            </>
          )}

          {/* Bottom Call to Action: Executive Voyage Brief Card */}
          <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#071329] via-[#0b1b36] to-[#071329] p-6 lg:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>EXECUTIVE CHARTERING DELIVERABLE</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-white">
                Finalize Decision: Export Executive Voyage Brief
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Synthesize route intelligence, Baltic freight forecasts, vessel class optimization, port draft validation, and CoA contract savings into an official briefing document.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCopilotOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-cyan-300 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Ask AI Copilot</span>
              </button>

              <button
                onClick={() => setIsBriefOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-mono font-black shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <span>GENERATE VOYAGE BRIEF</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="pt-8 pb-12 border-t border-slate-800/80 text-center text-xs font-mono text-slate-500 space-y-2">
            <div>
              FreightIQ — Predictive Maritime Chartering Intelligence & Bulk Cargo Procurement
            </div>
            <div className="text-[11px] text-slate-600">
              Enterprise Dry Bulk Vessel Chartering & Maritime Route Intelligence · East Coast of India
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Action Button for FreightIQ AI Copilot */}
      {!isCopilotOpen && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-mono font-bold text-xs shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60 hover:scale-105 transition-all cursor-pointer group"
          title="Open FreightIQ AI Chartering Copilot"
        >
          <Sparkles className="h-4 w-4 fill-current group-hover:rotate-12 transition-transform" />
          <span>FreightIQ Copilot</span>
          <span className="h-2 w-2 rounded-full bg-emerald-950 border border-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Floating AI Copilot Drawer */}
      <FreightIQCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        config={config}
        analysis={analysis}
      />

      {/* Explainability "WHY?" Modal */}
      <WhyModal
        isOpen={whyState.isOpen}
        onClose={handleCloseWhy}
        title={whyState.title}
      >
        {whyState.content}
      </WhyModal>

      {/* Voyage Brief Modal */}
      <VoyageBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        config={config}
        analysis={analysis}
      />
    </div>
  );
}
