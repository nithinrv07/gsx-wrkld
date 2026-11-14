'use client';

// Stretch S1: manual blocker tagging. Mark a ticket "Blocked by" and link an upstream
// ticket from another pod. No timers and no auto-escalation (doc 3.2).
// Shown only in the ticket detail panel: dependency badges on cards are a Future Enhancement.

import React, { useId, useState } from 'react';
import { TICKET_STATUS_LABELS } from '@/constants/ticket-lifecycle';
import type { Ticket } from '@/types/ticket';

interface BlockedByLinksProps {
  blockers: Ticket[];
  linkable: Ticket[];
  podTypeOf: (podId: string) => string;
  canTag: boolean;
  busy: boolean;
  onLink: (blockedByKey: string) => void;
  onRemove: (blockedByKey: string) => void;
}

export function BlockedByLinks({ blockers, linkable, podTypeOf, canTag, busy, onLink, onRemove }: BlockedByLinksProps) {
  const ids = useId();
  const [picking, setPicking] = useState(false);
  const [choice, setChoice] = useState('');
  const selected = linkable.some((t) => t.key === choice) ? choice : linkable[0]?.key ?? '';

  return (
    <section aria-labelledby={`${ids}-h`} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={`${ids}-h`} className="text-[13px] font-semibold text-slate-700">Blocked by</h3>
        {canTag && !picking && linkable.length > 0 && (
          <button type="button" onClick={() => setPicking(true)} className="text-[13px] text-[#5851d8] underline">
            Link upstream ticket
          </button>
        )}
      </div>

      {blockers.length === 0 && <p className="text-[13px] text-slate-600">Not blocked by another pod&apos;s ticket.</p>}

      {blockers.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {blockers.map((b) => (
            <li key={b.key} className="flex items-center gap-2.5 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2.5">
              {podTypeOf(b.podId) && (
                <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">{podTypeOf(b.podId)}</span>
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[13px] font-medium text-slate-900">{b.title}</span>
                <span className="text-xs text-slate-600">
                  <span className="font-mono">{b.key}</span> is in {TICKET_STATUS_LABELS[b.status]}
                </span>
              </span>
              {canTag && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRemove(b.key)}
                  aria-label={`Remove link to ${b.key}`}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {picking && (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label htmlFor={`${ids}-pick`} className="text-[13px] font-medium text-slate-700">Upstream ticket from another pod</label>
          <select
            id={`${ids}-pick`}
            value={selected}
            onChange={(e) => setChoice(e.target.value)}
            className="h-[38px] rounded-[10px] border border-slate-200 bg-white px-2.5 text-sm"
          >
            {linkable.map((t) => (
              <option key={t.key} value={t.key}>{`${t.key}${podTypeOf(t.podId) ? ` (${podTypeOf(t.podId)})` : ''} ${t.title}`}</option>
            ))}
          </select>
          <p className="text-xs text-slate-600">Manual tag only. Nobody is alerted and there is no escalation timer.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPicking(false)} className="h-[34px] rounded-[10px] border border-slate-200 bg-white px-3 text-[13px] text-slate-700">Cancel</button>
            <button
              type="button"
              disabled={!selected || busy}
              onClick={() => {
                onLink(selected);
                setPicking(false);
              }}
              className="h-[34px] rounded-[10px] bg-[#5851d8] px-3 text-[13px] font-medium text-white disabled:opacity-50"
            >
              Link ticket
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
