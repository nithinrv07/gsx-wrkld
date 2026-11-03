import React from 'react';
import { StatusType } from '@/types';

export interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  dot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dotBg: string;
  }
> = {
  active: {
    label: 'Active',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200/70',
    dotBg: 'bg-indigo-500',
  },
  'in-progress': {
    label: 'In Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200/70',
    dotBg: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/70',
    dotBg: 'bg-emerald-500',
  },
  done: {
    label: 'Done',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/70',
    dotBg: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/70',
    dotBg: 'bg-amber-500',
  },
  todo: {
    label: 'To Do',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotBg: 'bg-slate-400',
  },
  review: {
    label: 'Review',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200/70',
    dotBg: 'bg-purple-500',
  },
  planning: {
    label: 'Planning',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200/70',
    dotBg: 'bg-sky-500',
  },
  blocked: {
    label: 'Blocked',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/70',
    dotBg: 'bg-rose-500',
  },
  'on-track': {
    label: 'On Track',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/70',
    dotBg: 'bg-emerald-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  dot = true,
  children,
  className = '',
}) => {
  const config = statusConfig[status] || statusConfig.active;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} select-none ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotBg}`}
          aria-hidden="true"
        />
      )}
      <span>{children || config.label}</span>
    </span>
  );
};
