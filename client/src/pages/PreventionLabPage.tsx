import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchIncidents, simulateIntervention, createIntervention } from '../api';
import { CanonicalIncident } from '../types';
import {
  FlaskConical,
  TrendingDown,
  DollarSign,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export const PreventionLabPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<CanonicalIncident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');

  // Simulation form states
  const [title, setTitle] = useState('Construct 45m Bio-retention Swale & Silt Trash Screen');
  const [description, setDescription] = useState(
    'Permeable vegetated swale to absorb peak stormwater runoff and mechanical screen to intercept sediment before entering the culvert.'
  );
  const [estimatedCost, setEstimatedCost] = useState(12500);
  const [expectedEffectiveness, setExpectedEffectiveness] = useState(75);
  const [implementationWeeks, setImplementationWeeks] = useState(3);
  const [assumptions, setAssumptions] = useState([
    'Ward permits 1.2m road verge excavation',
    'Subsoil infiltration rate >= 15 mm/hr',
    'Volunteers clean trash rack bi-weekly'
  ]);
  const [newAssumption, setNewAssumption] = useState('');

  // Simulation outcome result
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchIncidents();
        setIncidents(res.incidents);
        if (res.incidents.length > 0) {
          setSelectedIncidentId(res.incidents[0].id);
        }
      } catch (err) {
        console.error('Failed to load incidents', err);
      }
    }
    void load();
  }, []);

  // Run simulation whenever parameters change
  useEffect(() => {
    if (!selectedIncidentId) return;
    const timer = setTimeout(async () => {
      setSimulating(true);
      try {
        const res = await simulateIntervention({
          incidentId: selectedIncidentId,
          title,
          description,
          estimatedCost,
          expectedEffectiveness,
          implementationWeeks,
          assumptions,
          evidenceReferences: ['evi-elm-verifier-probe', 'evi-elm-recur-photo']
        });
        setSimResult(res.simulation);
      } catch (err) {
        console.error('Simulation error', err);
      } finally {
        setSimulating(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedIncidentId, estimatedCost, expectedEffectiveness, implementationWeeks, assumptions]);

  const handleAddAssumption = () => {
    if (newAssumption.trim()) {
      setAssumptions([...assumptions, newAssumption.trim()]);
      setNewAssumption('');
    }
  };

  const handleSaveIntervention = async () => {
    setSaving(true);
    try {
      await createIntervention({
        incidentId: selectedIncidentId,
        title,
        description,
        estimatedCost,
        expectedEffectiveness,
        implementationWeeks,
        assumptions,
        evidenceReferences: ['evi-elm-verifier-probe', 'evi-elm-recur-photo']
      });
      alert('Intervention proposal successfully recorded and queued in Community Action Board!');
      navigate('/actions');
    } catch (err) {
      alert('Failed to save intervention');
    } finally {
      setSaving(false);
    }
  };

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Prevention Lab: Scenario Simulator</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              Novel Feature
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate and compare preventive intervention trade-offs using transparent multi-factor scoring grounded in neighborhood memory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameter Controls (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="space-y-4 text-xs">
            {/* Target Hotspot Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Chronic Hotspot *</label>
              <select
                value={selectedIncidentId}
                onChange={e => setSelectedIncidentId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 font-semibold focus:border-cyan-500 focus:outline-none"
              >
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    {inc.title} ({inc.recurrenceCount}x Recurrence &bull; {inc.category})
                  </option>
                ))}
              </select>
              {selectedIncident && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Location: {selectedIncident.canonicalLocation.address} &bull; Risk: {selectedIncident.riskLevel}
                </p>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Proposed Intervention Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Engineering & Operational Scope</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Sliders: Cost, Effectiveness, Weeks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Estimated Cost</span>
                  <span className="font-bold text-slate-900">${estimatedCost.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={500}
                  value={estimatedCost}
                  onChange={e => setEstimatedCost(Number(e.target.value))}
                  className="w-full accent-cyan-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Effectiveness</span>
                  <span className="font-bold text-emerald-700">{expectedEffectiveness}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={expectedEffectiveness}
                  onChange={e => setExpectedEffectiveness(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Timeframe</span>
                  <span className="font-bold text-slate-900">{implementationWeeks} wks</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={1}
                  value={implementationWeeks}
                  onChange={e => setImplementationWeeks(Number(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>
            </div>

            {/* Assumptions List */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Explicit Dependencies & Assumptions</label>
              <ul className="space-y-1.5">
                {assumptions.map((a, idx) => (
                  <li key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200 text-slate-700">
                    <span>{a}</span>
                    <button
                      type="button"
                      onClick={() => setAssumptions(assumptions.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 text-xs font-bold"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add another assumption..."
                  value={newAssumption}
                  onChange={e => setNewAssumption(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddAssumption(); }}
                  className="flex-1 rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAssumption}
                  className="rounded-lg bg-slate-800 px-3 py-2 font-semibold text-white hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Simulation Scorecard (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Simulation Impact Scorecard</span>
              </h3>
              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                Live Rule Engine
              </span>
            </div>

            {simResult ? (
              <div className="space-y-4">
                {/* Composite Score Circle / Banner */}
                <div className="rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 p-6 text-white text-center shadow-md space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100">
                    Composite Impact Score
                  </span>
                  <div className="text-4xl font-extrabold tracking-tight">
                    {simResult.impactScore} <span className="text-lg font-normal text-cyan-100">/ 100</span>
                  </div>
                  <p className="text-xs text-cyan-100 mt-1">
                    Multi-attribute weighted across efficacy, budget, and deployment agility.
                  </p>
                </div>

                {/* Score Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Recurrence Reduction
                    </span>
                    <span className="text-lg font-bold text-emerald-700">
                      -{simResult.estimatedRecurrenceReduction} Episodes
                    </span>
                    <span className="text-[10px] text-slate-400 block">Expected per quarter</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Evidence Grounding
                    </span>
                    <span className="text-lg font-bold text-cyan-800">
                      {simResult.confidenceRating}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Corroborated by site probes</span>
                  </div>
                </div>

                {/* Structured Evaluation Plan Preview */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">Standardized Evaluation Metric:</span>
                  <div className="flex justify-between text-slate-700">
                    <span>Target Metric:</span>
                    <span className="font-semibold text-slate-900">Surface Flood Duration</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Baseline Measurement:</span>
                    <span className="font-semibold text-rose-600">4.8 Hours</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Target Post-Intervention:</span>
                    <span className="font-semibold text-emerald-600">&lt; 45 Minutes</span>
                  </div>
                </div>

                {/* Transparency Notice */}
                <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{simResult.illustrativeNotice}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveIntervention}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 py-3 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-teal-400 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Queueing Intervention...' : 'Save Intervention to Action Board'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
