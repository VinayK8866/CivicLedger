import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { db } from '../db.js';
import { aiService } from '../aiService.js';

describe('CivicTwin + ProofMesh Test Suite', () => {
  beforeEach(() => {
    // Reset database to pristine seeded demonstration state before tests
    db.resetToDemo();
  });

  describe('1. Dashboard Aggregations & Health', () => {
    it('returns accurate summary statistics matching stored records', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.uniqueIncidents).toBe(4);
      expect(res.body.summary.totalReports).toBeGreaterThanOrEqual(6);
      expect(res.body.summary.recurringHotspots).toBe(3);
      expect(res.body.summary.verifiedRate).toBeGreaterThan(0);
    });

    it('returns platform health and AI inference status', async () => {
      const res = await request(app).get('/api/admin/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.totalIncidents).toBe(4);
      expect(res.body.totalClaims).toBeGreaterThanOrEqual(5);
    });
  });

  describe('2. Incident Reporting & Duplicate/Recurrence Candidate Matching', () => {
    it('validates required fields with Zod schema', async () => {
      const res = await request(app).post('/api/reports').send({
        title: 'Too short', // requires >= 5
        description: 'short' // requires >= 10
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('ingests valid report, extracts structured candidate claims, and matches recurring hotspot', async () => {
      const res = await request(app).post('/api/reports').send({
        title: 'Fresh waterlogging outside St. Jude clinic gate',
        description: 'Heavy rain caused water pool 35cm deep outside clinic gate. Drain inlet blocked again.',
        category: 'waterlogging',
        reportedLocation: {
          lat: 12.9716,
          lng: 77.5946,
          address: 'Elm St & 4th Cross Rd',
          landmark: 'St. Jude Community Health Clinic',
          neighborhood: 'Greenfield Ward'
        },
        observedAt: new Date().toISOString(),
        severity: 'high',
        mediaReferences: ['/demo-assets/elm_waterlog_jan8.jpg']
      });

      expect(res.status).toBe(201);
      expect(res.body.report).toBeDefined();
      expect(res.body.report.id).toMatch(/^rep-/);
      expect(res.body.candidateMatches).toBeInstanceOf(Array);
      expect(res.body.candidateMatches.length).toBeGreaterThan(0);

      // Verify that Elm St waterlogging incident is identified as top match
      const topMatch = res.body.candidateMatches[0];
      expect(topMatch.candidateIncidentId).toBe('inc-elm-waterlog');
      expect(topMatch.similarityScore).toBeGreaterThan(0.7);
      expect(topMatch.rationale).toBeDefined();
    });

    it('functions gracefully with heuristic extraction when Gemini API is unavailable', async () => {
      const result = await aiService.extractIncidentData(
        'Broken streetlight in alley',
        'Light pole 12 is flickering and completely dark at night',
        'streetlights'
      );
      expect(result.extraction.category).toBe('streetlights');
      expect(result.extraction.visibleConditions.length).toBeGreaterThan(0);
      expect(result.extraction.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('3. ProofMesh Evidence Graph & Relationship Integrity', () => {
    it('returns typed graph nodes and labeled edges matching persisted relations', async () => {
      const res = await request(app).get('/api/evidence/graph');
      expect(res.status).toBe(200);
      expect(res.body.nodes).toBeInstanceOf(Array);
      expect(res.body.edges).toBeInstanceOf(Array);
      expect(res.body.nodes.length).toBeGreaterThanOrEqual(10);

      // Check for distinct node types
      const types = new Set(res.body.nodes.map((n: any) => n.type));
      expect(types.has('incidentNode')).toBe(true);
      expect(types.has('claimNode')).toBe(true);
      expect(types.has('evidenceNode')).toBe(true);
      expect(types.has('interventionNode')).toBe(true);

      // Check for CONTRADICTS edge
      const contradictEdge = res.body.edges.find((e: any) => e.label === 'CONTRADICTS');
      expect(contradictEdge).toBeDefined();
      expect(contradictEdge.style.stroke).toBe('#ef4444');
    });

    it('supports incident-scoped subgraph filtering', async () => {
      const res = await request(app).get('/api/evidence/graph?incidentId=inc-elm-waterlog');
      expect(res.status).toBe(200);
      const incNodes = res.body.nodes.filter((n: any) => n.type === 'incidentNode');
      expect(incNodes.length).toBe(1);
      expect(incNodes[0].id).toBe('inc-elm-waterlog');
    });
  });

  describe('4. Claim Verification, Role Authorization & Audit Trail', () => {
    it('enforces role authorization: resident cannot verify claim', async () => {
      // Switch active demo session to resident
      await request(app).post('/api/auth/demo-session').send({ role: 'resident' });

      const res = await request(app)
        .post('/api/claims/clm-elm-resolved/verify')
        .send({
          decision: 'disputed',
          rationale: 'Resident observation note',
          evidenceReviewed: ['evi-elm-recur-photo']
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('allows community verifier to transition claim status with signed rationale', async () => {
      // Switch to verifier
      await request(app).post('/api/auth/demo-session').send({ role: 'verifier' });

      const res = await request(app)
        .post('/api/claims/clm-elm-upstream-cause/verify')
        .send({
          decision: 'supported',
          rationale: 'Verified multispectral satellite impervious pavement index showing 14000 sq ft added.',
          evidenceReviewed: ['evi-elm-satellite-paving']
        });

      expect(res.status).toBe(200);
      expect(res.body.claim.status).toBe('supported');

      // Verify audit event was permanently recorded
      const auditRes = await request(app).get('/api/admin/audit-events');
      expect(auditRes.status).toBe(200);
      const verifyEvent = auditRes.body.auditEvents.find(
        (e: any) => e.action === 'CLAIM_VERIFIED' && e.entityId === 'clm-elm-upstream-cause'
      );
      expect(verifyEvent).toBeDefined();
      expect(verifyEvent.actorRole).toBe('verifier');
    });
  });

  describe('5. The Unknown Detector & Gap-to-Task Conversion', () => {
    it('identifies critical missing evidence gaps for waterlogging incidents', async () => {
      const res = await request(app).get('/api/incidents/inc-elm-waterlog/gaps');
      expect(res.status).toBe(200);
      expect(res.body.gaps).toBeInstanceOf(Array);
      expect(res.body.gaps.length).toBeGreaterThan(0);

      const highGap = res.body.gaps.find((g: any) => g.importance === 'high');
      expect(highGap).toBeDefined();
      expect(highGap.recommendedAction).toBeDefined();
      expect(highGap.suggestedRole).toBeDefined();
    });

    it('converts an evidence gap into an actionable Community Action task', async () => {
      const res = await request(app).post('/api/gaps/gap-elm-cctv/convert-action');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.action).toBeDefined();
      expect(res.body.action.title).toContain('Address Unknown');
      expect(res.body.gap.status).toBe('converted');

      // Verify action is present in community action board
      const actionsRes = await request(app).get('/api/actions');
      const matchedAction = actionsRes.body.actions.find((a: any) => a.id === res.body.action.id);
      expect(matchedAction).toBeDefined();
    });
  });

  describe('6. Prevention Lab Simulation & Outcome Tracking', () => {
    it('calculates transparent multi-attribute simulation impact scores', async () => {
      const res = await request(app).post('/api/interventions/simulate').send({
        incidentId: 'inc-elm-waterlog',
        title: 'Bio-retention Swale Pilot',
        description: 'Vegetated swale filter',
        estimatedCost: 12500,
        expectedEffectiveness: 75,
        implementationWeeks: 3,
        assumptions: ['Verge excavation permitted'],
        evidenceReferences: ['evi-elm-verifier-probe']
      });

      expect(res.status).toBe(200);
      expect(res.body.simulation.impactScore).toBeGreaterThan(0);
      expect(res.body.simulation.estimatedRecurrenceReduction).toBeGreaterThan(0);
      expect(res.body.simulation.illustrativeNotice).toBeDefined();
    });

    it('records longitudinal outcome measurements with correlation vs causation limitation', async () => {
      const res = await request(app)
        .post('/api/interventions/int-elm-bioswale/measurements')
        .send({
          metric: 'Surface Flood Stagnation Duration',
          baselineValue: 4.8,
          observedValue: 0.9,
          unit: 'hours',
          measurementMethod: 'Acoustic sensor logger and verifier site probe',
          limitations: 'Rainfall was 20mm; wind velocity was higher than baseline test.',
          correlationVsCausationNote: 'Observed reduction strongly correlates with swale intake, but pre-storm soil moisture was drier.',
          conclusion: 'target_met'
        });

      expect(res.status).toBe(201);
      expect(res.body.measurement).toBeDefined();
      expect(res.body.measurement.conclusion).toBe('target_met');
      expect(res.body.measurement.observedValue).toBe(0.9);
    });
  });

  describe('7. Demonstration Reset', () => {
    it('restores initial Greenfield Ward synthetic records on reset', async () => {
      const res = await request(app).post('/api/admin/reset-demo');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await request(app).get('/api/incidents');
      expect(check.body.incidents.length).toBe(4);
    });
  });

  describe('8. Sentiment Analysis & Incident Criticality Scoring', () => {
    it('prioritizes severe non-recurring hazard above low-severity recurring issues', async () => {
      const res = await request(app).get('/api/incidents');
      expect(res.status).toBe(200);
      const incidents = res.body.incidents;
      
      // Top incident should be the critical non-recurring emergency cable incident
      const topIncident = incidents[0];
      expect(topIncident.id).toBe('inc-live-cable');
      expect(topIncident.recurrenceCount).toBe(1); // Non-recurring!
      expect(topIncident.riskLevel).toBe('critical');
      expect(topIncident.criticalityScore).toBeGreaterThanOrEqual(90);
      expect(topIncident.priorityRank).toBe('critical_emergency');
      expect(topIncident.distressSentimentScore).toBeGreaterThan(90);
    });

    it('extracts high distress sentiment score for panic and life hazard reports', async () => {
      const distressText = "EMERGENCY: Live severed wire sparking into a water puddle right outside Greenfield Elementary. Children are crossing, severe panic and risk of fatal electrocution!";
      const sentiment = await aiService.analyzeReportSentiment(distressText);
      expect(sentiment.distressScore).toBeGreaterThanOrEqual(80);
      expect(sentiment.urgencyScore).toBeGreaterThanOrEqual(80);
      expect(sentiment.sentiment).toBe('critical_panic');
      expect(sentiment.keyDistressFactors.length).toBeGreaterThan(0);
    });
  });
});
