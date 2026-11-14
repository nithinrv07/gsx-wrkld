'use client';

// TicketCard (doc 9.3). Shows key, title, type, assignee and status (doc 7.6).
// The column is the status; the card's accessible name includes it too.
// No dependency badges: those are a Future Enhancement (doc 3.3).

import React from 'react';
import { TICKET_STATUS_LABELS, TICKET_TYPE_LABELS } from '@/constants/ticket-lifecycle';
import type { Ticket, TicketStatus } from '@/types/ticket';
import type { TicketPermissions } from '../lib/ticketPermissions';
import { BlockerHatch, PersonAvatar, TicketTypeBadge } from './ticketVisuals';
import { MoveToMenu } from './MoveToMenu';

export interface TicketCardProps {
  ticket: Ticket;
  assigneeName: string;
  permissions: TicketPermissions;
  isOpen?: boolean;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  onOpen?: () => void;
  onMove?: (status: TicketStatus) => void;
  onApprove?: () => void;
  /** Rendered inside the drag overlay: no interactive controls. */
  preview?: boolean;
}

export function TicketCard({
  ticket,
  assigneeName,
  permissions,
  isOpen = false,
  menuOpen = false,
  onMenuOpenChange,
  onOpen,
  onMove,
  onApprove,
  preview = false,
}: TicketCardProps) {
  const isBlocker = ticket.type === 'blocker_flag';
  const showApprove = !preview && permissions.canApprove && ticket.status === 'pr_open_review';

  return (
    <article
      aria-label={`${ticket.key}, ${ticket.title}, ${TICKET_TYPE_LABELS[ticket.type]}, ${TICKET_STATUS_LABELS[ticket.status]}, assignee ${assigneeName}`}
      className={`rounded-[10px] border ${
        isBlocker ? 'border-rose-200 bg-rose-50/60' : 'border-slate-200 bg-white'
      } ${isOpen ? 'outline outline-2 outline-offset-1 outline-[#5851d8]' : ''} ${preview ? 'rotate-1 shadow-xl' : ''}`}
    >
      {isBlocker && <BlockerHatch className="h-1.5 rounded-t-[9px]" />}
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <TicketTypeBadge type={ticket.type} />
          <span className="font-mono text-[11px] text-slate-600">{ticket.key}</span>
        </div>
        {preview ? (
          <span className="text-sm font-medium leading-snug text-slate-900">{ticket.title}</span>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-left text-sm font-medium leading-snug text-slate-900 hover:text-[#5851d8]"
          >
            {ticket.title}
          </button>
        )}
        <div className="flex min-w-0 items-center gap-2">
          <PersonAvatar id={ticket.assigneeId} name={assigneeName} />
          <span className="truncate text-xs text-slate-600">{assigneeName}</span>
        </div>
        {!preview && (
          <MoveToMenu
            leading={
              showApprove ? (
                <button
                  type="button"
                  onClick={onApprove}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="rounded-lg bg-[#5851d8] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#4b44ca]"
                >
                  Approve
                </button>
              ) : null
            }
            ticket={ticket}
            permissions={permissions}
            open={menuOpen}
            onOpenChange={(open) => onMenuOpenChange?.(open)}
            onMove={(status) => onMove?.(status)}
          />
        )}
      </div>
    </article>
  );
}
