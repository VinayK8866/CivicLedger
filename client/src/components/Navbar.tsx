import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { resetDemoData } from '../api';
import {
  Shield,
  RotateCcw,
  User,
  Check,
  ChevronDown,
  Sparkles,
  Info,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, role, changeRole, isDemo } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const roles: Array<{ key: UserRole; name: string; desc: string }> = [
    { key: 'resident', name: 'Priya Sharma (Resident)', desc: 'Report incidents, view public evidence' },
    { key: 'verifier', name: 'Elena Rostova (Community Verifier)', desc: 'Review claims, inspect evidence, resolve conflicts' },
    { key: 'coordinator', name: 'Tariq Al-Mansoor (NGO Coordinator)', desc: 'Simulate interventions, prioritize actions' },
    { key: 'admin', name: 'Dr. Aris Thorne (Administrator)', desc: 'Full system audit logs, moderation, data reset' }
  ];

  const handleRoleSelect = async (newRole: UserRole) => {
    setIsDropdownOpen(false);
    await changeRole(newRole);
  };

  const handleResetDemo = async () => {
    if (confirm('Reset Greenfield Ward synthetic dataset to its initial pristine demonstration state?')) {
      setIsResetting(true);
      try {
        await resetDemoData();
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          window.location.reload();
        }, 1000);
      } catch (err) {
        alert('Failed to reset demo dataset');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      {/* Left brand banner */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-base">CivicTwin</span>
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">ProofMesh</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none">Community Evidence Engine</p>
          </div>
        </Link>

        {isDemo && (
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Greenfield Ward Synthetic Dataset</span>
          </div>
        )}
      </div>

      {/* Right controls: Role switcher & Demo reset */}
      <div className="flex items-center gap-3">
        {/* Reset Demo button */}
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          title="Reset demonstration data to clean state"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{resetSuccess ? 'Restored!' : 'Reset Demo'}</span>
        </button>

        {/* Role switcher menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-all shadow-2xs"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-white text-[10px] font-bold">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-semibold text-slate-900">{user?.displayName || 'Active Role'}</span>
              <span className="text-[10px] text-slate-500 ml-1.5 capitalize font-normal bg-slate-200/70 px-1.5 py-0.2 rounded">
                {role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Switch Demonstration Role</p>
                <p className="text-[11px] text-slate-500">Test role-aware permissions & workbenches</p>
              </div>
              <div className="mt-1 space-y-1">
                {roles.map(r => (
                  <button
                    key={r.key}
                    onClick={() => handleRoleSelect(r.key)}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left text-xs transition-colors ${
                      role === r.key
                        ? 'bg-cyan-50/70 text-cyan-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        role === r.key ? 'bg-cyan-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {role === r.key && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-500">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
