import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  XCircle,
  Sparkles,
  UserCheck,
  Database
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const norm = status.toLowerCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = HelpCircle;
  let label = status;

  if (norm === 'verified' || norm === 'supported') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle2;
    label = norm === 'supported' ? 'Supported Claim' : 'Independently Verified';
  } else if (norm === 'disputed' || norm === 'rejected') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = AlertTriangle;
    label = norm === 'disputed' ? 'Disputed / In Conflict' : 'Rejected';
  } else if (norm === 'unverified' || norm === 'pending_review' || norm === 'pending') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = HelpCircle;
    label = norm === 'pending_review' ? 'Pending Review' : 'Unverified Claim';
  } else if (norm === 'outdated' || norm === 'deprecated') {
    bg = 'bg-slate-100 text-slate-500 border-slate-200 line-through';
    Icon = Clock;
    label = 'Outdated / Superseded';
  } else if (norm === 'recurring') {
    bg = 'bg-purple-50 text-purple-700 border-purple-200';
    Icon = AlertTriangle;
    label = 'Recurring Hotspot';
  } else if (norm === 'ai' || norm === 'ai_extracted_claim') {
    bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
    Icon = Sparkles;
    label = 'AI Extracted (Unverified)';
  } else if (norm === 'human_reviewed' || norm === 'verifier') {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
    Icon = UserCheck;
    label = 'Human Reviewed';
  } else if (norm === 'demo' || norm === 'synthetic') {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    Icon = Database;
    label = 'Synthetic Demo';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses} transition-colors`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{label}</span>
    </span>
  );
};
