import React, { useEffect, useState } from 'react';
import { fetchActions, updateActionStatus } from '../api';
import { CommunityAction } from '../types';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  AlertTriangle,
  TrendingDown,
  Info,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActionBoardPage: React.FC = () => {
  const [actions, setActions] = useState<CommunityAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchActions();
        setActions(res.actions);
      } catch (err) {
        console.error('Failed to load actions', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    try {
      const res = await updateActionStatus(id, newStatus);
      setActions(prev => prev.map(a => (a.id === id ? res.action : a)));
    } catch (err) {
      alert('Failed to update action status');
    }
  };

  const columns: Array<{ key: 'todo' | 'in_progress' | 'completed'; label: string; color: string; bg: string }> = [
    { key: 'todo', label: 'To Investigate / Pending', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    { key: 'in_progress', label: 'In Progress (Active Work)', color: 'text-cyan-800', bg: 'bg-cyan-50 border-cyan-200' },
    { key: 'completed', label: 'Completed & Measured', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Community Action Board</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Cooperative Execution
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch verification inspections, mobilize volunteer prep, and evaluate longitudinal before-and-after outcomes.
          </p>
        </div>

        <Link
          to="/prevention"
          className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-2xs"
        >
          <span>+ Propose New Action</span>
        </Link>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colActions = actions.filter(a => a.status === col.key);

          return (
            <div key={col.key} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 shadow-2xs">
                  {colActions.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {colActions.map(action => (
                  <div
                    key={action.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          action.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {action.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {new Date(action.deadline).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{action.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {action.description}
                    </p>

                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                        <span className="font-semibold text-slate-800">{action.assignedToName}</span>
                      </div>

                      {/* Status select dropdown */}
                      <select
                        value={action.status}
                        onChange={e => handleStatusChange(action.id, e.target.value as any)}
                        className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold capitalize text-slate-700 focus:outline-none"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colActions.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                    No tasks currently in this state.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Outcome Tracking Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Before & After Intervention Outcome Tracking</span>
            </h3>
            <p className="text-xs text-slate-500">
              Measuring whether preventive interventions achieved target empirical results.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Active Learning Loop
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <strong className="text-slate-900">Elm Street Bio-Retention Swale Pilot</strong>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                Target Met (75% Reduction)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Baseline Flood Duration</span>
                <span className="text-base font-bold text-rose-600">4.8 Hours</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Follow-Up Observed</span>
                <span className="text-base font-bold text-emerald-600">1.2 Hours</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Observation:</strong> Swale and trash rack successfully diverted gravel and leaves during 22mm rainfall event. Surface pooling cleared in 72 minutes.
            </p>

            <div className="rounded-lg bg-white/90 p-2.5 text-[10px] text-slate-500 border border-teal-100/80 space-y-0.5">
              <span className="font-bold text-teal-800 block">Causation Limitation:</span>
              <span>Ambient temp was 3°C warmer; additional multi-season measurements required to confirm complete decoupling from weather variability.</span>
            </div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <strong className="text-slate-900">Market Square Midnight Compactor Deployment</strong>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                Target Met (82% Reduction)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Baseline Litter Count</span>
                <span className="text-base font-bold text-rose-600">34 Grate Items/Night</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Follow-Up Observed</span>
                <span className="text-base font-bold text-emerald-600">6 Items/Night</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Observation:</strong> Organic crate dumping over storm drain was virtually eliminated following midnight compactor availability.
            </p>

            <div className="rounded-lg bg-white/90 p-2.5 text-[10px] text-slate-500 border border-purple-100/80 space-y-0.5">
              <span className="font-bold text-purple-800 block">Causation Limitation:</span>
              <span>Sampled over 3-day window; permanent habituation requires continuous monthly merchant council audits.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
