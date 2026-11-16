'use client';

// TicketDetailPanel (doc 9.3): side panel with edit and status change (doc 7.6).
// Tickets open in a side panel on the board; no separate ticket route (doc 12.2).

import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button, StatusBadge } from '@/components/ui';
import { TICKET_STATUSES, TICKET_STATUS_BADGE, TICKET_STATUS_LABELS } from '@/constants/ticket-lifecycle';
import type { Ticket, TicketSprintOption, TicketStatus, UpdateTicketInput } from '@/types/ticket';
import type { TicketPermissions } from '../lib/ticketPermissions';
import { TICKET_TITLE_MAX_LENGTH, validateTicketInput } from '../lib/ticketHelpers';
import { BlockerHatch, TicketTypeBadge } from './ticketVisuals';
import { BlockedByLinks } from './BlockedByLinks';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface TicketDetailPanelProps {
  ticket: Ticket;
  permissions: TicketPermissions;
  members: { userId: string; name: string }[];
  sprints: TicketSprintOption[];
  assigneeName: string;
  podLeadName: string | null;
  saving: boolean;
  serverError: string | null;
  blockers: Ticket[];
  linkable: Ticket[];
  podTypeOf: (podId: string) => string;
  linkBusy: boolean;
  onSave: (input: UpdateTicketInput) => void;
  onMove: (status: TicketStatus) => void;
  onApprove: () => void;
  onLink: (blockedByKey: string) => void;
  onUnlink: (blockedByKey: string) => void;
  onClose: () => void;
}

const fieldClass = 'rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-900';

export function TicketDetailPanel(props: TicketDetailPanelProps) {
  const { ticket, permissions, members, sprints, assigneeName, podLeadName, saving, serverError, onSave, onMove, onApprove, onClose } = props;
  const ids = useId();
  // The panel is keyed by ticket key in PodBoard, so this draft resets when another ticket opens.
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId ?? '');
  const [sprintId, setSprintId] = useState(ticket.sprintId ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);

  // Escape closes the panel even when focus has left it (for example after a button disappears).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Move focus into the panel, and give it back to whatever opened it on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  const currentIndex = TICKET_STATUSES.findIndex((s) => s.id === ticket.status);
  const sprintName = sprints.find((s) => s.id === ticket.sprintId)?.name ?? 'No sprint';

  const save = () => {
    const errors = validateTicketInput({ title });
    if (errors.title) {
      setTitleError(errors.title);
      return;
    }
    const input: UpdateTicketInput = { title: title.trim(), description };
    if (permissions.canAssign) input.assigneeId = assigneeId || null;
    if (permissions.canPlanSprints) input.sprintId = sprintId || null;
    onSave(input);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-slate-900/25"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${ids}-heading`} className="flex h-full w-[460px] max-w-full flex-col overflow-y-auto bg-white shadow-2xl">
        {ticket.type === 'blocker_flag' && <BlockerHatch className="h-2 flex-none" />}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <h2 id={`${ids}-heading`} className="font-mono text-[13px] text-slate-600">{ticket.key}</h2>
            <TicketTypeBadge type={ticket.type} />
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close ticket detail panel" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${ids}-t`} className="text-[13px] font-medium text-slate-700">Title</label>
            <input
              id={`${ids}-t`}
              value={title}
              maxLength={TICKET_TITLE_MAX_LENGTH + 20}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(null);
              }}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? `${ids}-t-err` : undefined}
              className={`h-10 font-medium ${fieldClass} ${titleError ? 'border-rose-600' : ''}`}
            />
            {titleError && <p id={`${ids}-t-err`} className="text-xs text-rose-700">{titleError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${ids}-d`} className="text-[13px] font-medium text-slate-700">Description</label>
            <textarea id={`${ids}-d`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`py-2 leading-relaxed ${fieldClass}`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${ids}-a`} className="text-[13px] font-medium text-slate-700">Assignee</label>
              {permissions.canAssign ? (
                <select id={`${ids}-a`} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={`h-[38px] ${fieldClass}`}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <output id={`${ids}-a`} className="py-2 text-sm text-slate-900">{assigneeName}</output>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${ids}-s`} className="text-[13px] font-medium text-slate-700">Sprint</label>
              {permissions.canPlanSprints ? (
                <select id={`${ids}-s`} value={sprintId} onChange={(e) => setSprintId(e.target.value)} className={`h-[38px] ${fieldClass}`}>
                  <option value="">No sprint</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <output id={`${ids}-s`} className="py-2 text-sm text-slate-900">{sprintName}</output>
              )}
            </div>
          </div>

          <BlockedByLinks
            blockers={props.blockers}
            linkable={props.linkable}
            podTypeOf={props.podTypeOf}
            canTag={permissions.canTagBlockedBy}
            busy={props.linkBusy}
            onLink={props.onLink}
            onRemove={props.onUnlink}
          />

          <section aria-labelledby={`${ids}-st`} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 id={`${ids}-st`} className="text-[13px] font-semibold text-slate-700">Status</h3>
              <StatusBadge status={TICKET_STATUS_BADGE[ticket.status]} size="sm">{TICKET_STATUS_LABELS[ticket.status]}</StatusBadge>
            </div>

            {ticket.status === 'pr_open_review' && permissions.canApprove && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-3">
                <span className="text-[13px] text-indigo-900">In PR Open / Review. Approve it to give the Pod Lead&apos;s sign-off.</span>
                <Button size="sm" onClick={onApprove}>Approve</Button>
              </div>
            )}
            {ticket.status === 'pr_open_review' && !permissions.canApprove && (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13px] text-slate-700">
                {podLeadName
                  ? `Waiting for ${podLeadName} (Pod Lead) to approve.`
                  : 'This pod has no Pod Lead yet. A Project Lead or Super Admin can approve it.'}
              </p>
            )}

            <ol className="flex flex-col gap-1">
              {TICKET_STATUSES.map((s, i) => {
                const current = i === currentIndex;
                const reason = permissions.moveBlockedReason(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={current || reason !== null}
                      aria-current={current ? 'step' : undefined}
                      title={reason ?? undefined}
                      onClick={() => onMove(s.id)}
                      className={`flex w-full items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left text-[13px] ${
                        current
                          ? 'border-indigo-200 bg-indigo-50 font-semibold text-indigo-900'
                          : reason
                            ? 'cursor-not-allowed border-transparent text-slate-400'
                            : 'border-transparent text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full text-[11px] font-semibold ${
                          current ? 'bg-[#5851d8] text-white' : i < currentIndex ? 'bg-indigo-200 text-indigo-900' : 'border border-slate-300 bg-white text-slate-600'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1">{s.label}</span>
                      <span className="text-[11px] font-normal text-slate-600">
                        {current ? 'Current' : reason ? (s.moveRule === 'pod_lead_sign_off' ? 'Needs Pod Lead sign-off' : 'Not for your role') : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          {serverError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-900">{serverError}</p>}
        </div>

        <div className="mt-auto flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} isLoading={saving}>Save changes</Button>
        </div>
      </div>
    </div>
  );
}
