# Wrkld — Frontend Lead Handover Documentation

**Document Status:** Final Handover  
**Author:** Shwetha V (Frontend Lead)  
**Target Repository:** `nithinrv07/gsx-wrkld`  
**Working Branch:** `fix/wrkld-integration-foundation`  
**Reference Specification:** Wrkld Frontend Audit Revision 2  
**Date:** November 20, 2026  

---

## Table of Contents
1. [Frontend Architecture and Route Structure](#1-frontend-architecture-and-route-structure)
2. [Shared Providers and Single QueryClient](#2-shared-providers-and-single-queryclient)
3. [Navigation and TopNavbar Implementation](#3-navigation-and-topnavbar-implementation)
4. [Frontend Technology Stack](#4-frontend-technology-stack)
5. [Form Validation and Drag-and-Drop Implementation](#5-form-validation-and-drag-and-drop-implementation)
6. [Test Commands and Verification Results](#6-test-commands-and-verification-results)
7. [Git Branch and Commit Details](#7-git-branch-and-commit-details)
8. [CI Workflow and GitHub Actions Automation](#8-ci-workflow-and-github-actions-automation)
9. [Mock-Data Limitations and Backend Integration Dependencies](#9-mock-data-limitations-and-backend-integration-dependencies)
10. [Outstanding Work Belonging to Other Module Owners](#10-outstanding-work-belonging-to-other-module-owners)
11. [Path A Route-Retention Decision and Deferred Strict Pruning](#11-path-a-route-retention-decision-and-deferred-strict-pruning)

---

## 1. Frontend Architecture and Route Structure

The application is built on the **Next.js 16 App Router** (`next: 16.4.6`, `react: 19.3.0`, Webpack bundler). It enforces a strict separation between authenticated application pages and unauthenticated authentication views using Next.js Route Groups.

```
src/app/
├── (app)/                          # Authenticated Route Group (Protected Shell)
│   ├── layout.tsx                  # Wraps children in <AppLayout> (Sidebar + TopNavbar)
│   ├── dashboard/page.tsx          # Multi-pod agile dashboard & KPI delivery metrics
│   ├── projects/
│   │   ├── page.tsx                # Project directory (cards/table, search, filters, create modal)
│   │   └── [slug]/
│   │       ├── page.tsx            # Project details, telemetry, domain pods, sprints, embedded analytics
│   │       └── pods/
│   │           ├── page.tsx        # Suspense-wrapped graceful redirect to /projects/[slug]
│   │           └── [pod]/page.tsx  # Pod Kanban Board, Team Roster, and Lead sign-off
│   ├── pods/page.tsx               # Engineering Pods directory (FE, BE, INT, QA)
│   ├── sprints/page.tsx            # Sprints roadmap & active iteration timelines
│   ├── tasks/page.tsx              # Cross-pod work items directory & universal ticket search
│   ├── analytics/page.tsx          # Global cross-project comparative analytics suite
│   └── settings/page.tsx           # Profile info, testing persona switcher, RBAC matrix
├── (auth)/                         # Unauthenticated Route Group (Bare Shell)
│   └── sign-in/page.tsx            # Persona selection & GitHub sign-in (No sidebar/topbar)
├── favicon.ico
├── globals.css                     # Tailwind CSS and global design tokens
├── layout.tsx                      # Root shell (<html>, <body>, Geist fonts, QueryProvider)
└── page.tsx                        # Root route redirecting to /dashboard
```

### Route Behavior Rules
1. **Root Access:** Hitting `/` directly executes `redirect('/dashboard')` on the server without flashes.
2. **Post-Login Redirection:** Completing persona sign-in on `/sign-in` directs the user directly to `/dashboard`.
3. **AppLayout Isolation:** `<AppLayout>` resides exclusively within `src/app/(app)/layout.tsx`. `/sign-in` renders with the root HTML layout only, preventing sidebar/topbar leakage.
4. **Graceful Subroute Fallbacks:** Navigating directly to `/projects/[slug]/pods` gracefully redirects to `/projects/[slug]`.

---

## 2. Shared Providers and Single QueryClient

To resolve the duplicate QueryClient bug identified in Audit Revision 2 (where `DashboardProviders` and `TicketsQueryBoundary` created competing in-memory query caches), the entire application now shares **exactly one QueryClient instance**.

### Provider Hierarchy
* **Root Provider:** [src/app/layout.tsx](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/app/layout.tsx) wraps all route groups in a single `<QueryProvider>`.
* **Implementation:** [src/providers/QueryProvider.tsx](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/providers/QueryProvider.tsx) uses a stable client ref (`useState(() => createQueryClient())`) configured with:
  * `staleTime: 60 * 1000` (1 minute cache freshness)
  * `refetchOnWindowFocus: false` (prevents unnecessary refetches on focus shift)
  * `retry: 1`
* **Deprecated Boundaries Removed:**
  * `DashboardProviders.tsx` deleted.
  * `TicketsQueryBoundary.tsx` deleted.
  * All modules (Dashboard, Projects, Sprints, Pods, Tickets, Analytics) share the same query cache.

### Standardized Query Keys
All query keys follow the hierarchical pattern defined in [src/constants/queryKeys.ts](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/constants/queryKeys.ts):
* Projects: `['projects']`, `['projects', slug]`
* Sprints: `['sprints']`, `['sprints', projectSlug]`
* Tickets: `['tickets']`, `['tickets', projectSlug, pod]`
* Dashboard: `['dashboard']`, `['dashboard', 'summary']`, `['dashboard', 'blockers']`
* Analytics: `['analytics']`, `['analytics', slug]`

---

## 3. Navigation and TopNavbar Implementation

### Dynamic TopNavbar
The top navigation bar ([src/components/layout/TopNavbar.tsx](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/components/layout/TopNavbar.tsx)) provides dynamic, contextual status:
1. **Dynamic Active Sprint Indicator:** Derives active sprint name from `useSprints(projectSlug)` instead of hardcoded strings (e.g. `Sprint 2 (Current)`).
2. **Live Blocker Notifications:** Wired to `useOpenBlockers()` and persistent `useReadAlerts(userId)`. Features an unread badge indicator, dropdown alert list with ticket links, and a functional "Mark all as read" button.
3. **Dynamic Route Breadcrumbs:** Generates contextual breadcrumbs matching route segments (e.g. `Home > Projects > Wrkld Platform > Frontend Pod`), with valid clickable parent links.
4. **Single-Layout Guarantee:** Rendered exactly once via `(app)/layout.tsx` (`<header>` count strictly equals 1 on all authenticated pages, 0 on `/sign-in`).
5. **Clean User Menu:** Obsolete duplicate Settings link removed; displays authenticated persona details (`name`, `@githubHandle`, `globalRole`) and accessible Sign Out trigger.

### Sidebar Navigation
[src/components/layout/Sidebar.tsx](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/components/layout/Sidebar.tsx) maps to the seven canonical navigation destinations (`NAV_ITEMS`):
* **Main Menu:** Dashboard (`/dashboard`), Projects (`/projects`), Pods (`/pods`), Sprints (`/sprints`), Kanban / Tasks (`/tasks`), Analytics (`/analytics`).
* **General Menu:** Settings (`/settings`), Sign Out. (Redundant `Help & Docs` duplicate removed).
* **Footer:** Displays canonical logged-in persona name, role, and initials from `useMockSession()`.

---

## 4. Frontend Technology Stack

The project frontend stack comprises:
* **Framework:** Next.js 16.4.6 (App Router, Partial Prerendering, Cache Components)
* **Runtime / Core:** React 19.3.0, React DOM 19.3.0
* **Data Fetching & State:** `@tanstack/react-query` 5.107.1
* **Form Handling:** `react-hook-form` 7.92.0
* **Schema Validation:** `zod` 4.6.7 + `@hookform/resolvers` 7.0.7
* **Drag-and-Drop:** `@dnd-kit/core` 6.3.1, `@dnd-kit/sortable` 10.0.0, `@dnd-kit/utilities` 3.2.2
* **Component Primitives / Utility:** shadcn/ui configuration (`components.json`), `clsx` 2.1.1, `tailwind-merge` 3.7.1, `src/lib/utils.ts` (`cn`)
* **Icons:** `lucide-react` 1.67.0
* **Testing:** Vitest 4.1.12, `@testing-library/react` 16.3.2, Playwright 1.65.1
* **Styling:** Tailwind CSS, CSS Variables for branding (`#5851d8`, `brand-500`)

---

## 5. Form Validation and Drag-and-Drop Implementation

### Zod + React Hook Form Integration
* **Project Creation Modal ([CreateProjectModal.tsx](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/components/projects/CreateProjectModal.tsx)):**
  * `createProjectSchema`: Validates project name (min 3 characters), slug format (lowercase alphanumeric and hyphens), target date ISO format, and asynchronous slug uniqueness check (`projectsApi.isSlugUnique`).
  * Employs `useForm<CreateProjectFormData>({ resolver: zodResolver(createProjectSchema) })`.
* **Sprint Creation Modal ([CreateSprintModal.tsx](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/components/sprints/CreateSprintModal.tsx)):**
  * `createSprintSchema`: Validates sprint name, date bounds, status, and goal.
  * Uses `.refine((data) => new Date(data.endDate) > new Date(data.startDate))` enforcing that end dates strictly succeed start dates.

### DnD Kit Sortable Integration
* **Kanban Board ([KanbanBoard.tsx](file:///e:/gsx-wrkld-main/gsx-wrkld-main/src/features/tickets/components/KanbanBoard.tsx)):**
  * Uses `SortableContext` with `verticalListSortingStrategy` per lifecycle column.
  * Cards wrapped in `SortableTicket` using `useSortable({ id: ticket.key })`.
  * Preserves all agile sign-off restrictions: Contributors cannot move tickets directly into `Pod Lead Approved` or `Ready for Integration`; only Pod Leads or Super Admins can provide sign-off approval.

---

## 6. Test Commands and Verification Results

### Verification Commands
```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Unit and Integration Test Suite
npm test

# 4. Production Webpack Build
npm run build

# 5. Playwright End-to-End Suite
npm run test:e2e
```

### Actual Verified Results (All Passed)
* **TypeScript Typecheck:** 0 errors.
* **ESLint:** 0 errors, 0 warnings.
* **Vitest Suite:** **11 passed test files**, **106 passed tests** (0 failed).
  * `routes.test.ts` (8 tests) — PASSED
  * `ticketAdapter.test.ts` (13 tests) — PASSED
  * `logic.test.ts` (6 tests) — PASSED
  * `module4.test.ts` (23 tests) — PASSED
  * `Sidebar.test.tsx` (6 tests) — PASSED
  * `TopNavbar.test.tsx` (5 tests) — PASSED
  * `stack.test.ts` (7 tests) — PASSED
  * `progress.test.tsx` (7 tests) — PASSED
  * `panels.test.tsx` (9 tests) — PASSED
  * `module3.test.ts` (16 tests) — PASSED
  * `DashboardView.test.tsx` (6 tests) — PASSED
* **Playwright E2E Suite:** **5 passed tests** (0 failed).
  * Complete user journey (sign-in ➔ dashboard ➔ projects ➔ project detail ➔ pod ➔ pod board) — PASSED
  * Single TopNavbar render check on `/dashboard` — PASSED
  * Single TopNavbar render check on `/projects` and Pod Board — PASSED
  * TopNavbar absent on `/sign-in` — PASSED
  * Dynamic breadcrumbs, blocker notifications, and user menu settings removal — PASSED
* **Next.js Production Build:** Compiled successfully in 2.7s; static and partial prerendering generated **15/15 routes** with 0 errors.

---

## 7. Git Branch and Commit Details

* **Working Branch:** `fix/wrkld-integration-foundation`
* **Base Branch:** `main` (commit `85229fd`)
* **Remote Repository:** `https://github.com/nithinrv07/gsx-wrkld.git`
* **Committed Scope:** All 8 completed audit tasks:
  1. Task 1: Decoupled AppLayout into `(app)/layout.tsx`
  2. Task 2: Post-login redirect to `/dashboard`
  3. Task 3: Unified shared QueryClient & query key conventions
  4. Task 4: Playwright E2E smoke tests
  5. Task 5: Automated GitHub Actions CI workflow
  6. Task 6: Dynamic TopNavbar, notifications, and breadcrumbs
  7. Task 7: React Hook Form, Zod, and `@dnd-kit/sortable`
  8. Task 8: Path A Route & Navigation cleanup, project analytics embedding

---

## 8. CI Workflow and GitHub Actions Automation

The CI pipeline is defined in [.github/workflows/ci.yml](file:///e:/gsx-wrkld-main/gsx-wrkld-main/.github/workflows/ci.yml).

### Workflow Triggers
* Pushes to `main`
* Pull Requests targeting `main`
* Manual dispatch (`workflow_dispatch`)

### Pipeline Stages
1. Check out code (`actions/checkout@v4`).
2. Node.js 20 environment with npm caching (`actions/setup-node@v4`).
3. Clean dependency installation (`npm ci`).
4. Type checking (`npx tsc --noEmit`).
5. Lint validation (`npm run lint`).
6. Unit & integration test execution (`npm test`).
7. Next.js Webpack production build (`npx next build --webpack`).
8. Playwright browser engine setup (`npx playwright install --with-deps chromium`).
9. End-to-end smoke test execution (`npm run test:e2e`).
10. Automatic test artifact archiving (`actions/upload-artifact@v4`).

---

## 9. Mock-Data Limitations and Backend Integration Dependencies

The frontend is currently architected to run autonomously in the browser without a live database or API backend:
1. **Mock Session Storage:** Authenticated personas (`Nithin R V`, `Shwetha V`, `Arun K`, `Priya S`, `Dev Contributor`) persist in browser `localStorage['wrkld_mock_session']`. Real OAuth / JWT authentication is not yet connected.
2. **Local Storage Repositories:** Projects, Sprints, and Tickets persist across browser refreshes via `localStorage` mock stores (`wrkld_mock_projects`, `wrkld_mock_sprints`, `wrkld_mock_tickets`).
3. **Pod Member State:** Pod membership edits and role updates currently persist in React component memory; refreshing the browser resets member rosters to `MOCK_PODS`.
4. **Backend API Endpoints:** No server-side Next.js route handlers (`/api/*`) or database ORMs (e.g. Prisma, Drizzle) exist yet. Switching `NEXT_PUBLIC_WRKLD_DATA_SOURCE=live` will return 501 Not Implemented until backend endpoints are provisioned.

---

## 10. Outstanding Work Belonging to Other Module Owners

The following responsibilities remain outside the Frontend Lead scope and belong to subsequent backend/platform milestones:
1. **Module 1 (Backend API & Database):** Provision real PostgreSQL/MySQL database, migrations, and Next.js `/api` endpoints for projects, pods, sprints, and tickets.
2. **Module 2 (Full Telemetry Engine):** Connect real-time telemetry calculation and historical velocity tracking to backend metrics.
3. **Module 3 (Project & Sprint Backend):** Implement permanent project/sprint deletion and archival endpoints.
4. **Module 4 (Task & Issue Backend):** Implement real ticket assignment notifications, persistent blocker webhooks, and ticket deletion.
5. **Module 5 (Auth & RBAC Backend):** Implement GitHub OAuth authentication, HTTP-only session cookies, and server-side authorization middleware.

---

## 11. Path A Route-Retention Decision and Deferred Strict Pruning

During the Task 8 review, an architectural decision was evaluated between **Path A (Seven-Route Hybrid Architecture)** and **Path B (Strict Route Pruning)**:

* **Approved Decision (Path A):**
  * Retain all seven canonical navigation destinations (`/dashboard`, `/projects`, `/sprints`, `/tasks`, `/pods`, `/analytics`, `/settings`).
  * Embed project-level analytics, milestone telemetry, and ticket drill-down tables directly into `/projects/[slug]` for immediate context.
  * Retain the top-level `/analytics` route as a global cross-project comparison tool.
  * Retain `/pods`, `/sprints`, and `/tasks` as organization-wide directory hubs.
  * Keep `/settings` active for testing persona switching and RBAC validation.
* **Deferred Strict Pruning (Path B):**
  * The recommendation to eliminate top-level `/pods`, `/sprints`, `/tasks`, and `/analytics` and redirect them into `/projects/wrkld` was deliberately deferred. This preserves full functionality, prevents user disorientation, aligns with `NAV_ITEMS`, and maintains comprehensive test coverage.
