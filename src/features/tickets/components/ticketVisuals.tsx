// Visual vocabulary for tickets: one look per ticket type (doc 10.1 "one look per state").
// Type is always shown with an icon and its blueprint name, never colour alone (doc 10.3).

import React from 'react';
import { Bookmark, Bug, Flag, ArrowLeftRight, Zap } from 'lucide-react';
import { TICKET_TYPE_LABELS } from '@/constants/ticket-lifecycle';
import type { TicketType } from '@/types/ticket';
import { initialsOf } from '../lib/ticketHelpers';

const TYPE_CLASSES: Record<TicketType, string> = {
  epic: 'text-violet-800 bg-violet-50',
  story_domain_task: 'text-indigo-800 bg-indigo-50',
  integration_ticket: 'text-teal-800 bg-teal-50',
  bug_regression: 'text-orange-800 bg-orange-50',
  blocker_flag: 'text-rose-800 bg-rose-100',
};

const TYPE_ICONS: Record<TicketType, React.ElementType> = {
  epic: Zap,
  story_domain_task: Bookmark,
  integration_ticket: ArrowLeftRight,
  bug_regression: Bug,
  blocker_flag: Flag,
};

export function TicketTypeBadge({ type, className = '' }: { type: TicketType; className?: string }) {
  const Icon = TYPE_ICONS[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${TYPE_CLASSES[type]} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.4} aria-hidden="true" />
      {TICKET_TYPE_LABELS[type]}
    </span>
  );
}

/** Hatched band that marks a Blocker Flag, so blockers stand out without opening the ticket. */
export function BlockerHatch({ className = 'h-1.5' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`${className} w-full`}
      style={{ background: 'repeating-linear-gradient(135deg, #e11d48 0 6px, #fecdd3 6px 12px)' }}
    />
  );
}

const AVATAR_TONES = [
  'bg-indigo-100 text-indigo-800',
  'bg-orange-100 text-orange-800',
  'bg-teal-100 text-teal-800',
  'bg-pink-100 text-pink-800',
  'bg-sky-100 text-sky-800',
  'bg-lime-100 text-lime-800',
];

function toneFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function PersonAvatar({ id, name, size = 'sm' }: { id: string | null; name: string; size?: 'sm' | 'md' }) {
  const dims = size === 'md' ? 'h-8 w-8 text-xs' : 'h-6 w-6 text-[10px]';
  const tone = id ? toneFor(id) : 'bg-slate-100 text-slate-600';
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${tone}`}>
      {id ? initialsOf(name) : '–'}
    </span>
  );
}
