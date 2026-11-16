'use client';

// BoardFilters (doc 9.3): filter by assignee, type and sprint (doc 7.6),
// plus the Kanban / Backlog list switch (Stretch S3) inside the Board tab.

import React from 'react';
import { TICKET_TYPES } from '@/constants/ticket-lifecycle';
import type { TicketFilters, TicketSprintOption, TicketType } from '@/types/ticket';

export type BoardView = 'kanban' | 'list';

interface BoardFiltersProps {
  view: BoardView;
  onViewChange: (view: BoardView) => void;
  backlogCount: number;
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  members: { userId: string; name: string }[];
  sprints: TicketSprintOption[];
  filtersActive: boolean;
  countText: string;
}

const selectClass = 'h-[34px] rounded-[10px] border border-slate-200 bg-white px-2.5 text-[13px] text-slate-900';

export function BoardFilters({
  view,
  onViewChange,
  backlogCount,
  filters,
  onFiltersChange,
  members,
  sprints,
  filtersActive,
  countText,
}: BoardFiltersProps) {
  const set = (patch: Partial<TicketFilters>) => onFiltersChange({ ...filters, ...patch });
  const viewButton = (value: BoardView, label: React.ReactNode) => (
    <button
      type="button"
      aria-pressed={view === value}
      onClick={() => onViewChange(value)}
      className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[13px] ${
        view === value ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div role="group" aria-label="Board view and filters" className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label="Board view" className="inline-flex gap-0.5 rounded-[10px] bg-slate-100 p-[3px]">
        {viewButton('kanban', 'Kanban')}
        {viewButton('list', (
          <>
            Backlog list <span className="font-medium text-slate-600">{backlogCount}</span>
          </>
        ))}
      </div>

      <label className="flex items-center gap-2 text-[13px] text-slate-600">
        Assignee
        <select className={selectClass} value={filters.assignee} onChange={(e) => set({ assignee: e.target.value })}>
          <option value="all">Everyone</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.name}</option>
          ))}
          <option value="none">Unassigned</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-[13px] text-slate-600">
        Type
        <select className={selectClass} value={filters.type} onChange={(e) => set({ type: e.target.value as TicketType | 'all' })}>
          <option value="all">All types</option>
          {TICKET_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-[13px] text-slate-600">
        Sprint
        <select className={selectClass} value={filters.sprint} onChange={(e) => set({ sprint: e.target.value })}>
          <option value="all">All sprints</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="none">No sprint</option>
        </select>
      </label>

      {filtersActive && (
        <button
          type="button"
          onClick={() => onFiltersChange({ assignee: 'all', type: 'all', sprint: 'all' })}
          className="px-1 py-1.5 text-[13px] text-[#5851d8] underline"
        >
          Clear filters
        </button>
      )}
      <span className="ml-auto text-[13px] text-slate-600" aria-live="polite">{countText}</span>
    </div>
  );
}
