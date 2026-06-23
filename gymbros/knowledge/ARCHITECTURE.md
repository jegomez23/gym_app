# Architecture

Question: How is the software organized?

Last reviewed: 2026-06-23

## Target Architecture

Gym Circle targets a server-first Next.js App Router architecture:

- `app/` owns routing, layouts, loading states, and error boundaries.
- Feature code lives in `features/[feature]/`.
- Shared UI lives in `components/`.
- Shared framework/domain utilities live in `lib/`.
- Client stores are limited to ephemeral UI state.
- Persistent data lives in Supabase/PostgreSQL.
- Mutations use Server Actions unless an external HTTP endpoint is required.
- Client server-state synchronization uses TanStack Query when client-side
  refetching, optimistic updates, or realtime interaction is needed.

## Current Architecture

The current implementation has moved beyond the route-local prototype:

- Route pages in `app/` are server orchestrators.
- Feature modules in `features/` own route-specific queries, screens, and
  actions.
- Server reads use `lib/dal/` services through feature query modules.
- Commit publishing and Circle support writes use Server Actions.
- Auth, password recovery, onboarding, profile update, and logout flows use
  Server Actions.
- Client components are limited to React Hook Form flows and transient UI
  interaction.
- Supabase has browser/server/proxy helper foundations, typed by the database
  contract.
- `proxy.ts` (root) IS the active Next.js proxy/middleware entry point. Next.js
  16 deprecated `middleware.ts` and renamed the file convention to `proxy.ts`
  with a named `proxy` export. It refreshes Supabase sessions, protects private
  routes, redirects authenticated users away from auth entry pages, and sends
  pending profiles to onboarding. The proxy runtime cannot import `server-only`
  DAL modules; the direct profile query is intentional.
- `app/providers.tsx` exposes the browser Supabase client globally
  (`useSupabase`) for client Realtime subscriptions (Circle, Notifications).
  TanStack Query was removed in Phase 13 (zero consumers); client server-state
  is handled by Server Actions + Realtime + `router.refresh()`.

See `CURRENT_STATE.md` before assuming target architecture exists.

## Intended Dependency Direction

```text
app -> features -> components/ui
app -> features -> lib
features -> lib
features -/-> features
lib -/-> app
lib -/-> features
stores -/-> persistent server data
```

## Data Access Layer

`lib/dal/` is the only approved application boundary for domain database access.

It contains:

- repositories for direct aggregate persistence
- services for domain orchestration
- RPC wrappers for SQL functions
- mappers between Supabase rows and domain models
- Zod schemas for validation
- domain error classes that hide Supabase/PostgREST errors

Current dependency direction:

```text
UI -> Server Actions -> DAL services -> DAL repositories/RPC/Auth -> Supabase
```

Server Actions should orchestrate DAL services and validate request/session
context. They should not build Supabase queries directly.

Authorization helpers live in `lib/auth/authorization.ts`. Session/profile
guards live in `lib/auth/session.ts` and are the canonical entry point for
requiring authenticated users or completed profiles.

## Client And Server Responsibilities

Server:

- initial data reads
- authentication/session-aware data access
- authorization checks
- Server Actions
- validation at trusted boundaries
- cache invalidation and revalidation

Client:

- browser-only interactivity
- form interaction
- transient UI state
- optimistic UI where justified
- realtime subscriptions where needed

## State Management

Target categories:

| State type                    | Owner                    |
| ----------------------------- | ------------------------ |
| Persistent domain data        | Supabase/PostgreSQL      |
| Server state needed in client | TanStack Query           |
| Form state                    | React Hook Form          |
| UI-only shared state          | Zustand                  |
| Local component state         | React state              |
| URL state                     | App Router search params |

Current reality: persistent domain data is no longer stored in client stores.
Client state is local to interactive components such as the Commit form.

## API Philosophy

- CRUD-style app mutations should use Server Actions.
- Route Handlers are reserved for webhooks, external integrations, streaming,
  or endpoints that must be HTTP-addressable.
- Database authorization must not depend only on application code; RLS is the
  final line of defense.

## Reference Sources

- `docs/architecture/00-project-architecture.md`
- `docs/architecture/01-folder-structure.md`
- `docs/architecture/02-development-rules.md`
- `docs/architecture/03-feature-architecture.md`
- `docs/architecture/04-state-management.md`
- `docs/architecture/05-routing.md`
- `docs/architecture/07-data-flow.md`
