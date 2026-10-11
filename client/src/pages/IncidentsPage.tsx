import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIncidents } from '../api';
import { CanonicalIncident } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { IncidentMap } from '../components/IncidentMap';
import {
  MapPin,
  Search,
  Filter,
  Flame,
  ArrowRight,
  Clock,
  ChevronRight,
  Layers,
  AlertCircle
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<CanonicalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'criticality' | 'recurrence' | 'recent'>('criticality');
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchIncidents({
          search: search || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        setIncidents(res.incidents);
      } catch (err) {
        console.error('Failed to load incidents', err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const sortedIncidents = [...incidents].sort((a, b) => {
    if (sortBy === 'criticality') {
      return (b.criticalityScore ?? 0) - (a.criticalityScore ?? 0);
    }
    if (sortBy === 'recurrence') {
      return b.recurrenceCount - a.recurrenceCount;
    }
    return new Date(b.lastObservedAt).getTime() - new Date(a.lastObservedAt).getTime();
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incident Memory Explorer</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse unique neighborhood problem entities with historical recurrence tracking, AI distress sentiment, and verifiable evidence graphs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              showMap ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-2xs"
          >
            <span>+ Report Incident</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, landmark, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-cyan-500 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-lg border border-cyan-200 bg-cyan-50/50 px-3 py-2 text-xs text-cyan-900 font-semibold focus:outline-none"
          >
            <option value="criticality">Sort: Criticality & Distress Score</option>
            <option value="recurrence">Sort: Recurrence Frequency</option>
            <option value="recent">Sort: Most Recently Observed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="drainage">Drainage</option>
            <option value="potholes">Potholes</option>
            <option value="waste_accumulation">Waste Accumulation</option>
            <option value="streetlights">Streetlights</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="recurring">Recurring</option>
            <option value="active">Active</option>
            <option value="under_intervention">Under Intervention</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Optional Map View */}
      {showMap && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <IncidentMap incidents={sortedIncidents} height="320px" />
        </div>
      )}

      {/* Incidents Card Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : sortedIncidents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Incidents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No incidents matched your query. Try clearing filters or submit a new report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedIncidents.map(inc => {
            const isRecurring = inc.recurrenceCount > 1 || inc.status === 'recurring';
            const isEmergency = inc.priorityRank === 'critical_emergency' || (inc.criticalityScore ?? 0) >= 85;
            const isIsolatedSevere = inc.recurrenceCount === 1 && (inc.criticalityScore ?? 0) >= 80;

            return (
              <div
                key={inc.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-4 ${
                  isEmergency ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {inc.category.replace(/_/g, ' ')}
                    </span>

                    {/* Criticality Score Chip */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isEmergency
                          ? 'bg-rose-600 text-white animate-pulse'
                          : (inc.criticalityScore ?? 0) >= 65
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}
                    >
                      Score: {inc.criticalityScore ?? 50}/100
                    </span>
                  </div>

                  {/* Badges row: Recurrence vs Isolated Severe */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isIsolatedSevere ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <span>⚡ Isolated Severe Hazard</span>
                      </span>
                    ) : isRecurring ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        <Flame className="w-3 h-3" />
                        <span>{inc.recurrenceCount}x Episodes</span>
                      </span>
                    ) : (
                      <StatusBadge status={inc.status} size="sm" />
                    )}

                    {inc.distressSentimentScore !== undefined && (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50/80 px-2 py-0.5 rounded-full border border-rose-100">
                        Distress: {inc.distressSentimentScore}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {inc.title}
                  </h3>

                  <div className="flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span className="line-clamp-1">{inc.canonicalLocation.address || 'Greenfield Ward'}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {inc.currentAssessment}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500">
                    <span>Observed: {new Date(inc.lastObservedAt).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/incidents/${inc.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-cyan-600 hover:text-cyan-700"
                  >
                    <span>Timeline & Evidence</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
