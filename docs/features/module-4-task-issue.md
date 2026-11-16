# Module 4: Task & Issue Management (feature note)

Owner: Task & Issue Developer. Tracker items: M11, M12, Stretch S1, S3.
Status: In Progress (branch `feature/task-and-issue-management`). Data source: **Local** (no sample data; not connected to a server).
Not Completed until the evidence rule in doc 1.3 is met (merged PR, demo, tests, data source).

## What it does

- **M11 Kanban board** on the pod page Board tab (`/projects/[slug]/pods/[pod]`).
  Eight lifecycle columns, drag and drop with DnD Kit, and a "Move to" menu as the keyboard alternative.
  Filters by assignee, type and sprint.
- **M12 Tickets.** Ticket creation (title, description, type, assignee, sprint) and a ticket detail panel with
  edit and status change. All five types, including Bug / Regression and Blocker Flag.
  A Contributor cannot move a ticket to Pod Lead Approved or Ready for Integration; the Pod Lead
  gives sign-off with the **Approve** action.
- **S1 Blocked by.** In the ticket detail panel, link an upstream ticket from another pod. Manual only:
  no timers, no escalation. No dependency badges on cards (Future Enhancement, doc 3.3).
- **S3 Pod backlog list view.** "Backlog list" switch inside the Board tab: plan Backlog tickets into a sprint,
  then move them to Todo.

## Where things are

| Path | What |
|---|---|
| `src/types/ticket.ts` | Ticket model |
| `src/constants/ticket-lifecycle.ts` | Lifecycle, status labels, StatusBadge mapping, ticket types (shared with the Lead and Dashboard) |
| `src/services/api/ticketsApi.ts` | Data source switch: `NEXT_PUBLIC_WRKLD_DATA_SOURCE=local` (default) or `live` |
| `src/services/api/ticketsLocalStore.ts` | Local store with no sample data. Every project starts empty; tickets are kept in the browser |
| `src/features/tickets/` | Components, hooks (TanStack Query) and pure helpers |
| `src/features/tickets/lib/ticketPermissions.ts` | The only place Module 4 reads role rules (from `lib/permissions`) |
| `src/__tests__/module4.test.ts` | Unit tests: `npx tsx --test src/__tests__/module4.test.ts` |

## Reuse

The board takes the project, pod, members and current user as props, and all ticket data comes from the
data source. There is no sample ticket data. Nothing about a specific project is written into the components.

## Open items for the team

1. One permission system: `lib/permissions` (doc roles) or Module 3's `lib/auth/rbac.tsx` (doc 8.2).
2. Shared project slugs across modules (`wrkld` vs `wrkld-core`).
3. Merge Module 3 so tickets use its sprints and `QueryProvider`. Until then Module 4 has
   no sprints (the sprint lists show only "No sprint") and its own QueryClient fallback (`TicketsQueryBoundary`).
4. Open Question 6: who may set Integration Verified and Done. Currently: whoever can approve.
5. Can Contributors edit a ticket's title and description? Currently: yes.
6. Ticket key prefix per project (`ticketKeyPrefix`) is Proposed; the blueprint doesn't define it.
7. The pod page is dark while the app shell is light (doc 10.2: no dark theme in the MVP).
8. Tickets endpoints are not defined (Open Question 1). The `live` source refuses clearly until they are.
