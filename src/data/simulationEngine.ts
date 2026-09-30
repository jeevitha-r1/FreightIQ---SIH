import {
  CompatibilityCheck,
  ContractStrategyOption,
  ForecastExplanationFactor,
  ForecastPoint,
  RiskIndicator,
  VesselClass,
  VesselSuitability,
  VoyageAnalysisResult,
  VoyageConfig,
  VoyageTimelinePhase,
} from "../types";
import {
  ORIGIN_DATABASE,
  PORT_DATABASE,
  VESSEL_DATABASE,
} from "./maritimeData";

export function runVoyageSimulation(config: VoyageConfig): VoyageAnalysisResult {
  const originSpec = ORIGIN_DATABASE[config.origin] || ORIGIN_DATABASE.Australia;
  const destPortSpec = PORT_DATABASE[config.destinationPort] || PORT_DATABASE.Paradip;

  const distanceNM = originSpec.seaLaneDistanceNM[config.destinationPort] || 4800;

  // Base Freight benchmark calculation
  // Typical Australia->East Coast India Panamax is ~$18-$26/MT
  // Indonesia->East Coast India is ~$10-$15/MT
  // USA->East Coast India is ~$38-$52/MT
  // Mozambique is ~$16-$22/MT
  // Russia is ~$22-$32/MT
  let baseBenchmarkRate = 21.5;
  if (config.origin === "Indonesia") baseBenchmarkRate = 12.8;
  else if (config.origin === "Australia") baseBenchmarkRate = 22.4;
  else if (config.origin === "USA") baseBenchmarkRate = 42.6;
  else if (config.origin === "Mozambique") baseBenchmarkRate = 18.9;
  else if (config.origin === "Russia") baseBenchmarkRate = 26.5;

  // Cargo adjustment
  if (config.cargoType === "Coking Coal") baseBenchmarkRate *= 1.05;
  else if (config.cargoType === "Iron Ore Pellets") baseBenchmarkRate *= 0.98;
  else if (config.cargoType === "Limestone") baseBenchmarkRate *= 0.92;

  // Congestion multiplier
  const congestionMultiplier =
    config.congestionLevel === "High" ? 1.08 : config.congestionLevel === "Low" ? 0.96 : 1.02;

  // Apply shift percent from what-if
  const shiftedCurrentRate = Number(
    (baseBenchmarkRate * congestionMultiplier * (1 + config.freightShiftPercent / 100)).toFixed(2)
  );

  // Determine trend direction
  let trendDirection = 1;
  if (config.demandLevel === "High" && config.congestionLevel !== "Low") {
    trendDirection = 1.07;
  } else if (config.demandLevel === "Low" && config.congestionLevel === "Low") {
    trendDirection = 0.94;
  } else {
    trendDirection = 1.03;
  }

  // 30d forecast
  const forecastRate30d = Number((shiftedCurrentRate * trendDirection).toFixed(2));
  const rateChangePercent = Number(
    (((forecastRate30d - shiftedCurrentRate) / shiftedCurrentRate) * 100).toFixed(1)
  );

  const marketTrend =
    rateChangePercent > 4
      ? "Bullish (Rising)"
      : rateChangePercent < -3
      ? "Bearish (Softening)"
      : Math.abs(config.freightShiftPercent) > 12
      ? "Volatile"
      : "Consolidating";

  // Generate historical (last 30 days) and forecast curve (next 30 days)
  const forecastData: ForecastPoint[] = [];
  const today = new Date();

  // 30 days historical
  for (let i = 28; i >= 0; i -= 4) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayLabel = i === 0 ? "Today" : `T-${i}d`;
    // Slight historical sine wave + noise
    const noise = Math.sin(i * 0.4) * 0.6 - (i / 28) * 0.8;
    const rate = Number((shiftedCurrentRate - noise).toFixed(2));
    forecastData.push({
      date: d.toISOString().split("T")[0],
      dayLabel,
      rate,
      isForecast: false,
    });
  }

  // 7d, 14d, 21d, 30d forecast
  const forecastIntervals = [7, 14, 21, 30];
  forecastIntervals.forEach((daysAhead) => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysAhead);
    const progress = daysAhead / 30;
    const projected = Number((shiftedCurrentRate + (forecastRate30d - shiftedCurrentRate) * progress).toFixed(2));
    const confidenceMargin = Number((0.8 + progress * 1.6).toFixed(2));
    forecastData.push({
      date: d.toISOString().split("T")[0],
      dayLabel: `+${daysAhead}d`,
      rate: projected,
      isForecast: true,
      confidenceLower: Number((projected - confidenceMargin).toFixed(2)),
      confidenceUpper: Number((projected + confidenceMargin).toFixed(2)),
    });
  });

  // Evaluate Vessel Match Engine
  const vesselClasses: VesselClass[] = ["Handysize", "Supramax", "Panamax", "Capesize"];
  const vesselComparisons: VesselSuitability[] = vesselClasses.map((vClass) => {
    const spec = VESSEL_DATABASE[vClass];
    let score = 50;
    let cargoCompat: VesselSuitability["cargoCompatibility"] = "Optimal";
    let portCompat: VesselSuitability["portCompatibility"] = "Fully Compatible";
    let idleRisk: VesselSuitability["estimatedIdleRisk"] = "Moderate";
    let reason = "";

    const parcelQty = config.cargoQty;

    // Cargo size fit
    const midDwt = (spec.dwtMin + spec.dwtMax) / 2;
    const utilRatio = parcelQty / midDwt;
    const utilPercent = Math.min(100, Math.round(utilRatio * 100));

    if (utilRatio > 1.25) {
      score -= 40;
      cargoCompat = "Insufficient";
      reason = `Parcel of ${parcelQty.toLocaleString()} MT exceeds nominal deadweight capacity of ${vClass}.`;
    } else if (utilRatio < 0.55) {
      score -= 30;
      cargoCompat = "Excess Capacity";
      reason = `Parcel of ${parcelQty.toLocaleString()} MT severely under-utilizes a ${vClass} vessel (${utilPercent}% load factor). High deadfreight penalty.`;
    } else if (utilRatio >= 0.75 && utilRatio <= 1.05) {
      score += 25;
      cargoCompat = "Optimal";
      reason = `Optimal parcel fit (${utilPercent}% cargo deadweight utilization) with balanced freight economics.`;
    } else {
      score += 10;
      cargoCompat = "Sub-optimal";
      reason = `Acceptable capacity utilization (${utilPercent}%), though minor deadfreight or splitting may be required.`;
    }

    // Port draft & physical compatibility
    if (spec.draftFullyLaden > destPortSpec.maxDraft) {
      const draftExcess = spec.draftFullyLaden - destPortSpec.maxDraft;
      if (draftExcess > 2.0) {
        score -= 50;
        portCompat = "Incompatible";
        idleRisk = "High";
        reason += ` Incompatible draft: fully laden draft (${spec.draftFullyLaden}m) exceeds ${destPortSpec.name} limit (${destPortSpec.maxDraft}m) by ${draftExcess.toFixed(1)}m. Mandatory offshore lightering.`;
      } else {
        score -= 22;
        portCompat = "Draft Restricted";
        idleRisk = "Elevated";
        reason += ` Draft caution: vessel draft (${spec.draftFullyLaden}m) approaches ${destPortSpec.name} limit (${destPortSpec.maxDraft}m). High tide berthing or partial de-ballasting required.`;
      }
    } else {
      score += 20;
      portCompat = "Fully Compatible";
      idleRisk = "Low";
      reason += ` Safe under-keel clearance (UKC) confirmed for ${destPortSpec.name} fairway and berths.`;
    }

    // Port LOA check
    if (spec.loa > destPortSpec.maxLOA) {
      score -= 25;
      portCompat = "LOA Warning";
      idleRisk = "High";
      reason += ` LOA (${spec.loa}m) exceeds berth length limits (${destPortSpec.maxLOA}m).`;
    }

    // Clamp score
    const suitabilityScore = Math.max(15, Math.min(98, score));

    return {
      vesselClass: vClass,
      suitabilityScore,
      cargoCompatibility: cargoCompat,
      portCompatibility: portCompat,
      estimatedIdleRisk: idleRisk,
      isRecommended: false,
      recommendationReason: reason,
      utilizationPercent: utilPercent,
    };
  });

  // Pick top vessel
  vesselComparisons.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  vesselComparisons[0].isRecommended = true;
  const recommendedVessel = vesselComparisons[0].vesselClass;
  const recommendedVesselMatchScore = vesselComparisons[0].suitabilityScore;
  const topSpec = VESSEL_DATABASE[recommendedVessel];

  // Port Compatibility Matrix checks
  const draftDiff = destPortSpec.maxDraft - topSpec.draftFullyLaden;
  const loaDiff = destPortSpec.maxLOA - topSpec.loa;
  const beamDiff = destPortSpec.maxBeam - topSpec.beam;

  const compatibilityChecks: CompatibilityCheck[] = [
    {
      metric: "LOA",
      vesselValue: `${topSpec.loa}m`,
      portLimit: `Max ${destPortSpec.maxLOA}m`,
      status: loaDiff >= 0 ? "pass" : "fail",
      details:
        loaDiff >= 0
          ? `Vessel length fits within ${destPortSpec.name} turning basin and berth pocket with +${loaDiff}m margin.`
          : `Vessel LOA exceeds berth pocket limit by ${Math.abs(loaDiff)}m. Requires specialized mooring permits.`,
    },
    {
      metric: "Beam",
      vesselValue: `${topSpec.beam}m`,
      portLimit: `Max ${destPortSpec.maxBeam}m`,
      status: beamDiff >= 0 ? "pass" : "fail",
      details:
        beamDiff >= 0
          ? `Beam is compatible with shoreside gantry crane outreach and channel widths.`
          : `Vessel beam exceeds crane boom outreach by ${Math.abs(beamDiff).toFixed(1)}m.`,
    },
    {
      metric: "Draft",
      vesselValue: `${topSpec.draftFullyLaden}m (Laden)`,
      portLimit: `${destPortSpec.maxDraft}m CD`,
      status: draftDiff >= 1.0 ? "pass" : draftDiff >= 0 ? "warn" : "fail",
      details:
        draftDiff >= 1.0
          ? `Adequate Under Keel Clearance (+${draftDiff.toFixed(1)}m) for all-weather berthing.`
          : draftDiff >= 0
          ? `Marginal Under Keel Clearance (+${draftDiff.toFixed(1)}m). Vulnerable during neap tide cycles. Trim aft ballast prior to pilot boarding.`
          : `Draft restriction: Laden vessel exceeds port depth by ${Math.abs(draftDiff).toFixed(1)}m. Lightering or tidal waiting mandatory.`,
    },
    {
      metric: "Discharge Capacity",
      vesselValue: `${(config.cargoQty / 1000).toFixed(0)}k MT parcel`,
      portLimit: `${destPortSpec.dischargeRatePerDay.toLocaleString()} MT/day`,
      status: "pass",
      details: `Mechanized unloaders at ${destPortSpec.name} yield an estimated ${(
        config.cargoQty / destPortSpec.dischargeRatePerDay
      ).toFixed(1)} days continuous discharge time.`,
    },
  ];

  let portCompatibilityStatus: VoyageAnalysisResult["portCompatibilityStatus"] = "Fully Compatible";
  if (compatibilityChecks.some((c) => c.status === "fail")) {
    portCompatibilityStatus = "Restricted";
  } else if (compatibilityChecks.some((c) => c.status === "warn")) {
    portCompatibilityStatus = "Draft Caution";
  }

  // Transit calculations
  const speedKnots = topSpec.speedKnots;
  const transitDays = Number((distanceNM / (speedKnots * 24)).toFixed(1));
  const loadingDays = Number((config.cargoQty / originSpec.typicalLoadingRate).toFixed(1));

  // Waiting days at destination
  let baseWaitingDays = destPortSpec.currentWaitingDays;
  if (config.congestionLevel === "High") baseWaitingDays *= 1.5;
  if (config.congestionLevel === "Low") baseWaitingDays *= 0.7;
  const waitingDays = Number(baseWaitingDays.toFixed(1));

  const dischargeDays = Number((config.cargoQty / destPortSpec.dischargeRatePerDay).toFixed(1));
  const totalVoyageDays = Number((loadingDays + transitDays + waitingDays + dischargeDays).toFixed(1));

  const estimatedIdleDays = waitingDays;
  const estimatedIdleCostUSD = Math.round(estimatedIdleDays * topSpec.dailyCharterEstimate);
  const utilizationPercent = Math.round(((transitDays + loadingDays + dischargeDays) / totalVoyageDays) * 100);

  const timelinePhases: VoyageTimelinePhase[] = [
    {
      name: "Loading",
      durationDays: loadingDays,
      percentage: Math.round((loadingDays / totalVoyageDays) * 100),
      status: "normal",
      details: `${originSpec.name} automated terminal (${originSpec.typicalLoadingRate.toLocaleString()} MT/day)`,
    },
    {
      name: "Sea Transit",
      durationDays: transitDays,
      percentage: Math.round((transitDays / totalVoyageDays) * 100),
      status: "normal",
      details: `${distanceNM.toLocaleString()} NM @ ${speedKnots} kts via deep-sea lane`,
    },
    {
      name: "Port Waiting",
      durationDays: waitingDays,
      percentage: Math.round((waitingDays / totalVoyageDays) * 100),
      status: waitingDays > 2.5 ? "risk" : "idle",
      details: `${destPortSpec.name} anchorage pre-berthing queue (${waitingDays} days est. idle time)`,
    },
    {
      name: "Discharge",
      durationDays: dischargeDays,
      percentage: Math.round((dischargeDays / totalVoyageDays) * 100),
      status: "normal",
      details: `Mechanized conveyor discharge (${destPortSpec.dischargeRatePerDay.toLocaleString()} MT/day)`,
    },
  ];

  // Risk Radar & Alerts
  const riskIndicators: RiskIndicator[] = [
    {
      name: "Freight Volatility",
      level: Math.abs(config.freightShiftPercent) > 10 ? "High" : Math.abs(config.freightShiftPercent) > 5 ? "Moderate" : "Low",
      score: Math.min(95, 35 + Math.abs(config.freightShiftPercent) * 3),
      driver: "Pacific bunker oil price swings and Baltic Capesize/Panamax index sentiment",
      mitigation: "Hedge through Medium-Term Contract of Affreightment (CoA) collar caps",
    },
    {
      name: "Port Congestion",
      level: config.congestionLevel === "Medium" ? "Moderate" : config.congestionLevel,
      score: config.congestionLevel === "High" ? 82 : config.congestionLevel === "Medium" ? 54 : 26,
      driver: `${destPortSpec.name} outer anchorage vessel lineup with ${destPortSpec.currentWaitingDays}d baseline wait`,
      mitigation: "Virtual Arrival charter clause to adjust transit speed and conserve fuel",
    },
    {
      name: "Demand Uncertainty",
      level: config.demandLevel === "Medium" ? "Moderate" : config.demandLevel,
      score: config.demandLevel === "High" ? 74 : config.demandLevel === "Medium" ? 48 : 28,
      driver: "Indian steel mills (SAIL, RINL, Tata) restocking rate & blast furnace run-rates",
      mitigation: "Buffer stock optimization across Paradip & Vizag stockpiles",
    },
    {
      name: "Vessel Mismatch",
      level: recommendedVesselMatchScore > 85 ? "Low" : recommendedVesselMatchScore > 70 ? "Moderate" : "High",
      score: 100 - recommendedVesselMatchScore,
      driver: `Parcel size ${config.cargoQty.toLocaleString()} MT vs ${recommendedVessel} DWT bounds`,
      mitigation: `Fixing ${recommendedVessel} class guarantees optimal deadweight match`,
    },
    {
      name: "Idle-Time Risk",
      level: waitingDays > 3 ? "High" : waitingDays > 1.8 ? "Moderate" : "Low",
      score: Math.min(92, Math.round(waitingDays * 20)),
      driver: `Estimated ${waitingDays} days idle at anchorage (~$${estimatedIdleCostUSD.toLocaleString()} demurrage exposure)`,
      mitigation: "Pre-arrival berth booking & EDI customs advance filing",
    },
  ];

  const avgRiskScore = Math.round(
    riskIndicators.reduce((acc, r) => acc + r.score, 0) / riskIndicators.length
  );
  const overallRiskLevel: VoyageAnalysisResult["overallRiskLevel"] =
    avgRiskScore > 65 ? "High" : avgRiskScore > 42 ? "Moderate" : "Low";

  // Dynamic Alerts
  const activeAlerts: string[] = [];
  if (config.congestionLevel === "High" || waitingDays > 3) {
    activeAlerts.push(`Port congestion elevated at ${destPortSpec.name} (${waitingDays}d waiting time estimated).`);
  }
  if (Math.abs(config.freightShiftPercent) >= 10) {
    activeAlerts.push("Freight volatility elevated: ±10%+ swing observed on East Coast sea lanes.");
  }
  if (portCompatibilityStatus === "Draft Caution") {
    activeAlerts.push(`Draft constraint alert: ${topSpec.draftFullyLaden}m vessel draft requires tide window at ${destPortSpec.name}.`);
  } else if (portCompatibilityStatus === "Restricted") {
    activeAlerts.push(`CRITICAL: Port draft restriction at ${destPortSpec.name}. Lightering or parcel reduction required.`);
  }
  if (rateChangePercent > 5) {
    activeAlerts.push("Baltic index momentum indicates +5%+ rate increase over 30 days. Recommend early fixture.");
  }

  // Contributing factors for forecast
  const forecastFactors: ForecastExplanationFactor[] = [
    {
      name: "Historical 60-Day Freight Momentum",
      impact: "bullish",
      percentageScore: 32,
      description: "Steady upward rebound in Baltic Panamax Index (BPI) across Indo-Pacific coal lanes.",
      weight: "High",
    },
    {
      name: "Tonnage Demand / Steel Run-Rates",
      impact: config.demandLevel === "High" ? "bullish" : config.demandLevel === "Low" ? "bearish" : "neutral",
      percentageScore: config.demandLevel === "High" ? 28 : config.demandLevel === "Low" ? -22 : 8,
      description: "Indian blast furnace capacity additions spurring raw material import demand.",
      weight: "High",
    },
    {
      name: "Monsoon & Weather Seasonality",
      impact: "bullish",
      percentageScore: 16,
      description: "Bay of Bengal seasonal cyclonic patterns prolonging anchorage queues.",
      weight: "Medium",
    },
    {
      name: "Bunker Fuel & Emissions Costs",
      impact: "bullish",
      percentageScore: 14,
      description: "VLSFO bunker fuel prices holding firm at Singapore hub ($620/MT).",
      weight: "Medium",
    },
    {
      name: "Port Congestion & Bottlenecks",
      impact: config.congestionLevel === "High" ? "bullish" : "neutral",
      percentageScore: config.congestionLevel === "High" ? 18 : 4,
      description: "Berth maintenance and rail siding clearance times influencing turnaround.",
      weight: "Low",
    },
  ];

  // Contract Strategy Comparison
  const spotRate = shiftedCurrentRate;
  const shortTermRate = Number((shiftedCurrentRate * (marketTrend.includes("Bullish") ? 0.96 : 0.98)).toFixed(2));
  const mediumTermCoA = Number((shiftedCurrentRate * (marketTrend.includes("Bullish") ? 0.92 : 0.95)).toFixed(2));

  const contractOptions: ContractStrategyOption[] = [
    {
      type: "Spot",
      title: "Spot Single-Voyage Charter",
      baseRatePerTon: spotRate,
      totalCostUSD: Math.round(spotRate * config.cargoQty),
      marketExposure: "High",
      flexibility: "Maximum",
      expectedCostStability: "Low",
      voyageCoverage: "Single lifting (immediate 10-day window)",
      planningRisk: "High",
      pros: ["Zero long-term commitment", "Exploit brief dips in daily spot rates", "Immediate fixture"],
      cons: ["100% exposed to market spikes", "High demurrage vulnerability", "No guaranteed ship availability"],
      isRecommendedForScenario: config.contractPreference === "Spot",
    },
    {
      type: "Short-Term",
      title: "Short-Term Multi-Voyage (60-90 Days)",
      baseRatePerTon: shortTermRate,
      totalCostUSD: Math.round(shortTermRate * config.cargoQty),
      marketExposure: "Moderate",
      flexibility: "Moderate",
      expectedCostStability: "Good",
      voyageCoverage: "2–3 consecutive voyages across quarter",
      planningRisk: "Medium",
      pros: ["Dampens spot volatility", "Fixed laytime terms with shipowner", "Predictable berth arrival schedule"],
      cons: ["Partial penalty if cargo volume deferred", "Moderate rate lock-in"],
      isRecommendedForScenario: config.contractPreference === "Short-Term",
    },
    {
      type: "Medium-Term",
      title: "Medium-Term Contract of Affreightment (CoA)",
      baseRatePerTon: mediumTermCoA,
      totalCostUSD: Math.round(mediumTermCoA * config.cargoQty),
      marketExposure: "Low",
      flexibility: "Strict",
      expectedCostStability: "High",
      voyageCoverage: "4–6 scheduled sailings over 180 days",
      planningRisk: "Low",
      pros: [
        `Saves ~$${Math.round((spotRate - mediumTermCoA) * config.cargoQty).toLocaleString()} compared to current spot forecast`,
        "Guaranteed vessel tonnage availability",
        "Preferred berth scheduling with port authorities",
      ],
      cons: ["Volume commitment required", "Cancellation clauses apply"],
      isRecommendedForScenario:
        config.contractPreference === "Medium-Term" || config.contractPreference === "Multiple Voyage",
    },
  ];

  // Voyage Intelligence Score (0–100)
  // High score = favourable planning conditions (good match, low congestion, clear draft, cost-effective)
  let score = 75;
  if (recommendedVesselMatchScore >= 85) score += 10;
  if (portCompatibilityStatus === "Fully Compatible") score += 8;
  else if (portCompatibilityStatus === "Draft Caution") score -= 6;
  else if (portCompatibilityStatus === "Restricted") score -= 25;

  if (config.congestionLevel === "Low") score += 6;
  else if (config.congestionLevel === "High") score -= 12;

  if (marketTrend.includes("Bullish") && config.contractPreference !== "Spot") score += 5;
  if (overallRiskLevel === "High") score -= 12;

  const intelligenceScore = Math.max(25, Math.min(96, score));
  let scoreLabel = "Favourable planning conditions";
  if (intelligenceScore >= 85) scoreLabel = "Optimal chartering window";
  else if (intelligenceScore >= 70) scoreLabel = "Favourable planning conditions";
  else if (intelligenceScore >= 55) scoreLabel = "Moderate caution recommended";
  else scoreLabel = "High volatility / constrained window";

  const scoreExplanation = `FreightIQ synthesized current Baltic freight curves, ${recommendedVessel} class deadweight utilization (${vesselComparisons[0].utilizationPercent}%), ${destPortSpec.name} queue metrics (${waitingDays}d waiting), and ocean weather conditions. Chartering index suggests locking in ${config.contractPreference} terms promptly.`;

  const idleReductionAdvice = `Implement 'Virtual Arrival' speed optimization clauses with shipowners: reducing transit speed from ${speedKnots} to ${(
    speedKnots - 1.8
  ).toFixed(1)} knots cuts bunker emissions by ~18% and synchronizes arrival with ${destPortSpec.name} berth vacancy, eliminating ~${waitingDays} days of anchorage idle demurrage.`;

  return {
    intelligenceScore,
    scoreLabel,
    scoreExplanation,
    currentRate: shiftedCurrentRate,
    forecastRate30d,
    rateChangePercent,
    marketTrend,
    recommendedVessel,
    recommendedVesselMatchScore,
    overallRiskLevel,
    transitDays,
    nauticalMiles: distanceNM,
    estimatedIdleDays,
    estimatedIdleCostUSD,
    utilizationPercent,
    portCompatibilityStatus,
    forecastData,
    forecastFactors,
    vesselComparisons,
    compatibilityChecks,
    riskIndicators,
    activeAlerts,
    timelinePhases,
    idleReductionAdvice,
    contractOptions,
  };
}

export const simulateVoyageIntelligence = runVoyageSimulation;
