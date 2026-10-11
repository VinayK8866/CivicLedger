import React, { useEffect, useState } from 'react';
import { fetchAdminHealth, fetchAuditEvents, resetDemoData } from '../api';
import { AuditEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Activity,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  UserCheck
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { role, changeRole } = useAuth();
  const [health, setHealth] = useState<any | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [hRes, aRes] = await Promise.all([
          fetchAdminHealth(),
          fetchAuditEvents()
        ]);
        setHealth(hRes);
        setAuditEvents(aRes.auditEvents);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all records to the original Greenfield Ward synthetic scenario?')) {
      setIsResetting(true);
      try {
        const res = await resetDemoData();
        setResetMessage(res.message);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        alert('Failed to reset demonstration dataset');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administration & Audit Console</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
              System Health & Provenance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inspect real-time system metrics, AI inference engine status, and immutable verification audit trails.
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Currently viewing in {role.toUpperCase()} role.</span>
            <button
              onClick={() => changeRole('admin')}
              className="font-bold underline text-amber-900 ml-1"
            >
              Elevate to Administrator
            </button>
          </div>
        )}
      </div>

      {/* Health & Engine Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Platform Health</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational</span>
          </div>
          <p className="text-[11px] text-slate-400">REST API & Node 24 runtime active</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gemini AI Service</span>
            <Sparkles className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {health?.liveAI ? 'Connected (Gemini 1.5)' : 'Heuristic Fallback'}
          </div>
          <p className="text-[11px] text-slate-400">
            {health?.liveAI ? 'Live server SDK extraction' : 'Zero-config local NLP extraction'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Persistent Entities</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {health ? `${health.totalIncidents} Incidents / ${health.totalClaims} Claims` : '...'}
          </div>
          <p className="text-[11px] text-slate-400">{health?.totalEvidence} Evidence Items loaded</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Demo Dataset Control</span>
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </div>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isResetting ? 'Restoring...' : 'Reset Greenfield Dataset'}
          </button>
          {resetMessage && <span className="text-[10px] text-emerald-600 font-semibold">{resetMessage}</span>}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Immutable System Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete provenance trail of submissions, role changes, verification decisions, and intervention approvals.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{auditEvents.length} Recorded Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Timestamp</th>
                <th className="pb-2.5 font-bold">Actor</th>
                <th className="pb-2.5 font-bold">Action</th>
                <th className="pb-2.5 font-bold">Target Entity</th>
                <th className="pb-2.5 font-bold">Metadata / Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5">
                    <span className="font-semibold text-slate-900 block">{evt.actorName}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{evt.actorRole}</span>
                  </td>
                  <td className="py-2.5">
                    <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="font-medium text-slate-800">{evt.entityType}</span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[120px]">
                      {evt.entityId}
                    </span>
                  </td>
                  <td className="py-2.5 text-[11px] text-slate-600 max-w-sm">
                    {evt.metadata ? (
                      <span className="truncate block font-mono text-[10px] bg-slate-50 p-1 rounded border border-slate-200">
                        {JSON.stringify(evt.metadata)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
