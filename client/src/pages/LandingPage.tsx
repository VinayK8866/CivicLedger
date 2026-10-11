import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  Network,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Droplets,
  AlertOctagon,
  Trash2,
  Users,
  Compass,
  CheckCircle2,
  TreeDeciduous,
  Activity,
  HeartHandshake
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 px-6 sm:px-12 lg:px-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Hackathon Impact Project</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The Living Digital Memory of <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Every Neighborhood
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            <strong>CivicTwin</strong> remembers recurring civic infrastructure failures across time, while{' '}
            <strong>ProofMesh</strong> establishes an auditable evidence graph to distinguish observable facts from
            outdated claims, detect contradictions, and guide preventive interventions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-teal-400 transition-all hover:scale-[1.02]"
            >
              <span>Launch Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/evidence"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/80 transition-all"
            >
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Explore ProofMesh Graph</span>
            </Link>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Pre-seeded with Greenfield Ward Demonstration Scenario</span>
          </div>
        </div>
      </div>

      {/* Four Pillars of Impact */}
      <div className="py-16 px-6 sm:px-12 lg:px-20 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Google's Four Pillars of Impact
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered from first principles to solve chronic civic failures through systemic memory rather than reactive tickets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Resilience */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Resilience</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transforms isolated complaint tickets into an enduring neighborhood memory. Tracks chronic waterlogging and infrastructure breakdowns across seasons so communities can prepare before heavy weather strikes.
            </p>
          </div>

          {/* Pillar 2: Sustainability */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TreeDeciduous className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Sustainability</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Encourages nature-based preventive solutions like bio-retention swales and smart waste logistics, verified through longitudinal before-and-after outcome measurements with clear causal limitations.
            </p>
          </div>

          {/* Pillar 3: Innovation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Innovation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ProofMesh introduces a typed evidence graph with contradiction detection, temporal progression modeling, and "The Unknown Detector" that turns missing civic data into concrete community tasks.
            </p>
          </div>

          {/* Pillar 4: Cooperation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 space-y-4 hover:border-amber-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Cooperation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unites residents, independent community verifiers, NGO coordinators, and municipal stakeholders onto a shared, transparent ground truth with complete auditability.
            </p>
          </div>
        </div>
      </div>

      {/* Product Architecture Comparison */}
      <div className="py-16 px-6 sm:px-12 lg:px-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">The CivicTwin + ProofMesh Synergy</h2>
            <p className="text-sm text-slate-400">Two interconnected layers creating an actionable civic intelligence loop.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-cyan-900/50 bg-gradient-to-b from-cyan-950/30 to-slate-900 p-8 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                <Layers className="w-6 h-6" />
                <span>CivicTwin: Neighborhood Memory</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Tracks multi-date observations over months instead of single static tickets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Calculates recurrence frequencies and flags recurring problem corridors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Distinguishes temporary cosmetic clearing from durable infrastructure fixes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Houses Prevention Lab simulations and before-and-after outcome metrics.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-indigo-900/50 bg-gradient-to-b from-indigo-950/30 to-slate-900 p-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
                <Network className="w-6 h-6" />
                <span>ProofMesh: Evidence Intelligence</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Every claim is backed by typed, timestamped evidence items with provenance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Never allows AI extractions to become facts without independent verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Detects factual contradictions vs chronological changes across observers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>"The Unknown Detector" highlights missing critical evidence needed for decisions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>CivicTwin + ProofMesh &bull; Google Hackathon 2026 &bull; Greenfield Ward Synthetic Demonstration Dataset</p>
      </footer>
    </div>
  );
};
