import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { submitIncidentReport } from '../api';
import { IncidentMap } from '../components/IncidentMap';
import { GeoLocation } from '../types';
import {
  PlusCircle,
  MapPin,
  Calendar,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  ShieldAlert,
  Layers,
  ChevronRight
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('waterlogging');
  const [severity, setSeverity] = useState('high');
  const [observedAt, setObservedAt] = useState(new Date().toISOString().slice(0, 16));
  const [impactDescription, setImpactDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<GeoLocation>({
    lat: 12.9716,
    lng: 77.5946,
    address: 'Elm St & 4th Cross Rd',
    landmark: 'St. Jude Community Health Clinic',
    neighborhood: 'Greenfield Ward'
  });

  // Selected media reference
  const [mediaRef, setMediaRef] = useState<string>('/demo-assets/elm_waterlog_jan8.jpg');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const samplePhotos = [
    { label: 'Waterlogging & Blocked Drain', url: '/demo-assets/elm_waterlog_jan8.jpg' },
    { label: 'Transit Bus In Floodwater', url: '/demo-assets/elm_bus_jan9.jpg' },
    { label: 'Deep Asphalt Crater', url: '/demo-assets/oak_pothole.jpg' },
    { label: 'Refuse Covering Storm Grate', url: '/demo-assets/market_waste.jpg' }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await submitIncidentReport({
        title,
        description,
        category,
        reportedLocation: location,
        observedAt: new Date(observedAt).toISOString(),
        severity,
        mediaReferences: [mediaRef],
        impactDescription,
        notes
      });
      setResult(res);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit incident report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Intelligent Incident Ingestion</h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit observed civic conditions with timestamped photographs and approximate geospatial coordinates.
        </p>
      </div>

      {/* Wizard Step Indicator */}
      <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
        {[
          { num: 1, label: '1. Incident Info' },
          { num: 2, label: '2. Location & Map' },
          { num: 3, label: '3. Media & Impact' },
          { num: 4, label: '4. AI Extraction' }
        ].map(s => (
          <div
            key={s.num}
            className={`p-2.5 rounded-xl border text-center transition-colors ${
              step === s.num
                ? 'border-cyan-500 bg-cyan-50 text-cyan-800'
                : step > s.num
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Step 1: Describe the Physical Observation</h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Incident Title *</label>
              <input
                type="text"
                placeholder="e.g. Severe waterlogging pooling across clinic entrance after light rain"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Incident Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="waterlogging">Waterlogging & Flooding</option>
                  <option value="drainage">Overflowing Drains / Culverts</option>
                  <option value="potholes">Damaged Roads & Potholes</option>
                  <option value="waste_accumulation">Waste Accumulation</option>
                  <option value="streetlights">Broken Streetlights</option>
                  <option value="pedestrian_safety">Unsafe Pedestrian Areas</option>
                  <option value="heat_exposure">Heat Exposure Hotspot</option>
                  <option value="utility_disruption">Utility Disruption</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observed Severity *</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="low">Low (Minor inconvenience)</option>
                  <option value="medium">Medium (Moderate traffic or pedestrian delay)</option>
                  <option value="high">High (Direct disruption to emergency access or infrastructure)</option>
                  <option value="critical">Critical (Immediate safety hazard or structural failure)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                placeholder="Describe visible conditions: water depth, stalled vehicles, odors, debris composition, duration..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Distinguish direct observations (e.g. "30cm deep water") from assumptions (e.g. "The pipe must be broken").
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Observation Date & Time *</label>
              <input
                type="datetime-local"
                value={observedAt}
                onChange={e => setObservedAt(e.target.value)}
                className="rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (title.length < 5 || description.length < 10) {
                  setErrorMessage('Please provide a title (min 5 chars) and description (min 10 chars).');
                  return;
                }
                setErrorMessage('');
                setStep(2);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 shadow-2xs"
            >
              <span>Next: Select Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location Selection */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Step 2: Pin Approximate Location</h2>
            <span className="text-[11px] text-slate-500">Click on map or enter details manually</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200">
            <IncidentMap
              incidents={[]}
              height="300px"
              interactiveSelection={true}
              onLocationPick={loc => {
                setLocation(prev => ({
                  ...prev,
                  lat: loc.lat,
                  lng: loc.lng,
                  address: loc.address || prev.address
                }));
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Street Address or Corridor *</label>
              <input
                type="text"
                value={location.address || ''}
                onChange={e => setLocation({ ...location, address: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nearby Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. St. Jude Community Health Clinic"
                value={location.landmark || ''}
                onChange={e => setLocation({ ...location, landmark: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 shadow-2xs"
            >
              <span>Next: Media & Impact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Media & Impact Details */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Step 3: Upload Evidence & Detail Impact</h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-2">Photographic Evidence</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {samplePhotos.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => setMediaRef(p.url)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      mediaRef === p.url
                        ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-400'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="h-12 w-12 mx-auto rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 mb-2">
                      <Upload className="w-5 h-5 text-cyan-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 line-clamp-2">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Impact on Community (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Clinic ambulances forced to detour 1.5km; elderly residents stranded"
                value={impactDescription}
                onChange={e => setImpactDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Observer Notes / Context</label>
              <input
                type="text"
                placeholder="e.g. Heavy rainfall lasted 30 minutes, rain stopped at 14:00"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Official Municipal Disclaimer */}
            <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 text-[11px] text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Notice Regarding Municipal Reporting</span>
              </div>
              <p>
                CivicTwin is a community intelligence and evidence verification platform. Submitting a report does not constitute official dispatch to municipal public works unless an authenticated integration has confirmed receipt.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:from-cyan-500 hover:to-teal-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Running Gemini AI Extraction...' : 'Submit & Analyze'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI Extraction Results & Matching Candidate Prompt */}
      {step === 4 && result && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Incident Report Ingested Successfully</h2>
                <p className="text-[11px] text-slate-500">Report ID: <span className="font-mono">{result.report.id}</span></p>
              </div>
            </div>

            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Mode: {result.aiMode}</span>
            </span>
          </div>

          {/* AI Structured Extraction Breakdown */}
          {result.report.aiExtraction && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Gemini Structured Extraction (Zod Validated)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-600">
                  Confidence: {Math.round(result.report.aiExtraction.confidence * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-lg p-3 border border-cyan-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Visible Conditions</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                    {result.report.aiExtraction.visibleConditions.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-3 border border-cyan-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Candidate Verifiable Claims</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                    {result.report.aiExtraction.candidateClaims.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Duplicate / Recurrence Candidate Match Prompt */}
          {result.candidateMatches && result.candidateMatches.length > 0 && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>CivicTwin Recurrence Match Detected</span>
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {Math.round(result.candidateMatches[0].similarityScore * 100)}% Match
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-purple-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{result.candidateMatches[0].candidateTitle}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">{result.candidateMatches[0].distanceMeters}m away</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {result.candidateMatches[0].rationale}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-purple-800 font-medium">
                  <span>Match Classification: <strong className="uppercase">{result.candidateMatches[0].matchType}</strong></span>
                  <Link
                    to={`/incidents/${result.candidateMatches[0].candidateIncidentId}`}
                    className="font-bold underline"
                  >
                    View Existing Incident Timeline
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setStep(1);
                setTitle('');
                setDescription('');
                setResult(null);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Report Another Observation
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 shadow-2xs"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
