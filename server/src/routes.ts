import express, { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { aiService } from './aiService.js';
import {
  IncidentCategory,
  SeverityLevel,
  UserRole,
  IncidentReport,
  CanonicalIncident,
  Claim,
  EvidenceItem,
  EvidenceRelation,
  VerificationDecision,
  Intervention,
  OutcomeMeasurement,
  CommunityAction,
  EvidenceGap
} from './types.js';

export const router = express.Router();

// Current active session (in-memory demo role state, default to Coordinator or Verifier)
let currentDemoUser = {
  id: 'usr-coordinator-tariq',
  displayName: 'Tariq Al-Mansoor',
  email: 'tariq.mansoor@civictwin.demo',
  role: 'coordinator' as UserRole
};

// -------------------------------------------------------------
// Auth & Demo Session
// -------------------------------------------------------------
router.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    user: currentDemoUser,
    isDemo: true,
    availableRoles: ['resident', 'verifier', 'coordinator', 'admin']
  });
});

const DemoSessionSchema = z.object({
  role: z.enum(['resident', 'verifier', 'coordinator', 'admin'])
});

router.post('/auth/demo-session', (req: Request, res: Response) => {
  const parsed = DemoSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid role specified', details: parsed.error });
  }

  const role = parsed.data.role;
  const match = db.users.find(u => u.role === role);
  if (match) {
    currentDemoUser = {
      id: match.id,
      displayName: match.displayName,
      email: match.email,
      role: match.role
    };
  } else {
    currentDemoUser = {
      id: `usr-demo-${role}`,
      displayName: `Demo ${role.toUpperCase()}`,
      email: `${role}@civictwin.demo`,
      role
    };
  }

  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'ROLE_SWITCHED', 'User', currentDemoUser.id, { newRole: role });

  res.json({ success: true, user: currentDemoUser });
});

// -------------------------------------------------------------
// Incident Reports
// -------------------------------------------------------------
const CreateReportSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
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
  reportedLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
    landmark: z.string().optional(),
    neighborhood: z.string().optional()
  }),
  observedAt: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  mediaReferences: z.array(z.string()).default([]),
  impactDescription: z.string().optional(),
  notes: z.string().optional()
});

router.post('/reports', async (req: Request, res: Response) => {
  const parsed = CreateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const data = parsed.data;
  const newReportId = `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  // Run AI Extraction
  const { extraction, mode } = await aiService.extractIncidentData(
    data.title,
    data.description,
    data.category,
    data.reportedLocation
  );

  // Check for candidate incident matches (duplicate/recurrence detection)
  const candidateMatches = aiService.matchCandidateIncidents(
    data.reportedLocation,
    data.category,
    data.title,
    data.description,
    data.observedAt,
    db.incidents
  );

  const topMatch = candidateMatches[0];

  const newReport: IncidentReport = {
    id: newReportId,
    submittedBy: currentDemoUser.id,
    submitterName: currentDemoUser.displayName,
    submitterRole: currentDemoUser.role,
    title: data.title,
    description: data.description,
    category: data.category,
    reportedLocation: data.reportedLocation,
    observedAt: data.observedAt,
    submittedAt: new Date().toISOString(),
    severity: data.severity,
    mediaReferences: data.mediaReferences,
    impactDescription: data.impactDescription,
    notes: data.notes,
    moderationStatus: 'approved',
    aiProcessingStatus: mode === 'gemini' ? 'completed' : 'fallback',
    aiExtraction: extraction,
    matchedIncidentId: topMatch?.similarityScore > 0.7 ? topMatch.candidateIncidentId : undefined,
    matchingRationale: topMatch?.rationale
  };

  db.reports.unshift(newReport);

  // If high confidence match, also record Observation on canonical incident
  if (topMatch && topMatch.similarityScore > 0.75) {
    const canonical = db.incidents.find(i => i.id === topMatch.candidateIncidentId);
    if (canonical) {
      canonical.reportIds.push(newReportId);
      canonical.lastObservedAt = data.observedAt;
      if (topMatch.matchType === 'recurring') {
        canonical.recurrenceCount += 1;
        canonical.status = 'recurring';
      }
      db.observations.push({
        id: `obs-${Date.now().toString(36)}`,
        incidentId: canonical.id,
        reportId: newReportId,
        observedAt: data.observedAt,
        condition: data.description,
        sourceType: 'resident_report',
        location: data.reportedLocation,
        verificationStatus: 'unverified',
        submittedBy: currentDemoUser.id
      });

      // Recalculate criticality and sentiment urgency
      const relReports = db.reports.filter(r => canonical.reportIds.includes(r.id));
      const crit = aiService.calculateIncidentCriticality(canonical, relReports);
      canonical.criticalityScore = crit.criticalityScore;
      canonical.distressSentimentScore = crit.distressSentimentScore;
      canonical.priorityRank = crit.priorityRank;
      canonical.urgencyRationale = crit.urgencyRationale;
    }
  } else {
    // Unmatched: Create a new canonical incident with sentiment-aware criticality score
    const newIncId = `inc-${Date.now().toString(36)}`;
    const crit = aiService.calculateIncidentCriticality({
      category: data.category,
      riskLevel: data.severity,
      recurrenceCount: 1,
      title: data.title,
      currentAssessment: data.description
    }, [newReport]);

    const newCanonical: CanonicalIncident = {
      id: newIncId,
      title: data.title,
      category: data.category,
      canonicalLocation: data.reportedLocation,
      firstObservedAt: data.observedAt,
      lastObservedAt: data.observedAt,
      currentAssessment: data.description,
      recurrenceCount: 1,
      resolvedCount: 0,
      status: 'active',
      riskLevel: data.severity,
      criticalityScore: crit.criticalityScore,
      distressSentimentScore: crit.distressSentimentScore,
      priorityRank: crit.priorityRank,
      urgencyRationale: crit.urgencyRationale,
      tags: [data.category],
      reportIds: [newReportId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.incidents.unshift(newCanonical);
    newReport.matchedIncidentId = newIncId;

    db.observations.push({
      id: `obs-${Date.now().toString(36)}`,
      incidentId: newIncId,
      reportId: newReportId,
      observedAt: data.observedAt,
      condition: data.description,
      sourceType: 'resident_report',
      location: data.reportedLocation,
      verificationStatus: 'unverified',
      submittedBy: currentDemoUser.id
    });
  }

  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'REPORT_SUBMITTED', 'IncidentReport', newReportId, {
    category: data.category,
    matchedIncident: topMatch?.candidateIncidentId
  });

  await db.persist();

  res.status(201).json({
    report: newReport,
    candidateMatches,
    aiMode: mode
  });
});

router.get('/reports', (req: Request, res: Response) => {
  const { category, search, limit } = req.query;
  let items = [...db.reports];

  if (category && typeof category === 'string' && category !== 'all') {
    items = items.filter(r => r.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }

  if (limit && !isNaN(Number(limit))) {
    items = items.slice(0, Number(limit));
  }

  res.json({ reports: items, total: items.length });
});

router.get('/reports/:id', (req: Request, res: Response) => {
  const report = db.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ report });
});

// -------------------------------------------------------------
// Canonical Incidents & CivicTwin Memory
// -------------------------------------------------------------
router.get('/incidents', (req: Request, res: Response) => {
  const { category, status, search, risk, sort } = req.query;
  let items = [...db.incidents];

  if (category && typeof category === 'string' && category !== 'all') {
    items = items.filter(i => i.category === category);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    items = items.filter(i => i.status === status);
  }

  if (risk && typeof risk === 'string' && risk !== 'all') {
    items = items.filter(i => i.riskLevel === risk);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.currentAssessment.toLowerCase().includes(q));
  }

  // Sorting: by criticality (default), recurrence, or recency
  if (sort === 'recurrence') {
    items.sort((a, b) => b.recurrenceCount - a.recurrenceCount);
  } else if (sort === 'recent') {
    items.sort((a, b) => new Date(b.lastObservedAt).getTime() - new Date(a.lastObservedAt).getTime());
  } else {
    // Default to composite criticality & distress sentiment score
    items.sort((a, b) => (b.criticalityScore ?? 50) - (a.criticalityScore ?? 50));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.currentAssessment.toLowerCase().includes(q));
  }

  res.json({ incidents: items, total: items.length });
});

router.get('/incidents/:id', (req: Request, res: Response) => {
  const incident = db.incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  // Gather related items
  const reports = db.reports.filter(r => incident.reportIds.includes(r.id) || r.matchedIncidentId === incident.id);
  const observations = db.observations.filter(o => o.incidentId === incident.id);
  const claims = db.claims.filter(c => c.incidentId === incident.id);
  const evidenceGaps = db.evidenceGaps.filter(g => g.incidentId === incident.id);
  const interventions = db.interventions.filter(inv => inv.incidentId === incident.id);

  // Evidence items related to claims of this incident
  const claimIds = claims.map(c => c.id);
  const evidenceItems = db.evidence.filter(e => e.associatedClaimIds.some(cid => claimIds.includes(cid)));

  res.json({
    incident,
    reports,
    observations,
    claims,
    evidenceItems,
    evidenceGaps,
    interventions
  });
});

router.get('/incidents/:id/timeline', (req: Request, res: Response) => {
  const incidentId = req.params.id;
  const observations = db.observations
    .filter(o => o.incidentId === incidentId)
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());

  res.json({ timeline: observations });
});

/**
 * Escalate subordinate non-response / negligence to higher supervisory authority
 */
router.post('/incidents/:id/escalate', async (req: Request, res: Response) => {
  const incident = db.incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { reason, evidenceNotes } = req.body;
  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({ error: 'A specific explanation of subordinate non-response or inaction is required (min 5 chars).' });
  }

  // Ensure accountability structure exists
  if (!incident.accountability) {
    incident.accountability = {
      department: 'Municipal Public Works & Civic Safety Directorate',
      assignedOfficer: {
        id: 'cust-field-default',
        name: 'Er. Field Officer',
        title: 'Junior Ward Operations Engineer',
        department: 'Field Operations',
        level: 'subordinate_field_officer',
        contactEmail: 'field.ops@greenfieldward.gov.in',
        contactPhone: '+91 98450 00000'
      },
      supervisoryAuthority: {
        id: 'cust-commissioner',
        name: 'Dr. Nandini Sundaram, IAS',
        title: 'Chief Municipal Commissioner & Public Safety Ombudsman',
        department: 'Municipal Corporation Executive Directorate',
        level: 'chief_commissioner',
        contactEmail: 'commissioner@greenfieldward.gov.in',
        contactPhone: '+91 94480 00100'
      },
      assignedAt: incident.createdAt,
      slaHours: 24,
      slaDeadline: new Date(Date.now() - 3600000).toISOString(),
      slaStatus: 'sla_breached',
      inactionDays: 2,
      escalationHistory: []
    };
  }

  const escId = `esc-${Date.now().toString(36)}`;
  const daysUnresponsive = Math.max(1, incident.accountability.inactionDays || 2);
  const breachedHours = incident.accountability.slaHours ? incident.accountability.slaHours * 2 : 48;

  const escalationRecord = {
    id: escId,
    incidentId: incident.id,
    escalatedAt: new Date().toISOString(),
    escalatedBy: currentDemoUser.id,
    escalatedByName: `${currentDemoUser.displayName} (${currentDemoUser.role.toUpperCase()})`,
    fromOfficial: incident.accountability.assignedOfficer,
    toOfficial: incident.accountability.supervisoryAuthority,
    reason: reason.trim(),
    daysUnresponsive,
    slaBreachedHours: breachedHours,
    evidencePacketSummary: `ProofMesh Verified Evidence Packet Attached: ${incident.reportIds.length} corroborating resident reports, Criticality Score ${incident.criticalityScore ?? 50}/100 (${incident.priorityRank}), Citizen Distress Sentiment ${incident.distressSentimentScore ?? 45}%. ${evidenceNotes ? `Additional notes: ${evidenceNotes}` : ''}`,
    status: 'pending_commissioner_review' as const,
    supervisoryActionNotes: `FORMAL VIGILANCE TICKET ${escId.toUpperCase()} DISPATCHED: Routed to Commissioner's Executive Desk. Subordinate ${incident.accountability.assignedOfficer.name} flagged for non-response audit. Priority review mandated within 24h.`
  };

  incident.accountability.slaStatus = 'escalated_to_superior';
  incident.accountability.escalationHistory.unshift(escalationRecord);
  incident.updatedAt = new Date().toISOString();

  // Audit event in civic ledger
  db.addAudit(
    currentDemoUser.id,
    currentDemoUser.displayName,
    currentDemoUser.role,
    'SUBORDINATE_INACTION_ESCALATED',
    'CanonicalIncident',
    incident.id,
    {
      escalationId: escId,
      fromOfficial: incident.accountability.assignedOfficer.name,
      toOfficial: incident.accountability.supervisoryAuthority.name,
      reason: reason.trim(),
      daysUnresponsive
    }
  );

  await db.persist();

  res.status(201).json({
    success: true,
    message: `Subordinate non-response successfully escalated to Higher Authority (${incident.accountability.supervisoryAuthority.name}).`,
    escalation: escalationRecord,
    incident
  });
});

// -------------------------------------------------------------
// ProofMesh Evidence Graph & Relations
// -------------------------------------------------------------
router.get('/evidence/graph', (req: Request, res: Response) => {
  const { incidentId, typeFilter, statusFilter } = req.query;

  let activeIncidents = [...db.incidents];
  let activeClaims = [...db.claims];
  let activeEvidence = [...db.evidence];
  let activeInterventions = [...db.interventions];
  let activeRelations = [...db.relations];

  if (incidentId && typeof incidentId === 'string' && incidentId !== 'all') {
    activeIncidents = activeIncidents.filter(i => i.id === incidentId);
    activeClaims = activeClaims.filter(c => c.incidentId === incidentId);
    activeInterventions = activeInterventions.filter(inv => inv.incidentId === incidentId);

    const relevantClaimIds = new Set(activeClaims.map(c => c.id));
    activeEvidence = activeEvidence.filter(e => e.associatedClaimIds.some(cid => relevantClaimIds.has(cid)));

    const allEntityIds = new Set([
      ...activeIncidents.map(i => i.id),
      ...activeClaims.map(c => c.id),
      ...activeEvidence.map(e => e.id),
      ...activeInterventions.map(inv => inv.id)
    ]);

    activeRelations = activeRelations.filter(
      r => allEntityIds.has(r.sourceEntityId) && allEntityIds.has(r.targetEntityId)
    );
  }

  // Build React Flow graph format
  const nodes: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: { x: number; y: number };
  }> = [];

  const edges: Array<{
    id: string;
    source: string;
    target: string;
    label: string;
    animated?: boolean;
    style?: Record<string, unknown>;
  }> = [];

  let xIdx = 0;
  let yIdx = 0;

  // Add Incident Nodes
  activeIncidents.forEach((inc, idx) => {
    nodes.push({
      id: inc.id,
      type: 'incidentNode',
      data: {
        label: inc.title,
        category: inc.category,
        status: inc.status,
        recurrenceCount: inc.recurrenceCount,
        entityType: 'incident'
      },
      position: { x: 300 * (idx % 3) + 100, y: 50 }
    });
  });

  // Add Claim Nodes
  activeClaims.forEach((clm, idx) => {
    nodes.push({
      id: clm.id,
      type: 'claimNode',
      data: {
        label: clm.claimText,
        status: clm.status,
        claimType: clm.claimType,
        confidence: clm.confidence,
        entityType: 'claim'
      },
      position: { x: 350 * (idx % 3) + 50, y: 250 + Math.floor(idx / 3) * 160 }
    });
  });

  // Add Evidence Nodes
  activeEvidence.forEach((evi, idx) => {
    nodes.push({
      id: evi.id,
      type: 'evidenceNode',
      data: {
        label: evi.description,
        evidenceType: evi.evidenceType,
        sourceCategory: evi.sourceCategory,
        verificationStatus: evi.verificationStatus,
        observedAt: evi.observedAt,
        entityType: 'evidence'
      },
      position: { x: 340 * (idx % 4) + 40, y: 550 + Math.floor(idx / 4) * 160 }
    });
  });

  // Add Intervention Nodes
  activeInterventions.forEach((inv, idx) => {
    nodes.push({
      id: inv.id,
      type: 'interventionNode',
      data: {
        label: inv.title,
        estimatedCost: inv.estimatedCost,
        expectedEffectiveness: inv.expectedEffectiveness,
        status: inv.status,
        entityType: 'intervention'
      },
      position: { x: 400 * idx + 80, y: 900 }
    });
  });

  // Convert relations into Edges
  activeRelations.forEach(rel => {
    const isContradiction = rel.relationType === 'CONTRADICTS';
    edges.push({
      id: rel.id,
      source: rel.sourceEntityId,
      target: rel.targetEntityId,
      label: rel.relationType,
      animated: isContradiction,
      style: {
        stroke: isContradiction ? '#ef4444' : rel.relationType === 'SUPPORTS' ? '#10b981' : '#0284c7',
        strokeWidth: isContradiction ? 2.5 : 1.8
      }
    });
  });

  res.json({
    nodes,
    edges,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    rawRelations: activeRelations
  });
});

router.get('/evidence', (req: Request, res: Response) => {
  res.json({ evidence: db.evidence, total: db.evidence.length });
});

router.get('/evidence/:id', (req: Request, res: Response) => {
  const item = db.evidence.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Evidence item not found' });
  res.json({ evidence: item });
});

// -------------------------------------------------------------
// Claims & Verification Workbench
// -------------------------------------------------------------
router.get('/claims', (req: Request, res: Response) => {
  const { status, incidentId } = req.query;
  let items = [...db.claims];

  if (status && typeof status === 'string' && status !== 'all') {
    items = items.filter(c => c.status === status);
  }

  if (incidentId && typeof incidentId === 'string' && incidentId !== 'all') {
    items = items.filter(c => c.incidentId === incidentId);
  }

  res.json({ claims: items, total: items.length });
});

router.get('/claims/:id', (req: Request, res: Response) => {
  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const supporting = db.evidence.filter(e => claim.supportingEvidenceIds.includes(e.id));
  const contradictory = db.evidence.filter(e => claim.contradictoryEvidenceIds.includes(e.id));
  const decisions = db.verificationDecisions.filter(d => d.claimId === claim.id);

  res.json({ claim, supporting, contradictory, decisions });
});

const VerifyClaimSchema = z.object({
  decision: z.enum(['supported', 'disputed', 'unverified', 'outdated', 'rejected']),
  rationale: z.string().min(10),
  evidenceReviewed: z.array(z.string()).default([])
});

router.post('/claims/:id/verify', async (req: Request, res: Response) => {
  // Only verifier, coordinator or admin can verify
  if (currentDemoUser.role === 'resident') {
    return res.status(403).json({ error: 'Unauthorized: Resident role cannot record formal verification decisions. Please switch to Verifier or Admin.' });
  }

  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const parsed = VerifyClaimSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid verification submission', details: parsed.error });
  }

  const prevStatus = claim.status;
  claim.status = parsed.data.decision;
  claim.updatedAt = new Date().toISOString();

  const decisionRecord: VerificationDecision = {
    id: `vd-${Date.now().toString(36)}`,
    claimId: claim.id,
    reviewerId: currentDemoUser.id,
    reviewerName: currentDemoUser.displayName,
    previousStatus: prevStatus,
    decision: parsed.data.decision,
    rationale: parsed.data.rationale,
    evidenceReviewed: parsed.data.evidenceReviewed,
    createdAt: new Date().toISOString()
  };

  db.verificationDecisions.unshift(decisionRecord);

  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'CLAIM_VERIFIED', 'Claim', claim.id, {
    previousStatus: prevStatus,
    newStatus: claim.status,
    rationale: parsed.data.rationale
  });

  await db.persist();

  res.json({ success: true, claim, decision: decisionRecord });
});

router.post('/claims/:id/analyze', (req: Request, res: Response) => {
  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  // Find other claims on same incident
  const siblingClaims = db.claims.filter(c => c.incidentId === claim.incidentId && c.id !== claim.id);
  const analyses = siblingClaims.map(sibling => aiService.analyzeClaimContradiction(claim, sibling, db.evidence));

  res.json({
    claim,
    siblingAnalyses: analyses
  });
});

// -------------------------------------------------------------
// The Unknown Detector ("What We Still Don't Know")
// -------------------------------------------------------------
router.get('/incidents/:id/gaps', (req: Request, res: Response) => {
  const incident = db.incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  let gaps = db.evidenceGaps.filter(g => g.incidentId === incident.id);

  if (gaps.length === 0) {
    const claims = db.claims.filter(c => c.incidentId === incident.id);
    const evidence = db.evidence.filter(e => e.associatedClaimIds.some(cid => claims.map(c => c.id).includes(cid)));
    const generated = aiService.detectEvidenceGaps(incident, claims, evidence);
    db.evidenceGaps.push(...generated);
    gaps = generated;
    void db.persist();
  }

  res.json({ gaps });
});

// Convert gap into a Community Action
router.post('/gaps/:id/convert-action', async (req: Request, res: Response) => {
  const gap = db.evidenceGaps.find(g => g.id === req.params.id);
  if (!gap) return res.status(404).json({ error: 'Evidence gap not found' });

  const newAction: CommunityAction = {
    id: `act-${Date.now().toString(36)}`,
    incidentId: gap.incidentId,
    gapId: gap.id,
    title: `Address Unknown: ${gap.description.substring(0, 60)}...`,
    description: gap.recommendedAction,
    assignedTo: currentDemoUser.id,
    assignedToName: currentDemoUser.displayName,
    assignedRole: gap.suggestedRole,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'todo',
    priority: gap.importance === 'high' ? 'high' : 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  gap.status = 'converted';
  gap.convertedToActionId = newAction.id;

  db.communityActions.unshift(newAction);

  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'GAP_CONVERTED_TO_ACTION', 'EvidenceGap', gap.id, {
    actionId: newAction.id
  });

  await db.persist();

  res.json({ success: true, action: newAction, gap });
});

// -------------------------------------------------------------
// Prevention Lab & Simulation
// -------------------------------------------------------------
const SimulateInterventionSchema = z.object({
  incidentId: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedCost: z.number(),
  expectedEffectiveness: z.number().min(0).max(100),
  implementationWeeks: z.number(),
  assumptions: z.array(z.string()).default([]),
  evidenceReferences: z.array(z.string()).default([])
});

router.post('/interventions/simulate', (req: Request, res: Response) => {
  const parsed = SimulateInterventionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Simulation validation failed', details: parsed.error });
  }

  const data = parsed.data;
  const incident = db.incidents.find(i => i.id === data.incidentId);
  const recurrence = incident ? incident.recurrenceCount : 3;

  const simResult = aiService.simulateInterventionImpact({
    id: 'sim-temp',
    incidentId: data.incidentId,
    title: data.title,
    description: data.description,
    estimatedCost: data.estimatedCost,
    expectedOutcome: 'Target reduction in recurrence hazard',
    expectedEffectiveness: data.expectedEffectiveness,
    implementationWeeks: data.implementationWeeks,
    assumptions: data.assumptions,
    evidenceReferences: data.evidenceReferences,
    affectedLocations: [incident?.canonicalLocation.address || 'Greenfield Ward'],
    status: 'proposed',
    createdBy: currentDemoUser.id,
    createdAt: new Date().toISOString(),
    evaluationPlan: {
      metric: 'Recurrence frequency',
      baselineValue: recurrence,
      targetValue: Math.max(0, recurrence - 2),
      unit: 'episodes/quarter',
      measurementMethod: 'Post-intervention observation log',
      evaluationWindowDays: 60
    }
  }, recurrence);

  res.json({ simulation: simResult });
});

router.get('/interventions', (req: Request, res: Response) => {
  const { incidentId } = req.query;
  let items = [...db.interventions];
  if (incidentId && typeof incidentId === 'string' && incidentId !== 'all') {
    items = items.filter(inv => inv.incidentId === incidentId);
  }
  res.json({ interventions: items });
});

router.post('/interventions', async (req: Request, res: Response) => {
  const parsed = SimulateInterventionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid intervention data', details: parsed.error });
  }

  const data = parsed.data;
  const newId = `int-${Date.now().toString(36)}`;

  const newIntervention: Intervention = {
    id: newId,
    incidentId: data.incidentId,
    title: data.title,
    description: data.description,
    assumptions: data.assumptions,
    estimatedCost: data.estimatedCost,
    expectedOutcome: `Target ${data.expectedEffectiveness}% reduction in recurrence hazard.`,
    expectedEffectiveness: data.expectedEffectiveness,
    implementationWeeks: data.implementationWeeks,
    affectedLocations: ['Target incident site'],
    evidenceReferences: data.evidenceReferences,
    status: 'proposed',
    createdBy: currentDemoUser.id,
    createdAt: new Date().toISOString(),
    evaluationPlan: {
      metric: 'Surface Incident Duration',
      baselineValue: 4.0,
      targetValue: 1.0,
      unit: 'hours',
      measurementMethod: 'Follow-up verifier inspection and citizen log',
      evaluationWindowDays: 45
    }
  };

  db.interventions.unshift(newIntervention);

  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'INTERVENTION_PROPOSED', 'Intervention', newId, {
    title: data.title,
    cost: data.estimatedCost
  });

  await db.persist();

  res.status(201).json({ intervention: newIntervention });
});

// Outcome measurement recording
const RecordMeasurementSchema = z.object({
  metric: z.string(),
  baselineValue: z.number(),
  observedValue: z.number(),
  unit: z.string(),
  measurementMethod: z.string(),
  limitations: z.string(),
  correlationVsCausationNote: z.string(),
  conclusion: z.enum(['target_met', 'partial_improvement', 'no_change', 'degraded', 'inconclusive'])
});

router.post('/interventions/:id/measurements', async (req: Request, res: Response) => {
  const intervention = db.interventions.find(i => i.id === req.params.id);
  if (!intervention) return res.status(404).json({ error: 'Intervention not found' });

  const parsed = RecordMeasurementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error });
  }

  const measurement: OutcomeMeasurement = {
    id: `out-${Date.now().toString(36)}`,
    interventionId: intervention.id,
    metric: parsed.data.metric,
    baselineValue: parsed.data.baselineValue,
    observedValue: parsed.data.observedValue,
    unit: parsed.data.unit,
    measurementMethod: parsed.data.measurementMethod,
    measuredAt: new Date().toISOString(),
    evidenceReferences: intervention.evidenceReferences,
    limitations: parsed.data.limitations,
    correlationVsCausationNote: parsed.data.correlationVsCausationNote,
    conclusion: parsed.data.conclusion
  };

  db.outcomeMeasurements.unshift(measurement);

  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'OUTCOME_MEASUREMENT_RECORDED', 'OutcomeMeasurement', measurement.id, {
    interventionId: intervention.id,
    conclusion: measurement.conclusion
  });

  await db.persist();

  res.status(201).json({ measurement });
});

router.get('/interventions/:id/measurements', (req: Request, res: Response) => {
  const items = db.outcomeMeasurements.filter(m => m.interventionId === req.params.id);
  res.json({ measurements: items });
});

// -------------------------------------------------------------
// Community Action Board
// -------------------------------------------------------------
router.get('/actions', (req: Request, res: Response) => {
  res.json({ actions: db.communityActions });
});

router.patch('/actions/:id', async (req: Request, res: Response) => {
  const action = db.communityActions.find(a => a.id === req.params.id);
  if (!action) return res.status(404).json({ error: 'Action not found' });

  if (req.body.status) action.status = req.body.status;
  if (req.body.priority) action.priority = req.body.priority;
  action.updatedAt = new Date().toISOString();

  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'ACTION_UPDATED', 'CommunityAction', action.id, {
    newStatus: action.status
  });

  await db.persist();

  res.json({ action });
});

// -------------------------------------------------------------
// Intelligence Dashboard
// -------------------------------------------------------------
router.get('/dashboard/summary', (req: Request, res: Response) => {
  const totalReports = db.reports.length;
  const uniqueIncidents = db.incidents.length;
  const recurringHotspots = db.incidents.filter(i => i.status === 'recurring' || i.recurrenceCount > 1).length;
  const claimsAwaitingReview = db.claims.filter(c => c.status === 'pending_review' || c.status === 'draft').length;
  const unresolvedConflicts = db.claims.filter(c => c.status === 'disputed').length;
  const openCommunityActions = db.communityActions.filter(a => a.status !== 'completed').length;
  const verifiedCount = db.claims.filter(c => c.status === 'supported').length;
  const verifiedRate = db.claims.length > 0 ? Math.round((verifiedCount / db.claims.length) * 100) : 0;

  res.json({
    summary: {
      totalReports,
      uniqueIncidents,
      recurringHotspots,
      claimsAwaitingReview,
      unresolvedConflicts,
      openCommunityActions,
      verifiedRate
    }
  });
});

router.get('/dashboard/trends', (req: Request, res: Response) => {
  // Aggregate reports by week/month
  const categoryCounts: Record<string, number> = {};
  db.reports.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const timelineTrend = [
    { date: 'Dec 15', waterlogging: 0, potholes: 2, waste: 1 },
    { date: 'Jan 01', waterlogging: 1, potholes: 2, waste: 2 },
    { date: 'Jan 15', waterlogging: 3, potholes: 3, waste: 3 },
    { date: 'Feb 01', waterlogging: 4, potholes: 3, waste: 5 }
  ];

  res.json({
    categoryCounts,
    timelineTrend,
    statusBreakdown: {
      supported: db.claims.filter(c => c.status === 'supported').length,
      disputed: db.claims.filter(c => c.status === 'disputed').length,
      pending: db.claims.filter(c => c.status === 'pending_review').length,
      unverified: db.claims.filter(c => c.status === 'unverified').length
    }
  });
});

// -------------------------------------------------------------
// Admin & Health
// -------------------------------------------------------------
router.get('/admin/audit-events', (req: Request, res: Response) => {
  res.json({ auditEvents: db.auditEvents.slice(0, 50) });
});

router.get('/admin/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    liveAI: aiService.isLiveAIAvailable(),
    totalIncidents: db.incidents.length,
    totalClaims: db.claims.length,
    totalEvidence: db.evidence.length
  });
});

router.post('/admin/reset-demo', async (req: Request, res: Response) => {
  const freshData = db.resetToDemo();
  db.addAudit(currentDemoUser.id, currentDemoUser.displayName, currentDemoUser.role, 'DEMO_DATA_RESET', 'System', 'greenfield-ward');
  await db.persist();
  res.json({ success: true, message: 'Seeded demonstration dataset restored successfully.' });
});
