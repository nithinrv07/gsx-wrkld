'use client';

// Keyboard-friendly alternative to drag and drop (doc 7.6, 10.4).
// Moves the role can't make are disabled with a short reason (doc 8.2).

import React, { useEffect, useId, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { TICKET_STATUSES } from '@/constants/ticket-lifecycle';
import type { Ticket, TicketStatus } from '@/types/ticket';
import type { TicketPermissions } from '../lib/ticketPermissions';

interface MoveToMenuProps {
  /** Shown before the trigger, for example the Approve button. */
  leading?: React.ReactNode;
  ticket: Ticket;
  permissions: TicketPermissions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: (status: TicketStatus) => void;
}

export function MoveToMenu({ leading, ticket, permissions, open, onOpenChange, onMove }: MoveToMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  // Runs only when the menu opens or closes, so re-renders don't steal focus.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onOpenChangeRef.current(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    rootRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = () => {
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    // The list opens inline inside the card, so the board's scroll area can never clip it.
    <div ref={rootRef} onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-end gap-2">
        {leading}
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={`Move to: change status of ${ticket.key}`}
          onClick={() => onOpenChange(!open)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          Move to
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Move ${ticket.key} to`}
          onKeyDown={onMenuKeyDown}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
        >
          {TICKET_STATUSES.map((status) => {
            const current = status.id === ticket.status;
            const reason = permissions.moveBlockedReason(status.id);
            const disabled = current || reason !== null;
            return (
              <button
                key={status.id}
                type="button"
                role="menuitem"
                disabled={disabled}
                title={reason ?? undefined}
                onClick={() => {
                  onMove(status.id);
                  close();
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[13px] ${
                  current
                    ? 'bg-indigo-50 font-semibold text-indigo-800'
                    : reason
                      ? 'cursor-not-allowed text-slate-400'
                      : 'text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{status.label}</span>
                <span className="text-[11px] font-normal text-slate-600">
                  {current ? 'Current' : reason ? (status.moveRule === 'pod_lead_sign_off' ? 'Needs Pod Lead sign-off' : 'Not for your role') : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
