# Gym Circle

Gym Circle is a Next.js application for making personal progress visible without
turning it into performance, comparison, or social noise.

The product centers on a simple loop: record disciplined action, preserve
evidence of continuity, and stay connected to a small private circle of people
who witness the process.

## Current Status

This repository is in prototype stage. The current app uses mock data and
client-side state while the long-term architecture targets a server-first
Next.js application backed by Supabase and PostgreSQL.

Read [knowledge/CURRENT_STATE.md](knowledge/CURRENT_STATE.md) before assuming
the planned architecture has been implemented.

## Knowledge Kernel

The project uses a small AI knowledge kernel:

- [knowledge/README.md](knowledge/README.md): how the kernel works.
- [knowledge/CURRENT_STATE.md](knowledge/CURRENT_STATE.md): what is true today.
- [knowledge/MAP.md](knowledge/MAP.md): what to read for each task.
- [knowledge/PRINCIPLES.md](knowledge/PRINCIPLES.md): invariant rules.
- [knowledge/DOMAIN.md](knowledge/DOMAIN.md): domain language and ownership.
- [knowledge/ARCHITECTURE.md](knowledge/ARCHITECTURE.md): software boundaries.
- [knowledge/DATABASE.md](knowledge/DATABASE.md): data model and persistence.
- [knowledge/PLAYBOOKS.md](knowledge/PLAYBOOKS.md): standard workflows.
- [knowledge/MEMORY.md](knowledge/MEMORY.md): durable lessons and pitfalls.
- [knowledge/decisions/](knowledge/decisions/): major decision records.

The existing `docs/` directory remains valuable reference material. Canonical
truth lives in `knowledge/`.

## Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Run typecheck:

```bash
npm run typecheck
```

Run tests:

```bash
npm run test
```

Check formatting:

```bash
npm run format:check
```

Build:

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env.local` for local development and fill only local or
project-safe values.

Required public variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-only variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

Never commit real secrets.

## Stack Reality

Installed today:

- Next.js `16.2.7`
- React `19.2.4`
- TypeScript `6.0.3`
- Tailwind CSS `4`
- Supabase JS `2.106.2`
- Supabase SSR `0.12.0`
- Zod `4.4.3`
- React Hook Form `7.79.0`
- TanStack Query `5.101.0`
- Zustand `5.0.14`
- Vitest `4.1.9`
- Testing Library
- Prettier `3.8.4`

Planned but not yet installed or implemented: shadcn/ui, Drizzle ORM, database
migrations, RLS, and Server Actions.

## Infrastructure

Phase 1 created the project foundation without implementing business logic.

Created:

- `supabase/` project structure with config, seed placeholder, functions folder,
  and generated-types placeholder.
- `.env.example` for local configuration.
- `.editorconfig`, Prettier config, VS Code workspace recommendations, and
  formatting scripts.
- TanStack Query, Supabase, and no-op Theme providers in `app/providers.tsx`.
- Supabase browser/server/proxy helpers under `lib/supabase/`.
- `lib/env.ts` for typed public environment parsing.
- `features/` folders for commit, circle, profile, progress, and shared code.
- Vitest setup with a first utility test.

Not implemented yet:

- Auth flows.
- Real database schema.
- Supabase migrations.
- RLS policies.
- SQL triggers or functions.
- Server Actions.
- Feature migrations from the prototype routes.

## Development Log

### 2026-06-19 - Phase 1 Infrastructure

The project foundation was upgraded from prototype-only setup to an
implementation-ready base. Dependencies for validation, forms, server state,
Supabase SSR, formatting, and tests were installed. The app now has global
providers, a Supabase folder skeleton, typed environment parsing, feature-first
folders, and quality scripts for lint, typecheck, format, test, and build.

Validation required for this phase:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
