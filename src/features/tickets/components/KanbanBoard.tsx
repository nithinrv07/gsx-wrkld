'use client';

// KanbanBoard and KanbanColumn (doc 9.3). Pod-scoped board with DnD Kit (doc 7.6).
// Columns follow the eight lifecycle states. The two states that need the Pod Lead's
// sign-off are grouped inside one dashed, locked zone.

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Lock } from 'lucide-react';
import { TICKET_STATUSES, type TicketStatusDefinition } from '@/constants/ticket-lifecycle';
import type { Ticket, TicketStatus } from '@/types/ticket';
import type { TicketPermissions } from '../lib/ticketPermissions';
import { groupTicketsByStatus } from '../lib/ticketHelpers';
import { TicketCard } from './TicketCard';

export interface KanbanBoardProps {
  tickets: Ticket[];
  permissions: TicketPermissions;
  assigneeName: (assigneeId: string | null) => string;
  openKey: string | null;
  onOpen: (key: string) => void;
  onMove: (key: string, status: TicketStatus) => void;
  onApprove: (key: string) => void;
}

export function KanbanBoard({ tickets, permissions, assigneeName, openKey, onOpen, onMove, onApprove }: KanbanBoardProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // A small distance lets clicks on the title and buttons work without starting a drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStatus = groupTicketsByStatus(tickets, TICKET_STATUSES.map((s) => s.id));
  const activeTicket = activeKey ? tickets.find((t) => t.key === activeKey) ?? null : null;

  const onDragStart = (event: DragStartEvent) => {
    setMenuFor(null);
    setActiveKey(String(event.active.id));
  };
  const onDragEnd = (event: DragEndEvent) => {
    setActiveKey(null);
    const target = event.over?.id;
    const ticket = tickets.find((t) => t.key === event.active.id);
    if (!ticket || !target || target === ticket.status) return;
    onMove(ticket.key, target as TicketStatus);
  };

  const columnProps = {
    byStatus,
    permissions,
    assigneeName,
    openKey,
    menuFor,
    setMenuFor,
    onOpen,
    onMove,
    onApprove,
    dragging: activeKey !== null,
    activeKey,
  };

  const anyRule = TICKET_STATUSES.filter((s) => s.moveRule === 'any');
  const signOff = TICKET_STATUSES.filter((s) => s.moveRule === 'pod_lead_sign_off');
  const openRule = TICKET_STATUSES.filter((s) => s.moveRule === 'open_question');

  // Screen-reader announcements use lifecycle labels, not internal ids.
  const statusLabel = (id: unknown) => TICKET_STATUSES.find((s) => s.id === id)?.label ?? 'no column';
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ticket ${active.id}.`,
    onDragOver: ({ active, over }) => `Ticket ${active.id} is over ${statusLabel(over?.id)}.`,
    onDragEnd: ({ active, over }) =>
      over ? `Ticket ${active.id} was dropped on ${statusLabel(over.id)}.` : `Ticket ${active.id} was dropped outside the board.`,
    onDragCancel: ({ active }) => `Moving ticket ${active.id} was cancelled.`,
  };

  return (
    <DndContext
      sensors={sensors}
      accessibility={{ announcements }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveKey(null)}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex w-max items-start gap-4">
          <div className="flex items-start gap-3 p-2.5">
            {anyRule.map((s) => <KanbanColumn key={s.id} status={s} {...columnProps} />)}
          </div>
          <section
            aria-label="Needs Pod Lead sign-off"
            className="rounded-2xl border-[1.5px] border-dashed border-indigo-300 bg-indigo-50/40 p-2.5"
          >
            <div className="flex items-center gap-2 px-1 pb-2.5">
              <Lock className="h-3.5 w-3.5 text-indigo-700" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-indigo-900">Needs Pod Lead sign-off</span>
              <span className="text-xs text-slate-600">
                {permissions.canApprove ? 'You can approve here.' : 'Ask the Pod Lead to approve.'}
              </span>
            </div>
            <div className="flex items-start gap-3">
              {signOff.map((s) => <KanbanColumn key={s.id} status={s} {...columnProps} />)}
            </div>
          </section>
          <div className="flex items-start gap-3 p-2.5">
            {openRule.map((s) => <KanbanColumn key={s.id} status={s} {...columnProps} />)}
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTicket ? (
          <div className="w-60">
            <TicketCard ticket={activeTicket} assigneeName={assigneeName(activeTicket.assigneeId)} permissions={permissions} preview />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface KanbanColumnProps {
  status: TicketStatusDefinition;
  byStatus: Record<TicketStatus, Ticket[]>;
  permissions: TicketPermissions;
  assigneeName: (assigneeId: string | null) => string;
  openKey: string | null;
  menuFor: string | null;
  setMenuFor: (key: string | null) => void;
  onOpen: (key: string) => void;
  onMove: (key: string, status: TicketStatus) => void;
  onApprove: (key: string) => void;
  dragging: boolean;
  activeKey: string | null;
}

export function KanbanColumn({
  status,
  byStatus,
  permissions,
  assigneeName,
  openKey,
  menuFor,
  setMenuFor,
  onOpen,
  onMove,
  onApprove,
  dragging,
  activeKey,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  const tickets = byStatus[status.id] ?? [];
  const reason = permissions.moveBlockedReason(status.id);
  const locked = reason !== null;
  const position = TICKET_STATUSES.findIndex((s) => s.id === status.id) + 1;

  return (
    <section
      ref={setNodeRef}
      aria-label={`${status.label}, ${tickets.length} ${tickets.length === 1 ? 'ticket' : 'tickets'}`}
      className={`w-64 flex-none rounded-xl px-2 pb-3 pt-2.5 transition-shadow ${
        status.moveRule === 'pod_lead_sign_off' ? 'bg-indigo-100/50' : 'bg-slate-100'
      } ${isOver && !locked ? 'ring-2 ring-[#5851d8]' : ''} ${isOver && locked ? 'ring-2 ring-rose-600' : ''}`}
    >
      <header className="flex items-center gap-2 px-1 pb-2.5">
        <span aria-hidden="true" className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold tabular-nums text-slate-600">
          {position}
        </span>
        <h3 className="text-[13px] font-semibold text-slate-800">{status.label}</h3>
        <span className="text-xs tabular-nums text-slate-600">{tickets.length}</span>
        {locked && (
          <span className="ml-auto text-indigo-700" title={reason ?? undefined}>
            <Lock className="h-3.5 w-3.5" role="img" aria-label={reason ?? undefined} />
          </span>
        )}
      </header>

      {locked && dragging && (
        <p className="mb-2 rounded-lg border-[1.5px] border-dashed border-indigo-300 bg-indigo-50 px-2 py-2 text-center text-xs text-indigo-900">
          {status.moveRule === 'pod_lead_sign_off' ? 'Needs Pod Lead sign-off' : 'Not for your role'}
        </p>
      )}

      <div className="flex min-h-24 flex-col gap-2">
        {tickets.map((ticket) => (
          <DraggableTicket
            key={ticket.key}
            ticket={ticket}
            hidden={activeKey === ticket.key}
            assigneeName={assigneeName(ticket.assigneeId)}
            permissions={permissions}
            isOpen={openKey === ticket.key}
            menuOpen={menuFor === ticket.key}
            onMenuOpenChange={(open) => setMenuFor(open ? ticket.key : null)}
            onOpen={() => onOpen(ticket.key)}
            onMove={(next) => onMove(ticket.key, next)}
            onApprove={() => onApprove(ticket.key)}
          />
        ))}
        {tickets.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 px-2 py-3.5 text-center text-xs text-slate-600">No tickets</p>
        )}
      </div>
    </section>
  );
}

function DraggableTicket({
  hidden,
  ...cardProps
}: React.ComponentProps<typeof TicketCard> & { hidden: boolean }) {
  const { setNodeRef, listeners } = useDraggable({ id: cardProps.ticket.key });
  // Only pointer listeners are attached. Keyboard users move tickets with the "Move to" menu (doc 10.4).
  return (
    <div ref={setNodeRef} {...listeners} className={`cursor-grab touch-none ${hidden ? 'opacity-40' : ''}`}>
      <TicketCard {...cardProps} />
    </div>
  );
}
