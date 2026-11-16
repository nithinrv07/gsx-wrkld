// Turns any data-source error into a short message (doc 11.3):
// 401 goes to sign-in, 403 shows a permission message, other errors show a message and a retry.

import { ApiError } from '@/services/api/ticketsSource';

export function describeTicketError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session ended. Sign in again to continue.';
    if (error.status === 403) return 'You don’t have permission to do that.';
    if (error.status === 501) return error.message;
    return error.message || 'Something went wrong. Try again.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Try again.';
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
