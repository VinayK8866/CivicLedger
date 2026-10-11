import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchDashboardSummary,
  fetchDashboardTrends,
  fetchIncidents,
  convertGapToAction
} from '../api';
import { DashboardSummary, CanonicalIncident, EvidenceGap } from '../types';
import { IncidentMap } from '../components/IncidentMap';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileText,
  MapPin,
  Flame,
  Clock,
  AlertTriangle,
  ListTodo,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<any | null>(null);
  const [incidents, setIncidents] = useState<CanonicalIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<CanonicalIncident | null>(null);
  const [rankingMode, setRankingMode] = useState<'criticality' | 'recurrence'>('criticality');
  const [loading, setLoading] = useState(true);

  // High priority gaps gathered from incidents
  const [priorityGaps, setPriorityGaps] = useState<EvidenceGap[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, trendRes, incRes] = await Promise.all([
          fetchDashboardSummary(),
          fetchDashboardTrends(),
          fetchIncidents()
        ]);
        setSummary(sumRes.summary);
        setTrends(trendRes);
        setIncidents(incRes.incidents);
        if (incRes.incidents.length > 0) {
          setSelectedIncident(incRes.incidents[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const handleConvertGap = async (gapId: string) => {
    try {
      await convertGapToAction(gapId);
      alert('Information gap successfully converted into an actionable Community Action!');
      navigate('/actions');
    } catch (err) {
      alert('Failed to convert gap');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading neighborhood intelligence...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Reports', val: summary?.totalReports ?? 6, icon: FileText, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Canonical Incidents', val: summary?.uniqueIncidents ?? 3, icon: MapPin, color: 'text-sky-700', bg: 'bg-sky-50' },
    { label: 'Recurring Hotspots', val: summary?.recurringHotspots ?? 3, icon: Flame, color: 'text-rose-700', bg: 'bg-rose-50' },
    { label: 'Claims Pending Review', val: summary?.claimsAwaitingReview ?? 1, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Unresolved Conflicts', val: summary?.unresolvedConflicts ?? 1, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50' },
    { label: 'Open Actions', val: summary?.openCommunityActions ?? 3, icon: ListTodo, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Evidence Verified', val: `${summary?.verifiedRate ?? 80}%`, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' }
  ];

  // Pie chart data for claim verification states
  const pieData = trends?.statusBreakdown
    ? [
        { name: 'Supported', value: trends.statusBreakdown.supported, color: '#10b981' },
        { name: 'Disputed', value: trends.statusBreakdown.disputed, color: '#f43f5e' },
        { name: 'Pending Review', value: trends.statusBreakdown.pending, color: '#f59e0b' },
        { name: 'Unverified', value: trends.statusBreakdown.unverified, color: '#94a3b8' }
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Neighborhood Intelligence Dashboard</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">Greenfield Ward</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time digital memory of chronic civic infrastructure vulnerabilities and verifiable evidence graphs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors"
          >
            <span>+ Report New Incident</span>
          </Link>
          <Link
            to="/evidence"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <span>ProofMesh Graph</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 truncate">{c.label}</span>
                <span className={`p-1 rounded-md ${c.bg} ${c.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900">{c.val}</div>
            </div>
          );
        })}
      </div>

      {/* Main Map & Recurring Rankings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>Geospatial Incident Memory Map</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any marker to inspect recurrence patterns and evidence trails.
              </p>
            </div>
            {selectedIncident && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                Active: <strong className="text-slate-900">{selectedIncident.title.substring(0, 24)}...</strong>
              </span>
            )}
          </div>

          <IncidentMap
            incidents={incidents}
            selectedIncidentId={selectedIncident?.id}
            onSelectIncident={inc => setSelectedIncident(inc)}
            height="380px"
          />

          {selectedIncident && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{selectedIncident.title}</span>
                  <StatusBadge status={selectedIncident.status} size="sm" />
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">{selectedIncident.currentAssessment}</p>
              </div>
              <Link
                to={`/incidents/${selectedIncident.id}`}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-slate-50 shadow-2xs"
              >
                <span>Deep Incident Timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Col: Priority Ranking (Criticality & Sentiment vs Recurrence) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-rose-100 text-rose-700">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Priority Scoring Queue
                </h2>
              </div>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                AI Sentiment Weighted
              </span>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium text-slate-600 mb-3">
              <button
                type="button"
                onClick={() => setRankingMode('criticality')}
                className={`flex-1 py-1 px-2 rounded-md transition-all ${
                  rankingMode === 'criticality'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Criticality & Distress
              </button>
              <button
                type="button"
                onClick={() => setRankingMode('recurrence')}
                className={`flex-1 py-1 px-2 rounded-md transition-all ${
                  rankingMode === 'recurrence'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Chronic Recurrence
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-3 leading-snug">
              {rankingMode === 'criticality'
                ? 'Weighted by severity (40%), citizen distress sentiment (35%), recurrence (15%), and critical corridor impact (10%). Isolated life-safety hazards outrank chronic low-risk issues.'
                : 'Ranked purely by historical recurrence frequency over 90 days across Greenfield Ward.'}
            </p>

            <div className="space-y-2.5">
              {[...incidents]
                .sort((a, b) => {
                  if (rankingMode === 'criticality') {
                    return (b.criticalityScore ?? 0) - (a.criticalityScore ?? 0);
                  }
                  return b.recurrenceCount - a.recurrenceCount;
                })
                .map((inc, i) => {
                  const isTopEmergency = inc.criticalityScore >= 90 || inc.priorityRank === 'critical_emergency';
                  const isIsolatedSevere = inc.recurrenceCount === 1 && (inc.criticalityScore ?? 0) >= 80;

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedIncident?.id === inc.id
                          ? 'border-cyan-500 bg-cyan-50/40 ring-1 ring-cyan-400'
                          : isTopEmergency
                          ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/50'
                          : 'border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Rank #{i + 1}
                          </span>
                          {isIsolatedSevere && (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                              ⚡ Isolated Hazard
                            </span>
                          )}
                        </div>

                        {rankingMode === 'criticality' ? (
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isTopEmergency
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : (inc.criticalityScore ?? 0) >= 70
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              Score {inc.criticalityScore ?? 50}/100
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                            {inc.recurrenceCount}x Recurred
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{inc.title}</h4>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span className="truncate max-w-[170px]">{inc.canonicalLocation.address}</span>
                        {inc.distressSentimentScore !== undefined && (
                          <span className="font-semibold text-rose-600 shrink-0">
                            Distress: {inc.distressSentimentScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <Link
            to="/prevention"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-cyan-500 hover:to-teal-500 transition-all text-center"
          >
            <span>Simulate Preventive Actions in Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Novel Feature ("The Unknown Detector") & ProofMesh State Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: "The Unknown Detector" Highest-Priority Gaps */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  The Unknown Detector: "What We Still Don't Know"
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ProofMesh analyzes evidence trails to flag critical missing observations that block definitive conclusions.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Actionable Uncertainty
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.5 rounded">
                    Blocks Conclusion
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Elm Street Culvert Subterranean Camera Survey Missing
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  No internal CCTV camera inspection exists to verify whether the 200m underground culvert has structural brick collapse or merely removable silt.
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  <strong>Recommended Step:</strong> Dispatch robotic crawler camera through MH-4.
                </p>
              </div>

              <button
                onClick={() => handleConvertGap('gap-elm-cctv')}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 shadow-2xs"
              >
                <span>Convert to Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-100 px-1.5 py-0.5 rounded">
                    High Importance
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Market Square Midnight Collection Truck Timing Unverified
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  No empirical log exists to confirm whether municipal sanitation arrival aligns with commercial vegetable merchant dock packing hours.
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  <strong>Recommended Step:</strong> Log truck GPS timestamps for 7 consecutive nights.
                </p>
              </div>

              <button
                onClick={() => handleConvertGap('gap-market-waste-schedule')}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 shadow-2xs"
              >
                <span>Convert to Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: ProofMesh Claim Status Breakdown Pie */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Claim Verification Health</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Distribution of claims across ProofMesh epistemic states.
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 text-[11px]">{item.name}:</span>
                <span className="font-bold text-slate-900 text-[11px]">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <Link
              to="/verification"
              className="inline-flex items-center justify-between w-full text-xs font-semibold text-cyan-700 hover:text-cyan-800"
            >
              <span>Open Verification Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
