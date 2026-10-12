export type UserRole = 'resident' | 'verifier' | 'coordinator' | 'admin';

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export type IncidentCategory =
  | 'waterlogging'
  | 'drainage'
  | 'potholes'
  | 'streetlights'
  | 'waste_accumulation'
  | 'pedestrian_safety'
  | 'heat_exposure'
  | 'utility_disruption'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  landmark?: string;
  neighborhood?: string;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'concerned' | 'distressed' | 'critical_panic';
  distressScore: number; // 0 to 100 (0 = calm, 100 = extreme community panic/emergency)
  urgencyScore: number;  // 0 to 100
  keyDistressFactors: string[];
}

export interface IncidentReport {
  id: string;
  submittedBy: string; // User ID or demo user
  submitterName: string;
  submitterRole: UserRole;
  title: string;
  description: string;
  category: IncidentCategory;
  reportedLocation: GeoLocation;
  observedAt: string;
  submittedAt: string;
  severity: SeverityLevel;
  mediaReferences: string[];
  impactDescription?: string;
  notes?: string;
  moderationStatus: 'approved' | 'flagged' | 'pending';
  aiProcessingStatus: 'pending' | 'completed' | 'failed' | 'fallback';
  aiExtraction?: {
    category: IncidentCategory;
    visibleConditions: string[];
    landmarks: string[];
    temporalReferences: string[];
    potentialImpacts: string[];
    statedCauses: string[];
    candidateClaims: string[];
    missingInfo: string[];
    confidence: number;
    sentiment?: SentimentAnalysis;
  };
  matchedIncidentId?: string;
  matchingRationale?: string;
}

export interface AccountabilityCustodian {
  id: string;
  name: string;
  title: string;
  department: string;
  level: 'subordinate_field_officer' | 'zonal_superintendent' | 'chief_commissioner';
  contactEmail: string;
  contactPhone: string;
}

export interface EscalationRecord {
  id: string;
  incidentId: string;
  escalatedAt: string;
  escalatedBy: string; // Citizen, Verifier, or Automated Watchdog
  escalatedByName: string;
  fromOfficial: AccountabilityCustodian; // Subordinate who did not respond
  toOfficial: AccountabilityCustodian;   // Higher authority
  reason: string;
  daysUnresponsive: number;
  slaBreachedHours: number;
  evidencePacketSummary: string;
  status: 'pending_commissioner_review' | 'disciplinary_inquiry' | 'urgent_override_dispatched' | 'resolved';
  supervisoryActionNotes?: string;
}

export interface IncidentAccountability {
  department: string;
  assignedOfficer: AccountabilityCustodian;      // Subordinate responsible
  supervisoryAuthority: AccountabilityCustodian; // Higher supervisory authority
  assignedAt: string;
  slaHours: number;                              // Maximum allotted response time in hours
  slaDeadline: string;
  slaStatus: 'within_sla' | 'sla_breached' | 'escalated_to_superior' | 'superior_action_mandated' | 'resolved';
  lastOfficerUpdate?: string;
  inactionDays: number;
  escalationHistory: EscalationRecord[];
}

export interface CanonicalIncident {
  id: string;
  title: string;
  category: IncidentCategory;
  canonicalLocation: GeoLocation;
  firstObservedAt: string;
  lastObservedAt: string;
  currentAssessment: string;
  recurrenceCount: number;
  resolvedCount: number;
  status: 'active' | 'recurring' | 'investigating' | 'under_intervention' | 'resolved' | 'disputed';
  riskLevel: SeverityLevel;
  criticalityScore: number; // 0 to 100 composite priority score
  distressSentimentScore: number; // 0 to 100 average resident distress score
  priorityRank: 'routine' | 'elevated' | 'urgent' | 'critical_emergency';
  urgencyRationale: string;
  tags: string[];
  reportIds: string[];
  accountability?: IncidentAccountability;
  createdAt: string;
  updatedAt: string;
}

export interface Observation {
  id: string;
  incidentId: string;
  reportId?: string;
  observedAt: string;
  condition: string;
  sourceType: 'resident_report' | 'verifier_inspection' | 'sensor_data' | 'volunteer_check' | 'official_record';
  location: GeoLocation;
  verificationStatus: 'verified' | 'unverified' | 'disputed';
  notes?: string;
  mediaReference?: string;
  submittedBy: string;
}

export type ClaimStatus =
  | 'draft'
  | 'pending_review'
  | 'supported'
  | 'disputed'
  | 'unverified'
  | 'outdated'
  | 'rejected';

export interface Claim {
  id: string;
  incidentId: string;
  claimText: string;
  normalizedClaim: string;
  claimType: 'condition' | 'cause' | 'resolution' | 'recurrence' | 'impact';
  temporalScope: {
    startDate?: string;
    endDate?: string;
    isOngoing: boolean;
  };
  status: ClaimStatus;
  confidence: number;
  supportingEvidenceIds: string[];
  contradictoryEvidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type EvidenceType =
  | 'resident_observation'
  | 'photograph'
  | 'public_document'
  | 'official_public_data'
  | 'ngo_record'
  | 'environmental_measurement'
  | 'ai_extracted_claim'
  | 'human_verification_note';

export interface EvidenceItem {
  id: string;
  evidenceType: EvidenceType;
  description: string;
  sourceReference: string;
  sourceCategory: 'community' | 'official' | 'sensor' | 'verifier' | 'ai';
  mediaReference?: string;
  observedAt: string;
  collectedAt: string;
  location?: GeoLocation;
  associatedClaimIds: string[];
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'deprecated';
  reviewerNotes?: string;
  submittedBy: string;
  provenance: {
    origin: string;
    authenticated: boolean;
    hash?: string;
    captureMethod?: string;
  };
}

export type RelationType =
  | 'REPORTS'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'REFERS_TO'
  | 'OBSERVED_AT'
  | 'OCCURRED_DURING'
  | 'VERIFIED_BY'
  | 'SUPERSEDES'
  | 'ADDRESSES'
  | 'MEASURED_BY';

export interface EvidenceRelation {
  id: string;
  sourceEntityType: 'report' | 'claim' | 'evidence' | 'observation' | 'incident' | 'intervention';
  sourceEntityId: string;
  relationType: RelationType;
  targetEntityType: 'report' | 'claim' | 'evidence' | 'observation' | 'incident' | 'intervention';
  targetEntityId: string;
  rationale: string;
  createdAt: string;
}

export interface VerificationDecision {
  id: string;
  claimId: string;
  reviewerId: string;
  reviewerName: string;
  previousStatus: ClaimStatus;
  decision: ClaimStatus;
  rationale: string;
  evidenceReviewed: string[];
  createdAt: string;
}

export interface EvidenceGap {
  id: string;
  incidentId: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  relatedClaimIds: string[];
  recommendedAction: string;
  suggestedRole: UserRole;
  blocksConclusion: boolean;
  status: 'open' | 'addressed' | 'converted';
  convertedToActionId?: string;
  createdAt: string;
}

export interface Intervention {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  assumptions: string[];
  estimatedCost: number; // in USD or local currency
  expectedOutcome: string;
  expectedEffectiveness: number; // Percentage 0-100
  implementationWeeks: number;
  affectedLocations: string[];
  evidenceReferences: string[];
  status: 'proposed' | 'under_review' | 'approved' | 'active' | 'completed' | 'abandoned';
  createdBy: string;
  createdAt: string;
  evaluationPlan: {
    metric: string;
    baselineValue: number;
    targetValue: number;
    unit: string;
    measurementMethod: string;
    evaluationWindowDays: number;
  };
}

export interface OutcomeMeasurement {
  id: string;
  interventionId: string;
  metric: string;
  baselineValue: number;
  observedValue: number;
  unit: string;
  measurementMethod: string;
  measuredAt: string;
  evidenceReferences: string[];
  limitations: string;
  correlationVsCausationNote: string;
  conclusion: 'target_met' | 'partial_improvement' | 'no_change' | 'degraded' | 'inconclusive';
}

export interface CommunityAction {
  id: string;
  incidentId: string;
  interventionId?: string;
  gapId?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedRole: UserRole;
  deadline: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardSummary {
  totalReports: number;
  uniqueIncidents: number;
  recurringHotspots: number;
  claimsAwaitingReview: number;
  unresolvedConflicts: number;
  openCommunityActions: number;
  verifiedRate: number;
}
