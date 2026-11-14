// Public entry point for Module 4 (Task & Issue Management).
// Other modules import from here only (doc 9.4: a feature does not import another feature's internals).

export { PodBoard, type PodBoardProps } from './PodBoard';
export { getTicketPermissions, type TicketPermissions } from './lib/ticketPermissions';
export { ticketKeys, useProjectTickets } from './hooks/useTickets';
