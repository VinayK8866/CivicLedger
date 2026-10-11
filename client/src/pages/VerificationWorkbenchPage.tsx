import React, { useEffect, useState } from 'react';
import { fetchClaims, fetchClaimDetails, verifyClaim } from '../api';
import { Claim, EvidenceItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  CheckSquare,
  Shield,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  XCircle,
  FileText,
  UserCheck,
  Send,
  Layers,
  ArrowRight
} from 'lucide-react';

export const VerificationWorkbenchPage: React.FC = () => {
  const { role, changeRole } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [claimDetail, setClaimDetail] = useState<{
    claim: Claim;
    supporting: EvidenceItem[];
    contradictory: EvidenceItem[];
    decisions: any[];
  } | null>(null);

  const [decision, setDecision] = useState<'supported' | 'disputed' | 'unverified' | 'outdated' | 'rejected'>('supported');
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  const isAuthorized = role === 'verifier' || role === 'coordinator' || role === 'admin';

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchClaims({ status: statusFilter !== 'all' ? statusFilter : undefined });
        setClaims(res.claims);
        if (res.claims.length > 0 && !selectedClaimId) {
          setSelectedClaimId(res.claims[0].id);
        }
      } catch (err) {
        console.error('Failed to load claims', err);
      }
    }
    void load();
  }, [statusFilter]);

  useEffect(() => {
    async function loadDetail() {
      if (!selectedClaimId) return;
      try {
        const res = await fetchClaimDetails(selectedClaimId);
        setClaimDetail(res);
        setRationale('');
        setSuccessMessage('');
      } catch (err) {
        console.error('Failed to load claim detail', err);
      }
    }
    void loadDetail();
  }, [selectedClaimId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimId) return;
    if (rationale.trim().length < 10) {
      alert('Verification rationale is required (min 10 characters) to ensure complete auditability.');
      return;
    }

    setSubmitting(true);
    try {
      const allEvidenceIds = [
        ...(claimDetail?.supporting.map(e => e.id) || []),
        ...(claimDetail?.contradictory.map(e => e.id) || [])
      ];
      await verifyClaim(selectedClaimId, {
        decision,
        rationale,
        evidenceReviewed: allEvidenceIds
      });

      setSuccessMessage(`Decision "${decision.toUpperCase()}" successfully recorded to immutable audit log.`);
      // Refresh claim list and details
      const refreshed = await fetchClaimDetails(selectedClaimId);
      setClaimDetail(refreshed);
      const res = await fetchClaims({ status: statusFilter !== 'all' ? statusFilter : undefined });
      setClaims(res.claims);
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ProofMesh Verification Workbench</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Community Verifier Interface
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted claims, compare supporting vs conflicting evidence, and record auditable verification rationale.
          </p>
        </div>

        {/* Role Notice */}
        {!isAuthorized && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Currently in Resident mode (Read-only).</span>
            <button
              onClick={() => changeRole('verifier')}
              className="font-bold underline text-amber-900 ml-1"
            >
              Switch to Verifier
            </button>
          </div>
        )}
      </div>

      {/* Main Workbench Layout: Left Queue, Right Review Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Claims Queue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Claims Review Queue</h3>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700"
            >
              <option value="all">All States</option>
              <option value="pending_review">Pending Review</option>
              <option value="disputed">Disputed / In Conflict</option>
              <option value="supported">Supported</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {claims.map(c => {
              const isSelected = c.id === selectedClaimId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClaimId(c.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/40 ring-1 ring-cyan-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {c.claimType}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                    "{c.claimText}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Confidence: {Math.round(c.confidence * 100)}%</span>
                    <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Evidence Review & Verification Decision Form */}
        <div className="lg:col-span-2 space-y-6">
          {claimDetail ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
              {/* Claim Overview */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Selected Claim Evaluation
                  </span>
                  <StatusBadge status={claimDetail.claim.status} />
                </div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  "{claimDetail.claim.claimText}"
                </h2>
                <p className="text-xs text-slate-500">
                  <strong>Normalized Statement:</strong> {claimDetail.claim.normalizedClaim}
                </p>
              </div>

              {/* Multi-Source Evidence Comparison */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Associated Multi-Source Evidence Trail
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supporting Evidence */}
                  <div className="space-y-2 rounded-xl bg-emerald-50/30 border border-emerald-200/80 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Supporting Items ({claimDetail.supporting.length})</span>
                    </div>

                    {claimDetail.supporting.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No supporting items attached.</p>
                    ) : (
                      claimDetail.supporting.map(e => (
                        <div key={e.id} className="rounded-lg bg-white p-2.5 border border-emerald-100 space-y-1 text-xs">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-semibold text-emerald-700 capitalize">{e.sourceCategory}</span>
                            <span className="text-slate-400">{new Date(e.observedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-800">{e.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{e.sourceReference}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Contradictory Evidence */}
                  <div className="space-y-2 rounded-xl bg-rose-50/30 border border-rose-200/80 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Contradictory / Superseding Items ({claimDetail.contradictory.length})</span>
                    </div>

                    {claimDetail.contradictory.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No conflicting items attached.</p>
                    ) : (
                      claimDetail.contradictory.map(e => (
                        <div key={e.id} className="rounded-lg bg-white p-2.5 border border-rose-100 space-y-1 text-xs">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-semibold text-rose-700 capitalize">{e.sourceCategory}</span>
                            <span className="text-slate-400">{new Date(e.observedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-800">{e.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{e.sourceReference}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Past Verification Decisions Audit Trail */}
              {claimDetail.decisions.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Audit Trail: Historical Verification Decisions
                  </h4>
                  <div className="space-y-2">
                    {claimDetail.decisions.map(d => (
                      <div key={d.id} className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-900">{d.reviewerName}</span>
                          <span className="text-slate-500">{new Date(d.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Status Changed To:</span>
                          <StatusBadge status={d.decision} size="sm" />
                        </div>
                        <p className="text-slate-700 italic text-[11px]">"{d.rationale}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Form */}
              <form onSubmit={handleVerify} className="space-y-4 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Record Verification Decision & Rationale
                </h3>

                {successMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'supported', label: 'Supported', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { key: 'disputed', label: 'Disputed', color: 'border-rose-500 bg-rose-50 text-rose-800' },
                    { key: 'pending_review', label: 'Pending', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { key: 'outdated', label: 'Outdated', color: 'border-slate-500 bg-slate-100 text-slate-800' },
                    { key: 'rejected', label: 'Rejected', color: 'border-red-500 bg-red-50 text-red-800' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setDecision(opt.key as any)}
                      className={`p-2 rounded-lg border text-xs font-bold text-center transition-all ${
                        decision === opt.key ? `${opt.color} ring-2 ring-cyan-500 shadow-xs` : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Auditable Verification Rationale *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="State empirical grounds, calibrating references, and why evidence supports or refutes this claim..."
                    value={rationale}
                    onChange={e => setRationale(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    All decisions are timestamped and permanently signed into the audit log.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !isAuthorized}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Signing Decision...' : 'Record Verification Decision'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
              Select a claim from the queue to inspect and verify.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
