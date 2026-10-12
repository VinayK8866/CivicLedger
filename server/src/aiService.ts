import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import {
  IncidentCategory,
  SeverityLevel,
  GeoLocation,
  CanonicalIncident,
  Claim,
  EvidenceItem,
  EvidenceGap,
  Intervention,
  SentimentAnalysis
} from './types.js';

export const SentimentAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'concerned', 'distressed', 'critical_panic']),
  distressScore: z.number().min(0).max(100),
  urgencyScore: z.number().min(0).max(100),
  keyDistressFactors: z.array(z.string())
});

// Schema for report extraction
export const ReportExtractionSchema = z.object({
  category: z.enum([
    'waterlogging',
    'drainage',
    'potholes',
    'streetlights',
    'waste_accumulation',
    'pedestrian_safety',
    'heat_exposure',
    'utility_disruption',
    'other'
  ]),
  visibleConditions: z.array(z.string()),
  landmarks: z.array(z.string()),
  temporalReferences: z.array(z.string()),
  potentialImpacts: z.array(z.string()),
  statedCauses: z.array(z.string()),
  candidateClaims: z.array(z.string()),
  missingInfo: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  sentiment: SentimentAnalysisSchema.optional()
});

export type ReportExtraction = z.infer<typeof ReportExtractionSchema>;

export interface IncidentMatchResult {
  candidateIncidentId: string;
  candidateTitle: string;
  similarityScore: number; // 0 to 1
  distanceMeters: number;
  matchType: 'duplicate' | 'recurring' | 'unrelated';
  rationale: string;
}

export interface ContradictionAnalysis {
  conflictDetected: boolean;
  temporalDistinction: boolean; // true if claims describe different times rather than genuine conflict
  explanation: string;
  claimAId: string;
  claimBId?: string;
  recommendation: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-1.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      this.genAI = new GoogleGenerativeAI(apiKey.trim());
      console.log('[AIService] Initialized with Google Gemini API Key.');
    } else {
      console.log('[AIService] No GEMINI_API_KEY configured. Running in resilient local heuristic fallback mode.');
    }
  }

  public isLiveAIAvailable(): boolean {
    return this.genAI !== null;
  }

  /**
   * Extract structured information from incident report description and metadata.
   */
  public async extractIncidentData(
    title: string,
    description: string,
    categoryHint?: string,
    location?: GeoLocation
  ): Promise<{ extraction: ReportExtraction; mode: 'gemini' | 'heuristic' }> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.modelName });
        const prompt = `
You are the AI extraction engine for CivicTwin, a community intelligence platform.
Analyze this incident report and extract structured, schema-compliant information.
Strict rule: Separate direct observable facts from subjective interpretations or unproven causes.

Report Title: ${title}
Report Description: ${description}
Category Hint: ${categoryHint || 'None'}
Location Details: ${location ? JSON.stringify(location) : 'Unspecified'}

Output ONLY valid JSON matching this schema:
{
  "category": "waterlogging" | "drainage" | "potholes" | "streetlights" | "waste_accumulation" | "pedestrian_safety" | "heat_exposure" | "utility_disruption" | "other",
  "visibleConditions": ["array of physically visible facts observed"],
  "landmarks": ["array of specific streets, clinics, metro pillars, or buildings mentioned"],
  "temporalReferences": ["array of dates or timeframes mentioned"],
  "potentialImpacts": ["array of safety, economic, or mobility hazards"],
  "statedCauses": ["array of causes asserted by the user"],
  "candidateClaims": ["array of verifiable factual claims extracted"],
  "missingInfo": ["array of crucial information not mentioned but needed to verify"],
  "confidence": 0.85,
  "sentiment": {
    "sentiment": "positive" | "neutral" | "concerned" | "distressed" | "critical_panic",
    "distressScore": 85,
    "urgencyScore": 90,
    "keyDistressFactors": ["direct electrocution hazard", "children exposed"]
  }
}
`;
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });

        const rawJson = result.response.text();
        const parsed = JSON.parse(rawJson);
        const validated = ReportExtractionSchema.parse(parsed);
        return { extraction: validated, mode: 'gemini' };
      } catch (err) {
        console.warn('[AIService] Gemini extraction error, falling back to heuristic engine:', err);
      }
    }

    // Heuristic fallback engine
    const heuristic = this.heuristicExtraction(title, description, categoryHint);
    return { extraction: heuristic, mode: 'heuristic' };
  }

  public async analyzeReportSentiment(text: string): Promise<SentimentAnalysis> {
    const { extraction } = await this.extractIncidentData('Citizen Report', text);
    return extraction.sentiment || {
      sentiment: 'concerned',
      distressScore: 40,
      urgencyScore: 45,
      keyDistressFactors: ['Citizen reported community disruption']
    };
  }

  // Heuristic fallback engine
  private heuristicExtraction(title: string, description: string, categoryHint?: string): ReportExtraction {
    const text = `${title} ${description}`.toLowerCase();

    let category: IncidentCategory = 'other';
    if (categoryHint && [
      'waterlogging', 'drainage', 'potholes', 'streetlights',
      'waste_accumulation', 'pedestrian_safety', 'heat_exposure', 'utility_disruption'
    ].includes(categoryHint)) {
      category = categoryHint as IncidentCategory;
    } else if (text.includes('water') || text.includes('flood') || text.includes('waterlog')) {
      category = 'waterlogging';
    } else if (text.includes('drain') || text.includes('culvert') || text.includes('sewer') || text.includes('silt')) {
      category = 'drainage';
    } else if (text.includes('pothole') || text.includes('asphalt') || text.includes('road crack') || text.includes('crater')) {
      category = 'potholes';
    } else if (text.includes('light') || text.includes('dark') || text.includes('lamp')) {
      category = 'streetlights';
    } else if (text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('trash')) {
      category = 'waste_accumulation';
    }

    const conditions: string[] = [];
    if (text.includes('water') || text.includes('deep')) conditions.push('Standing surface water pooling');
    if (text.includes('silt') || text.includes('block') || text.includes('clog')) conditions.push('Sediment or physical blockage visible');
    if (text.includes('pothole') || text.includes('crater') || text.includes('hole')) conditions.push('Pavement surface cratering / depth depression');
    if (text.includes('smell') || text.includes('flies') || text.includes('crate')) conditions.push('Uncollected commercial refuse piles');
    if (text.includes('spark') || text.includes('electric') || text.includes('wire') || text.includes('cable')) conditions.push('Exposed energized electrical contact hazard');
    if (conditions.length === 0) conditions.push('Disruption described in resident report');

    const landmarks: string[] = [];
    const clinicMatch = text.match(/([a-zA-Z\s]+clinic|[a-zA-Z\s]+hospital)/i);
    if (clinicMatch) landmarks.push(clinicMatch[0].trim());
    const streetMatch = text.match(/([a-zA-Z0-9\s]+st|[a-zA-Z0-9\s]+street|[a-zA-Z0-9\s]+ave|[a-zA-Z0-9\s]+avenue|[a-zA-Z0-9\s]+cross|[a-zA-Z0-9\s]+pillar\s*\d+)/i);
    if (streetMatch) landmarks.push(streetMatch[0].trim());

    // Sentiment & Community Distress Analysis
    const distressFactors: string[] = [];
    let distressScore = 40;
    let urgencyScore = 45;
    let sentiment: 'positive' | 'neutral' | 'concerned' | 'distressed' | 'critical_panic' = 'concerned';

    if (text.includes('emergency') || text.includes('danger') || text.includes('spark') || text.includes('electric') || text.includes('shock') || text.includes('live wire')) {
      distressFactors.push('Imminent life-safety electrical or physical hazard');
      distressScore += 45;
      urgencyScore += 45;
      sentiment = 'critical_panic';
    }
    if (text.includes('ambulance') || text.includes('hospital') || text.includes('clinic') || text.includes('patient') || text.includes('wheelchair')) {
      distressFactors.push('Emergency medical or vulnerable community access obstructed');
      distressScore += 30;
      urgencyScore += 35;
      if (sentiment !== 'critical_panic') sentiment = 'distressed';
    }
    if (text.includes('kids') || text.includes('children') || text.includes('school') || text.includes('elderly')) {
      distressFactors.push('Vulnerable population (children/elderly) directly exposed');
      distressScore += 25;
      urgencyScore += 25;
      if (sentiment !== 'critical_panic') sentiment = 'distressed';
    }
    if (text.includes('impassable') || text.includes('stalled') || text.includes('stranded') || text.includes('break down')) {
      distressFactors.push('Complete vehicular or pedestrian transit paralysis');
      distressScore += 15;
      urgencyScore += 20;
    }

    distressScore = Math.min(100, Math.max(10, distressScore));
    urgencyScore = Math.min(100, Math.max(10, urgencyScore));

    return {
      category,
      visibleConditions: conditions,
      landmarks: landmarks.length > 0 ? landmarks : ['Local neighborhood street'],
      temporalReferences: ['Contemporary observation'],
      potentialImpacts: ['Pedestrian and vehicular transit impedance', 'Localized community hazard'],
      statedCauses: ['Unaddressed infrastructure strain or maintenance delay'],
      candidateClaims: [`Physical condition reported at location requires corroboration and verification.`],
      missingInfo: ['Calibrated physical measurement', 'Underground conduit status / sub-base structural condition'],
      confidence: 0.88,
      sentiment: {
        sentiment,
        distressScore,
        urgencyScore,
        keyDistressFactors: distressFactors.length > 0 ? distressFactors : ['General resident inconvenience']
      }
    };
  }

  /**
   * Hybrid Related-Incident & Duplicate Matching Algorithm:
   * Uses Haversine distance, category matching, timestamp divergence, and text similarity.
   */
  public matchCandidateIncidents(
    reportedLocation: GeoLocation,
    reportedCategory: IncidentCategory,
    title: string,
    description: string,
    observedAt: string,
    existingIncidents: CanonicalIncident[]
  ): IncidentMatchResult[] {
    const results: IncidentMatchResult[] = [];
    const reportDate = new Date(observedAt).getTime();

    for (const incident of existingIncidents) {
      // 1. Calculate Geographic Proximity using Haversine
      const distanceMeters = this.haversineDistance(
        reportedLocation.lat,
        reportedLocation.lng,
        incident.canonicalLocation.lat,
        incident.canonicalLocation.lng
      );

      // 2. Category compatibility
      const categoryMatch = incident.category === reportedCategory ||
        (incident.category === 'waterlogging' && reportedCategory === 'drainage') ||
        (incident.category === 'drainage' && reportedCategory === 'waterlogging');

      // 3. Text & Semantic Overlap
      const reportWords = new Set(`${title} ${description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3));
      const incidentWords = new Set(`${incident.title} ${incident.currentAssessment}`.toLowerCase().split(/\W+/).filter(w => w.length > 3));
      let intersection = 0;
      reportWords.forEach(w => { if (incidentWords.has(w)) intersection++; });
      const textSimilarity = reportWords.size > 0 ? intersection / reportWords.size : 0;

      // 4. Temporal difference
      const incidentLastDate = new Date(incident.lastObservedAt).getTime();
      const daysDiff = Math.abs(reportDate - incidentLastDate) / (1000 * 60 * 60 * 24);

      // Calculate combined score
      let score = 0;
      let matchType: 'duplicate' | 'recurring' | 'unrelated' = 'unrelated';
      let rationale = '';

      if (distanceMeters < 100 && categoryMatch) {
        if (daysDiff < 2) {
          score = 0.92 + textSimilarity * 0.08;
          matchType = 'duplicate';
          rationale = `Extremely close proximity (${Math.round(distanceMeters)}m) and recorded within ${Math.round(daysDiff * 24)}h of active incident episode. High probability of referring to the exact same physical episode.`;
        } else {
          score = 0.82 + textSimilarity * 0.15;
          matchType = 'recurring';
          rationale = `Same location (${Math.round(distanceMeters)}m) with matching category, occurring ${Math.round(daysDiff)} days later. Indicates recurring chronic hotspot rather than single isolated event.`;
        }
      } else if (distanceMeters < 300 && categoryMatch) {
        score = 0.65 + textSimilarity * 0.2;
        matchType = 'recurring';
        rationale = `Nearby location (${Math.round(distanceMeters)}m) in same hydraulic/infrastructure corridor. Potential common underlying drainage/pavement issue.`;
      } else if (textSimilarity > 0.45) {
        score = 0.45;
        matchType = 'unrelated';
        rationale = `Similar vocabulary observed but located ${Math.round(distanceMeters)}m away. Likely distinct neighborhood location.`;
      }

      if (score >= 0.4) {
        results.push({
          candidateIncidentId: incident.id,
          candidateTitle: incident.title,
          similarityScore: Math.min(Number(score.toFixed(2)), 0.99),
          distanceMeters: Math.round(distanceMeters),
          matchType,
          rationale
        });
      }
    }

    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Contradiction Detection:
   * Compares claims and evaluates whether disagreement is temporal progression or a true factual dispute.
   */
  public analyzeClaimContradiction(
    claimA: Claim,
    claimB: Claim,
    allEvidence: EvidenceItem[]
  ): ContradictionAnalysis {
    const timeA = claimA.temporalScope.startDate ? new Date(claimA.temporalScope.startDate).getTime() : 0;
    const timeB = claimB.temporalScope.startDate ? new Date(claimB.temporalScope.startDate).getTime() : 0;
    const timeDiffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);

    const textA = claimA.claimText.toLowerCase();
    const textB = claimB.claimText.toLowerCase();

    // Check for temporal progression (e.g., cleared vs returned later)
    if (
      (textA.includes('resolved') || textA.includes('cleared')) &&
      (textB.includes('silt') || textB.includes('recur') || textB.includes('returned') || textB.includes('choke'))
    ) {
      if (timeDiffDays > 5) {
        return {
          conflictDetected: true,
          temporalDistinction: true,
          explanation: `Claims describe different temporal epochs. Claim "${claimA.claimText}" refers to an earlier intervention, whereas Claim "${claimB.claimText}" captures subsequent failure/recurrence. This represents temporal failure rather than concurrent perceptual disagreement.`,
          claimAId: claimA.id,
          claimBId: claimB.id,
          recommendation: `Mark earlier resolution claim as "Outdated / Superseded" by subsequent verified observations.`
        };
      }
    }

    // Direct concurrent contradiction
    return {
      conflictDetected: true,
      temporalDistinction: false,
      explanation: `Conflicting statements exist regarding the physical condition at this location. Evidence must be examined to verify which claim is corroborated by calibrated physical measurements vs unverified memos.`,
      claimAId: claimA.id,
      claimBId: claimB.id,
      recommendation: `Conduct independent verifier physical probe and check sensor logs.`
    };
  }

  /**
   * The Unknown Detector: Analyzes incident evidence and extracts high-priority gaps.
   */
  public detectEvidenceGaps(
    incident: CanonicalIncident,
    claims: Claim[],
    evidence: EvidenceItem[]
  ): EvidenceGap[] {
    const gaps: EvidenceGap[] = [];

    // 1. Recency Gap after resolution
    const hasResolutionClaim = claims.some(c => c.claimType === 'resolution' && c.status === 'supported');
    const recentEvidence = evidence.filter(e => {
      const daysOld = (Date.now() - new Date(e.observedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysOld < 7;
    });

    if (hasResolutionClaim && recentEvidence.length === 0) {
      gaps.push({
        id: `gap-${incident.id}-recency`,
        incidentId: incident.id,
        description: 'No recent follow-up observation recorded within the past 7 days following the reported resolution.',
        importance: 'high',
        relatedClaimIds: claims.map(c => c.id),
        recommendedAction: 'Dispatch a Community Verifier or local resident to verify that the fix is durably holding.',
        suggestedRole: 'verifier',
        blocksConclusion: true,
        status: 'open',
        createdAt: new Date().toISOString()
      });
    }

    // 2. Corroboration / Single-source bias check
    const residentEvidence = evidence.filter(e => e.sourceCategory === 'community');
    const officialOrSensor = evidence.filter(e => e.sourceCategory === 'sensor' || e.sourceCategory === 'verifier' || e.sourceCategory === 'official');

    if (residentEvidence.length > 0 && officialOrSensor.length === 0) {
      gaps.push({
        id: `gap-${incident.id}-corroboration`,
        incidentId: incident.id,
        description: 'All observations for this incident originate from a single community contributor without independent sensor or verifier corroboration.',
        importance: 'medium',
        relatedClaimIds: claims.map(c => c.id),
        recommendedAction: 'Request a second independent observation with timestamped photographic evidence.',
        suggestedRole: 'resident',
        blocksConclusion: false,
        status: 'open',
        createdAt: new Date().toISOString()
      });
    }

    // 3. Structural inspection gap for drainage/waterlogging
    if (incident.category === 'waterlogging' || incident.category === 'drainage') {
      const hasCctvOrInternalInspection = evidence.some(e =>
        e.description.toLowerCase().includes('cctv') ||
        e.description.toLowerCase().includes('camera') ||
        e.description.toLowerCase().includes('internal inspection')
      );

      if (!hasCctvOrInternalInspection) {
        gaps.push({
          id: `gap-${incident.id}-structural`,
          incidentId: incident.id,
          description: 'No internal pipe camera (CCTV) or acoustic survey exists to distinguish surface silt blockage from structural culvert conduit collapse.',
          importance: 'high',
          relatedClaimIds: claims.filter(c => c.claimType === 'cause').map(c => c.id),
          recommendedAction: 'Schedule a robotic pipe inspection survey to establish true sub-surface condition.',
          suggestedRole: 'coordinator',
          blocksConclusion: true,
          status: 'open',
          createdAt: new Date().toISOString()
        });
      }
    }

    return gaps;
  }

  /**
   * Prevention Lab: Transparent Multi-Factor Simulation Scorer.
   */
  public simulateInterventionImpact(
    intervention: Intervention,
    historicalRecurrence: number
  ) {
    // Model parameters
    const baseEffectiveness = intervention.expectedEffectiveness; // 0-100%
    const costEfficiency = Math.max(0, 100 - (intervention.estimatedCost / 300));
    const timeFactor = Math.max(0, 100 - (intervention.implementationWeeks * 8));

    // Composite score
    const impactScore = Math.round(baseEffectiveness * 0.55 + costEfficiency * 0.25 + timeFactor * 0.20);
    const estimatedRecurrenceReduction = Math.round((baseEffectiveness / 100) * historicalRecurrence * 10) / 10;
    const confidenceRating = intervention.evidenceReferences.length >= 2 ? 'High (Corroborated)' : 'Moderate (Preliminary)';

    return {
      impactScore,
      estimatedRecurrenceReduction,
      confidenceRating,
      assumptionsCount: intervention.assumptions.length,
      evidenceBasisCount: intervention.evidenceReferences.length,
      illustrativeNotice: 'Simulation score generated via transparent multi-attribute rule-based weighting. Estimates are illustrative.'
    };
  }

  /**
   * Civic Priority & Criticality Scorer using Sentiment Analysis & Severity Weighting:
   * Enables severe, high-distress non-recurring issues (e.g. exposed live high-voltage cables,
   * sinkholes blocking clinic ambulances) to achieve urgent priority ahead of routine recurring issues.
   */
  public calculateIncidentCriticality(
    incident: {
      category: IncidentCategory;
      riskLevel: SeverityLevel;
      recurrenceCount: number;
      title: string;
      currentAssessment: string;
    },
    reports: Array<{ severity: SeverityLevel; description: string; aiExtraction?: ReportExtraction }>
  ): {
    criticalityScore: number;
    distressSentimentScore: number;
    priorityRank: 'routine' | 'elevated' | 'urgent' | 'critical_emergency';
    urgencyRationale: string;
  } {
    // 1. Severity Base Score (up to 40 pts)
    const severityMap: Record<SeverityLevel, number> = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10
    };
    const baseSeverity = severityMap[incident.riskLevel] || 20;

    // 2. Distress & Sentiment Urgency Component (up to 35 pts)
    let avgDistress = 45;
    if (reports.length > 0) {
      const sumDistress = reports.reduce((acc, r) => {
        const score = r.aiExtraction?.sentiment?.distressScore ?? (r.severity === 'critical' ? 90 : r.severity === 'high' ? 70 : 40);
        return acc + score;
      }, 0);
      avgDistress = Math.round(sumDistress / reports.length);
    }
    const sentimentComponent = (avgDistress / 100) * 35;

    // 3. Recurrence Component (up to 15 pts)
    const recurrenceComponent = Math.min(15, incident.recurrenceCount * 4);

    // 4. Critical Infrastructure / Life-Safety Context (up to 10 pts)
    const combinedText = `${incident.title} ${incident.currentAssessment}`.toLowerCase();
    let corridorBonus = 0;
    if (combinedText.includes('clinic') || combinedText.includes('hospital') || combinedText.includes('ambulance') || combinedText.includes('school')) {
      corridorBonus += 6;
    }
    if (combinedText.includes('electric') || combinedText.includes('wire') || combinedText.includes('cable') || combinedText.includes('spark') || combinedText.includes('collapse') || combinedText.includes('sinkhole')) {
      corridorBonus += 4;
    }
    corridorBonus = Math.min(10, corridorBonus);

    // Composite Criticality Score (0 to 100)
    const rawScore = baseSeverity + sentimentComponent + recurrenceComponent + corridorBonus;
    const criticalityScore = Math.min(100, Math.round(rawScore));

    let priorityRank: 'routine' | 'elevated' | 'urgent' | 'critical_emergency' = 'routine';
    if (criticalityScore >= 80) {
      priorityRank = 'critical_emergency';
    } else if (criticalityScore >= 65) {
      priorityRank = 'urgent';
    } else if (criticalityScore >= 45) {
      priorityRank = 'elevated';
    }

    let urgencyRationale = '';
    if (incident.recurrenceCount <= 1 && criticalityScore >= 75) {
      urgencyRationale = `High severity (${incident.riskLevel.toUpperCase()}) and intense resident distress sentiment (${avgDistress}/100) elevate this isolated incident to urgent emergency priority despite low recurrence history.`;
    } else if (incident.recurrenceCount > 1) {
      urgencyRationale = `Compound priority driven by ${incident.recurrenceCount}x recurring episodes combined with ${avgDistress}/100 community distress sentiment.`;
    } else {
      urgencyRationale = `Routine civic maintenance profile with moderate distress sentiment (${avgDistress}/100).`;
    }

    return {
      criticalityScore,
      distressSentimentScore: avgDistress,
      priorityRank,
      urgencyRationale
    };
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export const aiService = new AIService();
