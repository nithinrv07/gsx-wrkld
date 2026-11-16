'use client';

// TanStack Query hooks for tickets (doc 11.3). Query keys follow the doc's convention:
// ['projects', slug, 'tickets'] and related keys under the same project.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/services/api/ticketsApi';
import type {
  CreateTicketInput,
  Ticket,
  TicketDependency,
  TicketStatus,
  UpdateTicketInput,
} from '@/types/ticket';

export const ticketKeys = {
  project: (projectSlug: string) => ['projects', projectSlug, 'tickets'] as const,
  dependencies: (projectSlug: string) => ['projects', projectSlug, 'ticket-dependencies'] as const,
  sprints: (projectSlug: string) => ['projects', projectSlug, 'ticket-sprints'] as const,
};

/** All tickets in the project. The board filters to one pod; "Blocked by" needs the other pods. */
export function useProjectTickets(projectSlug: string) {
  return useQuery({
    queryKey: ticketKeys.project(projectSlug),
    queryFn: () => ticketsApi.listProjectTickets(projectSlug),
    enabled: projectSlug.length > 0,
  });
}

export function useTicketDependencies(projectSlug: string) {
  return useQuery({
    queryKey: ticketKeys.dependencies(projectSlug),
    queryFn: () => ticketsApi.listDependencies(projectSlug),
    enabled: projectSlug.length > 0,
  });
}

/** Sprints are owned by Module 3. Switch to its useSprints once that branch is merged. */
export function useTicketSprints(projectSlug: string) {
  return useQuery({
    queryKey: ticketKeys.sprints(projectSlug),
    queryFn: () => ticketsApi.listSprints(projectSlug),
    enabled: projectSlug.length > 0,
  });
}

export function useCreateTicket(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketsApi.createTicket(projectSlug, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.project(projectSlug) }),
  });
}

export function useUpdateTicket(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: UpdateTicketInput }) =>
      ticketsApi.updateTicket(projectSlug, key, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.project(projectSlug) }),
  });
}

/**
 * Kanban moves (doc 11.3): move the card immediately, then confirm with the server.
 * If the server refuses, put the card back. The caller shows the message.
 */
export function useMoveTicket(projectSlug: string) {
  const queryClient = useQueryClient();
  const key = ticketKeys.project(projectSlug);
  return useMutation({
    mutationFn: ({ ticketKey, status }: { ticketKey: string; status: TicketStatus }) =>
      ticketsApi.moveTicket(projectSlug, ticketKey, status),
    onMutate: async ({ ticketKey, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Ticket[]>(key);
      queryClient.setQueryData<Ticket[]>(key, (tickets) =>
        tickets?.map((t) => (t.key === ticketKey ? { ...t, status } : t))
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useAddDependency(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dependency: TicketDependency) => ticketsApi.addDependency(projectSlug, dependency),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.dependencies(projectSlug) }),
  });
}

export function useRemoveDependency(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dependency: TicketDependency) => ticketsApi.removeDependency(projectSlug, dependency),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.dependencies(projectSlug) }),
  });
}
