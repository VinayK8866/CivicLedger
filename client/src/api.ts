import {
  User,
  UserRole,
  IncidentReport,
  CanonicalIncident,
  Observation,
  Claim,
  EvidenceItem,
  EvidenceRelation,
  EvidenceGap,
  Intervention,
  OutcomeMeasurement,
  CommunityAction,
  AuditEvent,
  DashboardSummary
} from './types';

const BASE_URL = '/api';

export async function fetchAuthMe(): Promise<{ user: User; isDemo: boolean; availableRoles: UserRole[] }> {
  const res = await fetch(`${BASE_URL}/auth/me`);
  return res.json();
}

export async function switchDemoRole(role: UserRole): Promise<{ success: boolean; user: User }> {
  const res = await fetch(`${BASE_URL}/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return res.json();
}

export async function fetchDashboardSummary(): Promise<{ summary: DashboardSummary }> {
  const res = await fetch(`${BASE_URL}/dashboard/summary`);
  return res.json();
}

export async function fetchDashboardTrends(): Promise<{
  categoryCounts: Record<string, number>;
  timelineTrend: Array<any>;
  statusBreakdown: Record<string, number>;
}> {
  const res = await fetch(`${BASE_URL}/dashboard/trends`);
  return res.json();
}

export async function fetchIncidents(params?: {
  category?: string;
  status?: string;
  risk?: string;
  search?: string;
}): Promise<{ incidents: CanonicalIncident[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.category) q.set('category', params.category);
  if (params?.status) q.set('status', params.status);
  if (params?.risk) q.set('risk', params.risk);
  if (params?.search) q.set('search', params.search);

  const res = await fetch(`${BASE_URL}/incidents?${q.toString()}`);
  return res.json();
}

export async function fetchIncidentById(id: string): Promise<{
  incident: CanonicalIncident;
  reports: IncidentReport[];
  observations: Observation[];
  claims: Claim[];
  evidenceItems: EvidenceItem[];
  evidenceGaps: EvidenceGap[];
  interventions: Intervention[];
}> {
  const res = await fetch(`${BASE_URL}/incidents/${id}`);
  return res.json();
}

export async function fetchIncidentTimeline(id: string): Promise<{ timeline: Observation[] }> {
  const res = await fetch(`${BASE_URL}/incidents/${id}/timeline`);
  return res.json();
}

export async function escalateIncidentToHigherAuthority(
  incidentId: string,
  data: { reason: string; evidenceNotes?: string }
): Promise<{
  success: boolean;
  message: string;
  escalation: any;
  incident: CanonicalIncident;
}> {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to escalate to higher authority');
  }
  return res.json();
}

export async function submitIncidentReport(data: {
  title: string;
  description: string;
  category: string;
  reportedLocation: { lat: number; lng: number; address?: string; landmark?: string; neighborhood?: string };
  observedAt: string;
  severity: string;
  mediaReferences?: string[];
  impactDescription?: string;
  notes?: string;
}): Promise<{
  report: IncidentReport;
  candidateMatches: Array<{
    candidateIncidentId: string;
    candidateTitle: string;
    similarityScore: number;
    distanceMeters: number;
    matchType: string;
    rationale: string;
  }>;
  aiMode: string;
}> {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit report');
  }
  return res.json();
}

export async function fetchEvidenceGraph(incidentId?: string): Promise<{
  nodes: any[];
  edges: any[];
  totalNodes: number;
  totalEdges: number;
  rawRelations: EvidenceRelation[];
}> {
  const q = incidentId ? `?incidentId=${incidentId}` : '';
  const res = await fetch(`${BASE_URL}/evidence/graph${q}`);
  return res.json();
}

export async function fetchClaims(params?: { status?: string; incidentId?: string }): Promise<{ claims: Claim[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.incidentId) q.set('incidentId', params.incidentId);
  const res = await fetch(`${BASE_URL}/claims?${q.toString()}`);
  return res.json();
}

export async function fetchClaimDetails(id: string): Promise<{
  claim: Claim;
  supporting: EvidenceItem[];
  contradictory: EvidenceItem[];
  decisions: any[];
}> {
  const res = await fetch(`${BASE_URL}/claims/${id}`);
  return res.json();
}

export async function verifyClaim(id: string, data: {
  decision: string;
  rationale: string;
  evidenceReviewed: string[];
}): Promise<{ success: boolean; claim: Claim }> {
  const res = await fetch(`${BASE_URL}/claims/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to verify claim');
  }
  return res.json();
}

export async function convertGapToAction(gapId: string): Promise<{ success: boolean; action: CommunityAction }> {
  const res = await fetch(`${BASE_URL}/gaps/${gapId}/convert-action`, {
    method: 'POST'
  });
  return res.json();
}

export async function simulateIntervention(data: {
  incidentId: string;
  title: string;
  description: string;
  estimatedCost: number;
  expectedEffectiveness: number;
  implementationWeeks: number;
  assumptions: string[];
  evidenceReferences: string[];
}): Promise<{
  simulation: {
    impactScore: number;
    estimatedRecurrenceReduction: number;
    confidenceRating: string;
    assumptionsCount: number;
    evidenceBasisCount: number;
    illustrativeNotice: string;
  };
}> {
  const res = await fetch(`${BASE_URL}/interventions/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function createIntervention(data: any): Promise<{ intervention: Intervention }> {
  const res = await fetch(`${BASE_URL}/interventions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function recordOutcomeMeasurement(interventionId: string, data: any): Promise<{ measurement: OutcomeMeasurement }> {
  const res = await fetch(`${BASE_URL}/interventions/${interventionId}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchActions(): Promise<{ actions: CommunityAction[] }> {
  const res = await fetch(`${BASE_URL}/actions`);
  return res.json();
}

export async function updateActionStatus(id: string, status: string): Promise<{ action: CommunityAction }> {
  const res = await fetch(`${BASE_URL}/actions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function fetchAdminHealth(): Promise<{
  status: string;
  timestamp: string;
  liveAI: boolean;
  totalIncidents: number;
  totalClaims: number;
  totalEvidence: number;
}> {
  const res = await fetch(`${BASE_URL}/admin/health`);
  return res.json();
}

export async function fetchAuditEvents(): Promise<{ auditEvents: AuditEvent[] }> {
  const res = await fetch(`${BASE_URL}/admin/audit-events`);
  return res.json();
}

export async function resetDemoData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/admin/reset-demo`, {
    method: 'POST'
  });
  return res.json();
}
