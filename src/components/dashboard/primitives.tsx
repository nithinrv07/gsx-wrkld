'use client';

import React, { useId } from 'react';
import { AlertTriangle, Info, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { Severity, TicketStatus, TicketType } from '@/types/dashboard';
import { SEVERITY_META, TICKET_STATUS_META, TICKET_TYPE_META } from '@/lib/dashboard/meta';

/** Small accessible tooltip: shows on hover and keyboard focus. */
export const InfoTooltip: React.FC<{ text: string; label?: string; className?: string }> = ({
  text,
  label = 'More information',
  className = '',
}) => {
  const id = useId();
  return (
    <span className={`relative inline-flex group/tip ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="text-slate-400 hover:text-slate-600 focus-visible:text-slate-700 focus:outline-none cursor-help"
        onClick={(e) => e.preventDefault()}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-40 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-normal normal-case tracking-normal leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
};

export const TicketStatusBadge: React.FC<{ status: TicketStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const meta = TICKET_STATUS_META[status];
  return (
    <span
      title={meta.description}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
};

export const TicketTypeTag: React.FC<{ type: TicketType }> = ({ type }) => {
  const meta = TICKET_TYPE_META[type];
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
};

export const SeverityTag: React.FC<{ severity: Severity }> = ({ severity }) => {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.className}`}
    >
      {meta.label}
    </span>
  );
};

export const InitialsAvatar: React.FC<{ initials: string; size?: 'sm' | 'md' | 'lg'; title?: string }> = ({
  initials,
  size = 'sm',
  title,
}) => {
  const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-[#5851d8] ${sizes[size]}`}
    >
      {initials}
    </span>
  );
};

/** Header used by every dashboard panel. */
export const PanelHeader: React.FC<{
  title: string;
  subtitle?: string;
  count?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, subtitle, count, actions, icon }) => (
  <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
    <div className="min-w-0">
      <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900">
        {icon}
        {title}
        {count !== undefined && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {count}
          </span>
        )}
      </h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

/** Inline error with retry, used inside a panel so one failure doesn't take down the page. */
export const PanelError: React.FC<{ message?: string; onRetry: () => void; isRetrying?: boolean }> = ({
  message = 'Something went wrong while loading this section.',
  onRetry,
  isRetrying,
}) => (
  <div role="alert" className="mx-5 mb-5 flex flex-col items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-6 text-center">
    <AlertTriangle className="h-6 w-6 text-rose-500" />
    <p className="text-sm text-rose-700">{message}</p>
    <Button
      size="sm"
      variant="secondary"
      onClick={onRetry}
      isLoading={isRetrying}
      leftIcon={<RotateCw className="h-3.5 w-3.5" />}
    >
      Try again
    </Button>
  </div>
);

export const PanelEmpty: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="mx-5 mb-5 flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200/90 px-4 py-8 text-center">
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50/80 text-[#5851d8]">{icon}</div>
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
);
