'use client';

// TicketForm (doc 9.3): ticket creation with title, description, type, assignee and sprint (doc 7.6).
// Only roles allowed to "create and assign tasks within pod" see it (RBAC 8.1).

import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import { TICKET_TYPES } from '@/constants/ticket-lifecycle';
import type { CreateTicketInput, TicketSprintOption, TicketType } from '@/types/ticket';
import { validateTicketInput, TICKET_TITLE_MAX_LENGTH } from '../lib/ticketHelpers';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface TicketFormProps {
  podId: string;
  podName: string;
  members: { userId: string; name: string }[];
  sprints: TicketSprintOption[];
  defaultSprintId: string | null;
  submitting: boolean;
  serverError: string | null;
  onSubmit: (input: CreateTicketInput) => void;
  onClose: () => void;
}

const fieldClass = 'rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-900';

export function TicketForm({ podId, podName, members, sprints, defaultSprintId, submitting, serverError, onSubmit, onClose }: TicketFormProps) {
  const ids = useId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>('story_domain_task');
  const [assigneeId, setAssigneeId] = useState('');
  const [sprintId, setSprintId] = useState(defaultSprintId ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);

  // Escape closes the form even when focus has left it.
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

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateTicketInput({ title });
    if (errors.title) {
      setTitleError(errors.title);
      return;
    }
    onSubmit({ podId, title: title.trim(), description, type, assigneeId: assigneeId || null, sprintId: sprintId || null });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/30 px-4 py-16">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${ids}-title`} className="w-full max-w-[600px] rounded-2xl bg-white shadow-2xl">
      <form onSubmit={submit} noValidate>
        <div className="flex items-start justify-between gap-3 px-6 pb-1 pt-5">
          <div className="flex flex-col gap-1">
            <h2 id={`${ids}-title`} className="text-lg font-semibold text-slate-900">New ticket</h2>
            <p className="text-[13px] text-slate-600">Add a ticket to {podName}. New tickets start in Backlog.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[13px] font-medium text-slate-700">Type</legend>
            <div className="flex flex-wrap gap-2">
              {TICKET_TYPES.map((t) => (
                <label
                  key={t.id}
                  className={`inline-flex h-[34px] cursor-pointer items-center rounded-full border px-3 text-[13px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#5851d8] ${
                    type === t.id ? 'border-[#5851d8] bg-indigo-50 font-semibold text-indigo-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input type="radio" name="ticket-type" value={t.id} checked={type === t.id} onChange={() => setType(t.id)} className="sr-only" />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${ids}-name`} className="text-[13px] font-medium text-slate-700">Title</label>
            <input
              id={`${ids}-name`}
              autoFocus
              value={title}
              maxLength={TICKET_TITLE_MAX_LENGTH + 20}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(null);
              }}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? `${ids}-name-error` : undefined}
              className={`h-10 ${fieldClass} ${titleError ? 'border-rose-600' : ''}`}
            />
            {titleError && <p id={`${ids}-name-error`} className="text-xs text-rose-700">{titleError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${ids}-desc`} className="text-[13px] font-medium text-slate-700">
              Description <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <textarea id={`${ids}-desc`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`py-2 leading-relaxed ${fieldClass}`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${ids}-assignee`} className="text-[13px] font-medium text-slate-700">Assignee</label>
              <select id={`${ids}-assignee`} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={`h-[38px] ${fieldClass}`}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${ids}-sprint`} className="text-[13px] font-medium text-slate-700">Sprint</label>
              <select id={`${ids}-sprint`} value={sprintId} onChange={(e) => setSprintId(e.target.value)} className={`h-[38px] ${fieldClass}`}>
                <option value="">No sprint</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {serverError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-900">{serverError}</p>}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={submitting}>Create ticket</Button>
        </div>
      </form>
      </div>
    </div>
  );
}
