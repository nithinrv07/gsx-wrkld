import React from 'react';

export type PodCode = 'FE' | 'BE' | 'INT' | 'QA';

const POD_STYLES: Record<PodCode, { name: string; className: string }> = {
  FE: { name: 'Frontend', className: 'bg-sky-50 text-sky-700 border-sky-200/70' },
  BE: { name: 'Backend', className: 'bg-violet-50 text-violet-700 border-violet-200/70' },
  INT: { name: 'Integration', className: 'bg-amber-50 text-amber-700 border-amber-200/70' },
  QA: { name: 'QA', className: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' },
};

export interface PodBadgeProps {
  pod: PodCode;
  /** "code" shows FE/BE/INT/QA, "name" shows "Frontend Pod" etc. */
  display?: 'code' | 'name';
  className?: string;
}

export const PodBadge: React.FC<PodBadgeProps> = ({ pod, display = 'code', className = '' }) => {
  const meta = POD_STYLES[pod];
  return (
    <span
      title={`${meta.name} Pod`}
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ${meta.className} ${className}`}
    >
      {display === 'code' ? pod : `${meta.name} Pod`}
    </span>
  );
};
