// Shared contract for every tickets data source (mock now, live later).

import type {
  CreateTicketInput,
  Ticket,
  TicketDependency,
  TicketSprintOption,
  TicketStatus,
  UpdateTicketInput,
} from '@/types/ticket';

/** Error shape shared by every data source. 401, 403 and the rest are handled by the UI (doc 11.3). */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface TicketsDataSource {
  readonly kind: 'local' | 'live';
  listProjectTickets(projectSlug: string): Promise<Ticket[]>;
  listDependencies(projectSlug: string): Promise<TicketDependency[]>;
  /** Sprints are owned by Module 3. The local store returns none. */
  listSprints(projectSlug: string): Promise<TicketSprintOption[]>;
  createTicket(projectSlug: string, input: CreateTicketInput): Promise<Ticket>;
  updateTicket(projectSlug: string, key: string, input: UpdateTicketInput): Promise<Ticket>;
  moveTicket(projectSlug: string, key: string, status: TicketStatus): Promise<Ticket>;
  addDependency(projectSlug: string, dependency: TicketDependency): Promise<TicketDependency>;
  removeDependency(projectSlug: string, dependency: TicketDependency): Promise<void>;
}
