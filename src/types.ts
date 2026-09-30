export type CargoType = "Coking Coal" | "Thermal Coal" | "Iron Ore Fines" | "Iron Ore Pellets" | "Limestone" | "Bauxite";

export type OriginCountry = "Australia" | "USA" | "Mozambique" | "Russia" | "Indonesia";

export type DestinationPort =
  | "Paradip"
  | "Visakhapatnam"
  | "Gangavaram"
  | "Gopalpur"
  | "Dhamra"
  | "Sagar-Sandheads"
  | "Haldia";

export type ContractType = "Spot" | "Short-Term" | "Medium-Term" | "Multiple Voyage";

export type AnalysisHorizon = 7 | 14 | 30 | 60;

export type VesselClass = "Handysize" | "Supramax" | "Panamax" | "Capesize";

export interface VoyageConfig {
  cargoType: CargoType;
  cargoQty: number; // in metric tonnes
  origin: OriginCountry;
  destinationPort: DestinationPort;
  contractPreference: ContractType;
  analysisHorizon: AnalysisHorizon;
  // What-if overrides:
  freightShiftPercent: number; // e.g. -20 to +20%
  congestionLevel: "Low" | "Medium" | "High";
  demandLevel: "Low" | "Medium" | "High";
}

export interface PortSpec {
  name: DestinationPort;
  state: string;
  maxLOA: number; // meters
  maxBeam: number; // meters
  maxDraft: number; // meters
  dischargeRatePerDay: number; // MT / day
  currentWaitingDays: number;
  tidalRestricted: boolean;
  notes: string;
}

export interface OriginPortSpec {
  name: string;
  country: OriginCountry;
  seaLaneDistanceNM: Record<DestinationPort, number>; // nautical miles
  typicalLoadingRate: number; // MT/day
  berthDraft: number;
}

export interface VesselSpec {
  class: VesselClass;
  dwtMin: number;
  dwtMax: number;
  loa: number; // meters typical
  beam: number; // meters typical
  draftFullyLaden: number; // meters
  dailyCharterEstimate: number; // USD / day
  bunkerConsumptionTonsPerDay: number;
  speedKnots: number;
}

export interface VesselSuitability {
  vesselClass: VesselClass;
  suitabilityScore: number; // 0 - 100
  cargoCompatibility: "Optimal" | "Sub-optimal" | "Excess Capacity" | "Insufficient";
  portCompatibility: "Fully Compatible" | "Draft Restricted" | "LOA Warning" | "Incompatible";
  estimatedIdleRisk: "Low" | "Moderate" | "Elevated" | "High";
  isRecommended: boolean;
  recommendationReason: string;
  utilizationPercent: number;
}

export interface CompatibilityCheck {
  metric: "LOA" | "Beam" | "Draft" | "Discharge Capacity";
  vesselValue: string;
  portLimit: string;
  status: "pass" | "warn" | "fail";
  details: string;
}

export interface ForecastPoint {
  date: string;
  dayLabel: string;
  rate: number;
  isForecast: boolean;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface ForecastExplanationFactor {
  name: string;
  impact: "bullish" | "bearish" | "neutral";
  percentageScore: number; // -100 to +100
  description: string;
  weight: "High" | "Medium" | "Low";
}

export interface RiskIndicator {
  name: string;
  level: "Low" | "Moderate" | "High";
  score: number; // 0 - 100
  driver: string;
  mitigation: string;
}

export interface VoyageTimelinePhase {
  name: "Loading" | "Sea Transit" | "Port Waiting" | "Discharge";
  durationDays: number;
  percentage: number;
  status: "normal" | "risk" | "idle";
  details: string;
}

export interface ContractStrategyOption {
  type: ContractType;
  title: string;
  baseRatePerTon: number;
  totalCostUSD: number;
  marketExposure: "High" | "Moderate" | "Low";
  flexibility: "Maximum" | "Moderate" | "Strict";
  expectedCostStability: "Low" | "Good" | "High";
  voyageCoverage: string;
  planningRisk: "High" | "Medium" | "Low";
  pros: string[];
  cons: string[];
  isRecommendedForScenario: boolean;
}

export interface VoyageAnalysisResult {
  intelligenceScore: number; // 0 - 100
  scoreLabel: string;
  scoreExplanation: string;
  currentRate: number; // USD / ton
  forecastRate30d: number;
  rateChangePercent: number;
  marketTrend: "Bullish (Rising)" | "Bearish (Softening)" | "Volatile" | "Consolidating";
  recommendedVessel: VesselClass;
  recommendedVesselMatchScore: number;
  overallRiskLevel: "Low" | "Moderate" | "High";
  transitDays: number;
  nauticalMiles: number;
  estimatedIdleDays: number;
  estimatedIdleCostUSD: number;
  utilizationPercent: number;
  portCompatibilityStatus: "Fully Compatible" | "Draft Caution" | "Restricted";
  forecastData: ForecastPoint[];
  forecastFactors: ForecastExplanationFactor[];
  vesselComparisons: VesselSuitability[];
  compatibilityChecks: CompatibilityCheck[];
  riskIndicators: RiskIndicator[];
  activeAlerts: string[];
  timelinePhases: VoyageTimelinePhase[];
  idleReductionAdvice: string;
  contractOptions: ContractStrategyOption[];
}

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  config: VoyageConfig;
  highlightText: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: string;
}
