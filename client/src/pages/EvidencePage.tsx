import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchEvidenceGraph, fetchIncidents } from '../api';
import { EvidenceGraphView } from '../components/EvidenceGraphView';
import { CanonicalIncident } from '../types';
import {
  Network,
  Filter,
  Layers,
  AlertTriangle,
  Info,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialIncidentId = searchParams.get('incidentId') || 'all';

  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidentId);
  const [incidents, setIncidents] = useState<CanonicalIncident[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[]; rawRelations: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [incRes, graphRes] = await Promise.all([
          fetchIncidents(),
          fetchEvidenceGraph(selectedIncidentId !== 'all' ? selectedIncidentId : undefined)
        ]);
        setIncidents(incRes.incidents);
        setGraphData(graphRes);
      } catch (err) {
        console.error('Failed to load evidence graph', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [selectedIncidentId]);

  const handleIncidentFilter = (incId: string) => {
    setSelectedIncidentId(incId);
    if (incId === 'all') {
      searchParams.delete('incidentId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ incidentId: incId });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ProofMesh Evidence Graph Explorer</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Interactive Reasoning Layer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Navigable topology connecting claims, physical observations, sensor telemetry, and verification decisions.
          </p>
        </div>

        {/* Filter by incident */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Incident Scope:</label>
          <select
            value={selectedIncidentId}
            onChange={e => handleIncidentFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="all">Entire Greenfield Ward (All Nodes)</option>
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id}>
                {inc.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contradiction & Temporal Explanation Banner */}
      <div className="rounded-2xl border border-rose-200/90 bg-rose-50/40 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">ProofMesh Contradiction Detection Engine</span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded uppercase">
                Active Conflict
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              ProofMesh identified a conflict on <strong>Elm St Culvert</strong>: Municipal work order #MW-4091 (claiming permanent clearance on Jan 12) is contradicted and superseded by verified photograph #EX-20260202 showing 35cm flood recurrence on Feb 2.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[11px] font-mono text-slate-500 block">Edge Type: CONTRADICTS & SUPERSEDES</span>
          <span className="text-[11px] font-semibold text-rose-700">Audit Status: Verified by Elena Rostova</span>
        </div>
      </div>

      {/* Graph Area */}
      {loading ? (
        <div className="flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-xs text-slate-500 font-medium">Rendering ProofMesh Evidence Topology...</p>
          </div>
        </div>
      ) : graphData ? (
        <div className="space-y-3">
          <EvidenceGraphView
            initialNodes={graphData.nodes}
            initialEdges={graphData.edges}
            rawRelations={graphData.rawRelations}
            height="620px"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
            <div className="flex items-center gap-4">
              <span>Total Nodes: <strong className="text-slate-800">{graphData.nodes.length}</strong></span>
              <span>Total Typed Edges: <strong className="text-slate-800">{graphData.edges.length}</strong></span>
            </div>
            <p className="text-[11px] italic">
              Drag canvas to pan &bull; Scroll to zoom &bull; Click any node to open the live evidence inspection drawer.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
