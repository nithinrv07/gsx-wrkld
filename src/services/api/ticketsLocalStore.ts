// Local tickets store, used until the backend team documents the tickets endpoints.
// It holds NO sample data: every project starts empty, and tickets people create are
// kept in this browser only (localStorage). Nothing here is sent to a server.

import type {
  CreateTicketInput,
  Ticket,
  TicketDependency,
  TicketSprintOption,
  TicketStatus,
  UpdateTicketInput,
} from '@/types/ticket';
import { nextTicketKey } from '@/features/tickets/lib/ticketHelpers';
import { isTicketStatus } from '@/constants/ticket-lifecycle';
import { ApiError, type TicketsDataSource } from './ticketsSource';
import { sprintsApi } from './sprintsApi';
import {
  isProjectTickets,
  seedKanbanProjectsFromDashboard,
  KNOWN_PREFIXES,
  matchProjectSlug,
  type ProjectTickets,
} from '@/features/tickets/lib/ticketAdapter';

export interface TicketsLocalStoreOptions {
  /** localStorage key. Omit to keep data in memory only (tests). */
  storageKey?: string;
  /** Whether to seed initial data from Dashboard mock tickets if empty. Defaults to true when storageKey is 'wrkld_local_tickets'. */
  seedFromDashboard?: boolean;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function keyPrefixFor(projectSlug: string): string {
  const letters = projectSlug.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase();
  return letters || 'TKT';
}

export class TicketsLocalStore implements TicketsDataSource {
  readonly kind = 'local' as const;
  private projects: ProjectTickets[] = [];
  private pendingFailure: ApiError | null = null;

  constructor(private readonly options: TicketsLocalStoreOptions = {}) {}

  /** Test helper: the next write fails with this HTTP status (for example 403). */
  failNextWrite(status: number, message = 'The server refused this change.'): void {
    this.pendingFailure = new ApiError(status, message);
  }

  async listProjectTickets(projectSlug: string): Promise<Ticket[]> {
    this.load();
    return clone(this.project(projectSlug).tickets);
  }

  async listDependencies(projectSlug: string): Promise<TicketDependency[]> {
    this.load();
    return clone(this.project(projectSlug).dependencies);
  }

  /** Sprints belong to Module 3 (Project & Sprint). Fetches sprints for the project. */
  async listSprints(projectSlug?: string): Promise<TicketSprintOption[]> {
    if (!projectSlug) return [];
    try {
      const sprints = await sprintsApi.getSprintsByProject(projectSlug);
      return sprints.map((s) => ({
        id: s.id,
        name: s.name,
        startDate: s.startDate,
        endDate: s.endDate,
      }));
    } catch {
      return [];
    }
  }

  async createTicket(projectSlug: string, input: CreateTicketInput): Promise<Ticket> {
    this.beforeWrite();
    const project = this.project(projectSlug);
    const title = input.title.trim();
    if (!title) throw new ApiError(422, 'A ticket needs a title.');
    const now = new Date().toISOString();
    const created: Ticket = {
      key: nextTicketKey(project.ticketKeyPrefix, project.tickets.map((t) => t.key)),
      projectSlug,
      podId: input.podId,
      title,
      description: input.description,
      type: input.type,
      status: 'backlog',
      assigneeId: input.assigneeId,
      sprintId: input.sprintId,
      createdAt: now,
      updatedAt: now,
    };
    project.tickets = [created, ...project.tickets];
    this.persist();
    return clone(created);
  }

  async updateTicket(projectSlug: string, key: string, input: UpdateTicketInput): Promise<Ticket> {
    this.beforeWrite();
    if (input.title !== undefined && !input.title.trim()) throw new ApiError(422, 'A ticket needs a title.');
    return this.patch(projectSlug, key, {
      ...input,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    });
  }

  async moveTicket(projectSlug: string, key: string, status: TicketStatus): Promise<Ticket> {
    this.beforeWrite();
    if (!isTicketStatus(status)) throw new ApiError(422, `Unknown status ${String(status)}.`);
    return this.patch(projectSlug, key, { status });
  }

  async addDependency(projectSlug: string, dependency: TicketDependency): Promise<TicketDependency> {
    this.beforeWrite();
    if (dependency.ticketKey === dependency.blockedByKey) throw new ApiError(422, 'A ticket can’t block itself.');
    const project = this.project(projectSlug);
    if (project.dependencies.some((d) => d.ticketKey === dependency.blockedByKey && d.blockedByKey === dependency.ticketKey)) {
      throw new ApiError(422, `${dependency.blockedByKey} is already blocked by ${dependency.ticketKey}. Two tickets can’t block each other.`);
    }
    const exists = project.dependencies.some(
      (d) => d.ticketKey === dependency.ticketKey && d.blockedByKey === dependency.blockedByKey
    );
    if (!exists) project.dependencies = [...project.dependencies, { ...dependency }];
    this.persist();
    return { ...dependency };
  }

  async removeDependency(projectSlug: string, dependency: TicketDependency): Promise<void> {
    this.beforeWrite();
    const project = this.project(projectSlug);
    project.dependencies = project.dependencies.filter(
      (d) => !(d.ticketKey === dependency.ticketKey && d.blockedByKey === dependency.blockedByKey)
    );
    this.persist();
  }

  // --- internals ---

  private project(projectSlug: string): ProjectTickets {
    let project = this.projects.find((p) => p.projectSlug === projectSlug || matchProjectSlug(p.projectSlug, projectSlug));
    if (!project) {
      project = {
        projectSlug,
        ticketKeyPrefix: KNOWN_PREFIXES[projectSlug] ?? keyPrefixFor(projectSlug),
        tickets: [],
        dependencies: [],
      };
      this.projects.push(project);
    }
    return project;
  }

  private patch(projectSlug: string, key: string, changes: Partial<Ticket>): Ticket {
    const project = this.project(projectSlug);
    const current = project.tickets.find((t) => t.key === key);
    if (!current) throw new ApiError(404, `Ticket ${key} was not found.`);
    const updated: Ticket = { ...current, ...changes, updatedAt: new Date().toISOString() };
    project.tickets = project.tickets.map((t) => (t.key === key ? updated : t));
    this.persist();
    return clone(updated);
  }

  private beforeWrite(): void {
    this.load();
    if (this.pendingFailure) {
      const failure = this.pendingFailure;
      this.pendingFailure = null;
      throw failure;
    }
  }

  /**
   * Re-reads saved data before every operation, so two open tabs never overwrite
   * each other's tickets. Data that is unreadable or the wrong shape is ignored.
   */
  private load(): void {
    const key = this.options.storageKey;
    if (!key || typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(key);
      const shouldSeed = this.options.seedFromDashboard ?? (key === 'wrkld_local_tickets');
      if (stored === null && shouldSeed) {
        this.projects = seedKanbanProjectsFromDashboard();
        this.persist();
        return;
      }
      if (!stored) return;
      const parsed: unknown = JSON.parse(stored);
      this.projects = Array.isArray(parsed) ? parsed.filter(isProjectTickets) : [];
    } catch {
      this.projects = [];
    }
  }

  private persist(): void {
    const key = this.options.storageKey;
    if (!key || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(this.projects));
    } catch {
      // Storage full or blocked: changes stay in memory for this visit.
    }
  }
}
