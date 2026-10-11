import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Network,
  CheckSquare,
  FlaskConical,
  ListTodo,
  ShieldAlert,
  Home,
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { to: '/dashboard', label: 'Intelligence Dashboard', icon: LayoutDashboard },
        { to: '/incidents', label: 'Incident Explorer', icon: MapPin },
        { to: '/report', label: 'Report Incident', icon: PlusCircle }
      ]
    },
    {
      title: 'PROOFMESH ENGINE',
      items: [
        { to: '/evidence', label: 'Evidence Graph', icon: Network },
        { to: '/verification', label: 'Verification Workbench', icon: CheckSquare, badge: role === 'verifier' || role === 'admin' ? 'Active' : undefined }
      ]
    },
    {
      title: 'PREVENTION & ACTION',
      items: [
        { to: '/prevention', label: 'Prevention Lab', icon: FlaskConical },
        { to: '/actions', label: 'Community Action Board', icon: ListTodo }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { to: '/admin', label: 'Administration & Audit', icon: ShieldAlert },
        { to: '/', label: 'Product Landing & Pillars', icon: Home }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between text-slate-300 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {navSections.map(section => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-cyan-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ProofMesh Core Principle Footer card */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Principle</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-300">
          <strong className="text-white">CivicTwin</strong> remembers what happened. <strong className="text-white">ProofMesh</strong> establishes what available evidence supports.
        </p>
      </div>
    </aside>
  );
};
