# Architecture

Question: How is the software organized?

Last reviewed: 2026-06-19

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

The current implementation is a prototype:

- Route pages in `app/` contain feature UI and logic.
- Pages are mostly client components.
- Zustand stores hold mock domain data.
- `features/` exists as a skeleton but does not own implementation yet.
- There are no Server Actions yet.
- Supabase has browser/server/proxy helper foundations, but no real auth or
  persistence flow yet.
- `app/providers.tsx` wires TanStack Query and Supabase context globally.

See `CURRENT_STATE.md` before assuming target architecture exists.

## Intended Dependency Direction

```text
app -> features -> components/ui
app -> features -> lib
features -> lib
features -> types
features -/-> features
lib -/-> app
lib -/-> features
stores -/-> persistent server data
```

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

Current reality: Zustand stores currently hold mock Commit and Circle data.

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
