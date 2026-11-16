'use client';

// Stretch S3: pod backlog list view. Tickets in Backlog, planned into sprints by
// roles that may manage sprints (RBAC 8.1), then moved to Todo.

import React from 'react';
import type { Ticket, TicketSprintOption } from '@/types/ticket';
import type { TicketPermissions } from '../lib/ticketPermissions';
import { PersonAvatar, TicketTypeBadge } from './ticketVisuals';

interface BacklogTableProps {
  tickets: Ticket[];
  sprints: TicketSprintOption[];
  permissions: TicketPermissions;
  assigneeName: (assigneeId: string | null) => string;
  onOpen: (key: string) => void;
  onPlanSprint: (key: string, sprintId: string | null) => void;
  onMoveToTodo: (key: string) => void;
}

export function BacklogTable({ tickets, sprints, permissions, assigneeName, onOpen, onPlanSprint, onMoveToTodo }: BacklogTableProps) {
  const sprintName = (id: string | null) => sprints.find((s) => s.id === id)?.name ?? 'No sprint';
  const th = 'border-b border-slate-200 px-4 py-2.5 font-medium';
  const td = 'border-b border-slate-100 px-4 py-3';

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[880px] border-collapse text-[13px]">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-600">
            <th scope="col" className={`${th} w-24`}>Key</th>
            <th scope="col" className={th}>Title</th>
            <th scope="col" className={`${th} w-44`}>Type</th>
            <th scope="col" className={`${th} w-44`}>Assignee</th>
            <th scope="col" className={`${th} w-40`}>Sprint</th>
            <th scope="col" className={`${th} w-36`}><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.key}>
              <td className={`${td} font-mono text-xs text-slate-600`}>{t.key}</td>
              <td className={td}>
                <button type="button" onClick={() => onOpen(t.key)} className="text-left text-sm font-medium text-slate-900 hover:text-[#5851d8]">
                  {t.title}
                </button>
              </td>
              <td className={td}><TicketTypeBadge type={t.type} /></td>
              <td className={td}>
                <span className="inline-flex items-center gap-2">
                  <PersonAvatar id={t.assigneeId} name={assigneeName(t.assigneeId)} />
                  {assigneeName(t.assigneeId)}
                </span>
              </td>
              <td className={td}>
                {permissions.canPlanSprints ? (
                  <select
                    aria-label={`Sprint for ${t.key}`}
                    value={t.sprintId ?? ''}
                    onChange={(e) => onPlanSprint(t.key, e.target.value || null)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[13px]"
                  >
                    <option value="">No sprint</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-700">{sprintName(t.sprintId)}</span>
                )}
              </td>
              <td className={`${td} text-right`}>
                <button
                  type="button"
                  onClick={() => onMoveToTodo(t.key)}
                  className="h-8 rounded-lg border border-indigo-200 bg-white px-3 text-[13px] font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  Move to Todo
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
