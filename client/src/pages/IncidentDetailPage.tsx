import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchIncidentById, convertGapToAction, escalateIncidentToHigherAuthority } from '../api';
import {
  CanonicalIncident,
  IncidentReport,
  Observation,
  Claim,
  EvidenceItem,
  EvidenceGap,
  Intervention
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { IncidentMap } from '../components/IncidentMap';
import {
  MapPin,
  Calendar,
  Clock,
  Flame,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Network,
  FlaskConical,
  ArrowRight,
  TrendingDown,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Scale,
  Building2,
  UserX,
  ShieldAlert,
  Send,
  X,
  FileWarning
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    incident: CanonicalIncident;
    reports: IncidentReport[];
    observations: Observation[];
    claims: Claim[];
    evidenceItems: EvidenceItem[];
    evidenceGaps: EvidenceGap[];
    interventions: Intervention[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'timeline' | 'claims' | 'gaps' | 'prevention' | 'accountability'>('timeline');
  const [loading, setLoading] = useState(true);

  // Subordinate non-response escalation modal state
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [submittingEscalation, setSubmittingEscalation] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetchIncidentById(id);
        setData(res);
      } catch (err) {
        console.error('Failed to load incident detail', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const handleConvertGap = async (gapId: string) => {
    try {
      await convertGapToAction(gapId);
      alert('Missing evidence gap successfully converted into a Community Action task!');
      if (id) {
        const refreshed = await fetchIncidentById(id);
        setData(refreshed);
      }
    } catch (err) {
      alert('Failed to convert gap');
    }
  };

  const handleEscalateSubordinate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !escalateReason.trim()) return;
    try {
      setSubmittingEscalation(true);
      await escalateIncidentToHigherAuthority(id, {
        reason: escalateReason,
        evidenceNotes: escalateNotes
      });
      alert('Official Negligence & Non-Response Escalation Notice dispatched to Chief Municipal Commissioner!');
      setIsEscalateModalOpen(false);
      setEscalateReason('');
      setEscalateNotes('');
      const refreshed = await fetchIncidentById(id);
      setData(refreshed);
      setActiveTab('accountability');
    } catch (err: any) {
      alert(err.message || 'Failed to submit escalation to higher authority');
    } finally {
      setSubmittingEscalation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.incident) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Incident Not Found</h2>
        <Link to="/incidents" className="text-xs font-semibold text-cyan-600 hover:underline">
          Return to Incident Explorer
        </Link>
      </div>
    );
  }

  const { incident, observations, claims, evidenceItems, evidenceGaps, interventions } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/incidents" className="hover:text-slate-800">Incidents</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-800 truncate">{incident.title}</span>
      </div>

      {/* Main Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                {incident.category.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={incident.status} />
              {incident.recurrenceCount > 1 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{incident.recurrenceCount} Historical Episodes</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {incident.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{incident.canonicalLocation.address || 'Greenfield Ward'}</span>
              <span className="text-slate-300">&bull;</span>
              <span>{incident.canonicalLocation.landmark}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/evidence?incidentId=${incident.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
            >
              <Network className="w-3.5 h-3.5 text-cyan-600" />
              <span>View ProofMesh Graph</span>
            </Link>
            <Link
              to="/prevention"
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 shadow-2xs"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Prevention Lab</span>
            </Link>
            <button
              onClick={() => {
                setActiveTab('accountability');
                setIsEscalateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-2xs transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Escalate Non-Response</span>
            </button>
          </div>
        </div>

        {/* Current Assessment */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-1">CivicTwin Current Assessment:</span>
          {incident.currentAssessment}
        </div>

        {/* Municipal Accountability Strip */}
        {incident.accountability && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-slate-100 text-slate-700">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Department</span>
                  <span className="font-semibold text-slate-800">{incident.accountability.department}</span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Assigned Custodian (Subordinate)</span>
                <span className="font-semibold text-slate-800">{incident.accountability.assignedOfficer.name}</span>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Supervisory Authority (Higher Officer)</span>
                <span className="font-semibold text-cyan-800">{incident.accountability.supervisoryAuthority.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {incident.accountability.slaStatus === 'sla_breached' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>SLA Breached ({incident.accountability.inactionDays}d Inactive)</span>
                </span>
              ) : incident.accountability.slaStatus === 'escalated_to_superior' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  <ShieldAlert className="w-3 h-3 text-purple-600" />
                  <span>Escalated to Commissioner</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>Active SLA ({incident.accountability.slaHours}h window)</span>
                </span>
              )}

              <button
                onClick={() => {
                  setActiveTab('accountability');
                  setIsEscalateModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <UserX className="w-3 h-3" />
                <span>Escalate Inaction</span>
              </button>
            </div>
          </div>
        )}

        {/* Civic Urgency & Resident Distress Sentiment Meter */}
        <div className="rounded-xl border border-rose-200/90 bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-600 text-white shadow-2xs">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Civic Urgency & Resident Distress Sentiment Meter
                </h3>
                <p className="text-[11px] text-slate-500">
                  Composite priority scoring balancing acute life safety, citizen sentiment, and historical recurrence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  (incident.criticalityScore ?? 0) >= 85
                    ? 'bg-rose-600 text-white animate-pulse'
                    : (incident.criticalityScore ?? 0) >= 65
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-white'
                }`}
              >
                Criticality: {incident.criticalityScore ?? 50}/100 &bull; {incident.priorityRank ? incident.priorityRank.replace(/_/g, ' ').toUpperCase() : 'STANDARD'}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 space-y-1">
              <span className="text-[10px] font-medium text-slate-500 block">Base Severity (40%)</span>
              <span className="font-bold text-slate-900 text-sm uppercase">{incident.riskLevel}</span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{
                    width: incident.riskLevel === 'critical' ? '100%' : incident.riskLevel === 'high' ? '75%' : '50%'
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white border border-slate-200 p-2.5 space-y-1">
              <span className="text-[10px] font-medium text-slate-500 block">Citizen Distress (35%)</span>
              <span className="font-bold text-rose-600 text-sm">{incident.distressSentimentScore ?? 45}%</span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full"
                  style={{ width: `${incident.distressSentimentScore ?? 45}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white border border-slate-200 p-2.5 space-y-1">
              <span className="text-[10px] font-medium text-slate-500 block">Recurrence History (15%)</span>
              <span className="font-bold text-slate-900 text-sm">
                {incident.recurrenceCount === 1 ? '1x (Isolated)' : `${incident.recurrenceCount}x Episodes`}
              </span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, incident.recurrenceCount * 25)}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white border border-slate-200 p-2.5 space-y-1">
              <span className="text-[10px] font-medium text-slate-500 block">Corridor Risk (10%)</span>
              <span className="font-bold text-cyan-700 text-sm">High Impact Zone</span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
          </div>

          {/* Urgency Rationale & Algorithm Explanation */}
          <div className="rounded-lg bg-rose-50/70 border border-rose-200/70 p-3 text-xs text-rose-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>AI Urgency & Sentiment Rationale:</span>
            </div>
            <p className="leading-relaxed">
              {incident.urgencyRationale ||
                `Calculated composite priority score of ${incident.criticalityScore ?? 50}/100 based on citizen testimonies, physical severity, and corridor vulnerability.`}
            </p>
            <p className="text-[11px] text-rose-800/90 pt-1 border-t border-rose-200/50">
              <strong>Architectural Note:</strong> Non-recurring isolated issues with severe physical hazard and high distress sentiment are elevated to the top of the municipal response queue without requiring repeat episodes.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'timeline'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Multi-Date Observation Timeline ({observations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'claims'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>ProofMesh Claims & Evidence ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'gaps'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>The Unknown Detector ({evidenceGaps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prevention')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'prevention'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Interventions & Outcome Tracking ({interventions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accountability')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'accountability'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Municipal Accountability Chain ({incident.accountability?.escalationHistory.length || 0})</span>
          {incident.accountability?.slaStatus === 'sla_breached' && (
            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              SLA BREACH
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Timeline & Multi-Date Observations */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chronological Neighborhood Memory</h3>
                <p className="text-xs text-slate-500">
                  CivicTwin preserves the entire sequence of observations across dates to reveal chronic cycles and temporary vs durable fixes.
                </p>
              </div>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                Time-Aware History
              </span>
            </div>

            {/* Timeline Feed */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {observations.map((obs, idx) => {
                const isVerifier = obs.sourceType === 'verifier_inspection';
                const isOfficial = obs.sourceType === 'official_record';
                const isRecur = obs.condition.toLowerCase().includes('returned') || obs.condition.toLowerCase().includes('drizzle');

                return (
                  <div key={obs.id} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs ${
                        isRecur ? 'bg-rose-500 ring-2 ring-rose-200' : isVerifier ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                    />

                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-2 hover:bg-white hover:border-slate-300 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {new Date(obs.observedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(obs.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold capitalize text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                            {obs.sourceType.replace(/_/g, ' ')}
                          </span>
                          <StatusBadge status={obs.verificationStatus} size="sm" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {obs.condition}
                      </p>

                      {obs.notes && (
                        <p className="text-[11px] text-slate-500 border-l-2 border-cyan-500 pl-2">
                          <strong>Inspection Note:</strong> {obs.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ProofMesh Claims & Evidence */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-indigo-50/50 border border-indigo-200/60 p-4 text-xs text-indigo-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>ProofMesh Verification Standard</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Claims are distinct factual propositions. Claims can simultaneously hold supporting and contradictory evidence. Every claim must have an auditable rationale before changing verification status.
            </p>
          </div>

          <div className="space-y-4">
            {claims.map(claim => {
              const isDisputed = claim.status === 'disputed';
              const supporting = evidenceItems.filter(e => claim.supportingEvidenceIds.includes(e.id));
              const contradictory = evidenceItems.filter(e => claim.contradictoryEvidenceIds.includes(e.id));

              return (
                <div
                  key={claim.id}
                  className={`rounded-2xl border p-5 shadow-2xs space-y-4 ${
                    isDisputed ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Claim &bull; {claim.claimType}
                      </span>
                      <StatusBadge status={claim.status} />
                    </div>
                    <div className="text-xs text-slate-500">
                      Confidence: <strong>{Math.round(claim.confidence * 100)}%</strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">"{claim.claimText}"</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <strong>Normalized:</strong> {claim.normalizedClaim}
                    </p>
                  </div>

                  {/* Supporting vs Contradictory Evidence grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Supporting Evidence Column */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supporting Evidence ({supporting.length})</span>
                      </div>
                      {supporting.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No supporting evidence attached.</p>
                      ) : (
                        supporting.map(e => (
                          <div key={e.id} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-emerald-800 capitalize">{e.sourceCategory}</span>
                              <span className="text-slate-500">{new Date(e.observedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-800 leading-snug">{e.description}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{e.sourceReference}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Contradictory Evidence Column */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Contradictory Evidence ({contradictory.length})</span>
                      </div>
                      {contradictory.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No contradictory evidence identified.</p>
                      ) : (
                        contradictory.map(e => (
                          <div key={e.id} className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-rose-800 capitalize">{e.sourceCategory}</span>
                              <span className="text-slate-500">{new Date(e.observedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-800 leading-snug">{e.description}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{e.sourceReference}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: The Unknown Detector */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>The Unknown Detector: Identifying Missing Evidence Dimensions</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Instead of generating generic summaries, ProofMesh analyzes whether existing evidence is sufficient to justify decisions. Uncertainty is categorized and converted into concrete community tasks.
            </p>
          </div>

          <div className="space-y-4">
            {evidenceGaps.map(gap => (
              <div
                key={gap.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        gap.importance === 'high'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {gap.importance} Importance
                    </span>
                    {gap.blocksConclusion && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Blocks Conclusion
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      Suggested Role: <strong className="capitalize text-slate-800">{gap.suggestedRole}</strong>
                    </span>
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    Status: <strong className="capitalize text-slate-800">{gap.status}</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">{gap.description}</h4>
                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Practical Next Step:</span>
                    {gap.recommendedAction}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  {gap.status === 'converted' ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      ✓ Converted to Community Action Task
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConvertGap(gap.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors shadow-2xs"
                    >
                      <span>Convert Gap into Community Task</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Interventions & Outcome Tracking */}
      {activeTab === 'prevention' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Proposed Preventive Interventions</h3>
                <p className="text-xs text-slate-500">
                  Grounded in recurring incident evidence and evaluated through empirical outcome measurements.
                </p>
              </div>
              <Link
                to="/prevention"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline"
              >
                <span>Launch Prevention Lab Simulator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {interventions.map(inv => (
                <div key={inv.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{inv.description}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      Est. ${inv.estimatedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-white p-3 border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Effectiveness</span>
                      <span className="text-sm font-bold text-emerald-700">{inv.expectedEffectiveness}%</span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Implementation Time</span>
                      <span className="text-sm font-bold text-slate-900">{inv.implementationWeeks} Weeks</span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                      <span className="text-sm font-bold text-cyan-700 capitalize">{inv.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Outcome Measurement Box */}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-teal-600" />
                        <span>Before vs After Outcome Measurement</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Target Met (75% Reduction)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-2">
                      <div className="rounded-lg bg-white p-3 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Baseline Duration</span>
                        <span className="text-lg font-bold text-rose-600">4.8 Hours</span>
                        <span className="text-[10px] text-slate-400 block">Stagnation after &gt;20mm rainfall</span>
                      </div>
                      <div className="rounded-lg bg-white p-3 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Follow-Up Observed</span>
                        <span className="text-lg font-bold text-emerald-600">1.2 Hours</span>
                        <span className="text-[10px] text-slate-400 block">Post bio-retention swale pilot</span>
                      </div>
                    </div>

                    {/* Correlation vs Causation Notice */}
                    <div className="rounded-lg bg-white/80 border border-teal-200/80 p-3 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1 text-teal-800 font-bold">
                        <Info className="w-3.5 h-3.5" />
                        <span>Correlation vs Causation Limitation</span>
                      </div>
                      <p>
                        The observed reduction in surface flood duration strongly correlates with the swale pilot, but ambient temperature was 3°C higher and rainfall intensity curves differed slightly. Multi-event monitoring is ongoing to verify durable causality.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Municipal Accountability Chain & Subordinate Non-Response Escalation */}
      {activeTab === 'accountability' && (
        <div className="space-y-6">
          {/* Overview Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-cyan-100 text-cyan-800">
                  <Scale className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Municipal Accountability Chain & Subordinate Escalation Protocol
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent administrative custody mapping from frontline field engineers up to the Chief Municipal Commissioner.
                  </p>
                </div>
              </div>

              {incident.accountability && (
                <div className="flex items-center gap-2">
                  {incident.accountability.slaStatus === 'sla_breached' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1 rounded-full animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>SLA BREACHED ({incident.accountability.inactionDays} Days Inactive)</span>
                    </span>
                  ) : incident.accountability.slaStatus === 'escalated_to_superior' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-300 px-3 py-1 rounded-full">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                      <span>ESCALATED TO CHIEF COMMISSIONER</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WITHIN SLA WINDOW ({incident.accountability.slaHours}h)</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Explanatory Banner */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Info className="w-4 h-4 text-cyan-600" />
                <span>The Accountability Guarantee:</span>
              </div>
              <p>
                Every prioritized civic issue is legally assigned to a designated subordinate field officer with a strict turnaround SLA. If the subordinate fails to respond, conducts superficial work, or leaves the problem unsolved, the community has an enforceable mechanism to file a non-response grievance directly with the higher supervisory authority with full ProofMesh evidence attached.
              </p>
            </div>

            {/* Chain of Custody Hierarchy */}
            {incident.accountability ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* 1. Subordinate Assigned Officer */}
                <div className="rounded-xl border border-slate-200 bg-white p-4.5 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Tier 1: Designated Field Custodian
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      Subordinate
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">
                      {incident.accountability.assignedOfficer.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-600">
                      {incident.accountability.assignedOfficer.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {incident.accountability.department}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Official Desk Email:</span>
                      <span className="font-medium text-slate-800">{incident.accountability.assignedOfficer.contactEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Direct Hotline:</span>
                      <span className="font-medium text-slate-800">{incident.accountability.assignedOfficer.contactPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Allotted SLA Window:</span>
                      <span className="font-bold text-slate-900">{incident.accountability.slaHours} Hours</span>
                    </div>
                  </div>

                  {/* Field Performance Alert */}
                  {incident.accountability.slaStatus === 'sla_breached' ? (
                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Subordinate Inaction Warning</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Officer has exceeded the maximum allotted resolution deadline ({incident.accountability.slaHours}h) by {incident.accountability.inactionDays} days without logging verified field progress.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 space-y-1">
                      <span className="font-bold block">Status: Active Resolution Window</span>
                      <p className="text-[11px] text-emerald-800">
                        Officer is within the assigned SLA window. Last note: {incident.accountability.lastOfficerUpdate || 'Work order active.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Higher Supervisory Authority */}
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/20 p-4.5 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-cyan-100 pb-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800">
                      Tier 2: Higher Supervisory Authority
                    </span>
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                      Executive Oversight
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">
                      {incident.accountability.supervisoryAuthority.name}
                    </h4>
                    <p className="text-xs font-semibold text-cyan-900">
                      {incident.accountability.supervisoryAuthority.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Municipal Corporation Executive Directorate & Public Safety Ombudsman
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3 space-y-1.5 text-xs text-slate-600 border border-cyan-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vigilance Desk Email:</span>
                      <span className="font-medium text-slate-800">{incident.accountability.supervisoryAuthority.contactEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Executive Secretariat:</span>
                      <span className="font-medium text-slate-800">{incident.accountability.supervisoryAuthority.contactPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Statutory Oversight Jurisdiction:</span>
                      <span className="font-bold text-cyan-900">Ward 4 Executive & Contractor Oversight</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/90 border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 block">Supervisory Enforcement Powers:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                      <li>Issues binding 24h compliance mandates to delinquent field engineers</li>
                      <li>Authorizes emergency mechanized override contractor deployment</li>
                      <li>Initiates administrative disciplinary reviews in municipal civil service register</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Escalation Trigger Action Banner */}
            <div className="rounded-xl border border-rose-300 bg-gradient-to-r from-rose-50 via-white to-rose-50 p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-rose-600 text-white">
                    <FileWarning className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Is the Subordinate Officer Unresponsive or Unsuccessful?
                  </h4>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  File a formal Non-Response & Negligence Dossier directly with the Chief Municipal Commissioner. Your complaint will include verified ProofMesh evidence, citizen distress telemetry, and days overdue.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(true)}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-500 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Escalate Inaction to Commissioner</span>
              </button>
            </div>
          </div>

          {/* Historical Escalation Dossiers & Audit Trail */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Public Escalation Dossiers & Supervisory Enforcement Ledger</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Permanent audit trail of all non-response notices filed to higher authorities and executive directives issued.
                </p>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Audited Ledger
              </span>
            </div>

            {incident.accountability?.escalationHistory && incident.accountability.escalationHistory.length > 0 ? (
              <div className="space-y-3.5">
                {incident.accountability.escalationHistory.map(esc => (
                  <div
                    key={esc.id}
                    className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                          Grievance Token: {esc.id.toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          Filed by: {esc.escalatedByName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(esc.escalatedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subordinate Cited</span>
                        <span className="font-semibold text-slate-800">{esc.fromOfficial.name} ({esc.fromOfficial.title})</span>
                        <span className="text-[11px] text-rose-600 block font-medium">Overdue: {esc.daysUnresponsive} days inactive</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Higher Authority Addressed</span>
                        <span className="font-semibold text-cyan-900">{esc.toOfficial.name} ({esc.toOfficial.title})</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-purple-100 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block">Citizen Grievance Reason:</span>
                      <p className="leading-relaxed">{esc.reason}</p>
                    </div>

                    <div className="rounded-lg bg-purple-100/60 p-3 text-xs text-purple-950 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-purple-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>Commissioner Directive & Supervisory Action:</span>
                      </div>
                      <p className="leading-relaxed">{esc.supervisoryActionNotes}</p>
                      <p className="text-[10px] text-purple-700 font-medium pt-1">
                        Attached: {esc.evidencePacketSummary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="font-medium text-slate-700">No Prior Non-Response Escalations Filed</p>
                <p className="text-[11px] text-slate-400">
                  If the subordinate fails to act on this problem, click the escalate button above to notify the Chief Commissioner.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Escalation Modal Dialog */}
      {isEscalateModalOpen && incident.accountability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-rose-600 text-white">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Escalate Subordinate Inaction to Higher Authority
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEscalateSubordinate} className="space-y-4 text-xs">
              {/* Summary Cards */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Subordinate Being Reported:</span>
                  <span className="font-bold text-rose-700">
                    {incident.accountability.assignedOfficer.name} ({incident.accountability.assignedOfficer.title})
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Escalation Routed To:</span>
                  <span className="font-bold text-cyan-800">
                    {incident.accountability.supervisoryAuthority.name} (Chief Commissioner)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Incident Severity & Criticality:</span>
                  <span className="font-bold text-slate-900">
                    {incident.criticalityScore}/100 Criticality &bull; {incident.distressSentimentScore}% Distress
                  </span>
                </div>
              </div>

              {/* Reason Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Explanation of Subordinate Inaction or Non-Response <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail specifically how the subordinate engineer failed to respond (e.g., No crew arrived within SLA, temporary repair failed immediately, unacknowledged tickets while danger persists)..."
                  value={escalateReason}
                  onChange={e => setEscalateReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Evidence Notes */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Additional Context or On-Site Observations (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Children crossing daily, water ponding deep, local shopkeepers protesting..."
                  value={escalateNotes}
                  onChange={e => setEscalateNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Automated Bundle Notice */}
              <div className="rounded-lg bg-rose-50/80 border border-rose-200/80 p-3 text-[11px] text-rose-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  The full ProofMesh cryptographic evidence dossier, resident timestamps, and GIS coordinates will be bundled automatically into this vigilance filing.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEscalation || !escalateReason.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submittingEscalation ? (
                    <span>Dispatching Notice...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch to Commissioner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
