// Tickets data source for Module 4. One environment setting chooses the source (doc 11.3),
// so switching needs no change inside components:
//   NEXT_PUBLIC_WRKLD_DATA_SOURCE=local (default) | live
// - local: no sample data. Tickets people create are kept in this browser only.
// - live:  the real backend. No endpoint is invented here; it refuses clearly until the
//          backend team documents the tickets endpoints (doc 11.4, Open Question 1).

import { ApiError, type TicketsDataSource } from './ticketsSource';
import { TicketsLocalStore } from './ticketsLocalStore';

export { ApiError, type TicketsDataSource } from './ticketsSource';

const notDefinedYet = (): never => {
  throw new ApiError(501, 'The tickets endpoints are not defined by the backend team yet.');
};

/** Placeholder until the backend documents the endpoints. Never pretends to be integrated. */
export const liveTicketsSource: TicketsDataSource = {
  kind: 'live',
  listProjectTickets: async () => notDefinedYet(),
  listDependencies: async () => notDefinedYet(),
  listSprints: async () => notDefinedYet(),
  createTicket: async () => notDefinedYet(),
  updateTicket: async () => notDefinedYet(),
  moveTicket: async () => notDefinedYet(),
  addDependency: async () => notDefinedYet(),
  removeDependency: async () => notDefinedYet(),
};

export const localTicketsSource = new TicketsLocalStore({ storageKey: 'wrkld_local_tickets' });

export const ticketsApi: TicketsDataSource =
  process.env.NEXT_PUBLIC_WRKLD_DATA_SOURCE === 'live' ? liveTicketsSource : localTicketsSource;
