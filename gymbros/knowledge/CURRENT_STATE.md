# Current State

Question: What is true today?

Last reviewed: 2026-06-19

## Project Stage

Gym Circle is an early prototype with a substantial reference documentation set.
The current application demonstrates the product direction with mock data,
client-side stores, and mobile-first UI.

The target architecture is server-first, feature-first, Supabase-backed, and more
structured than the implementation that exists today.

## Installed Stack

| Area             | Current reality                                                   |
| ---------------- | ----------------------------------------------------------------- |
| Framework        | Next.js `16.2.7`                                                  |
| React            | `19.2.4`                                                          |
| TypeScript       | `6.0.3`, strict enabled                                           |
| Styling          | Tailwind CSS `4` via `@tailwindcss/postcss`                       |
| Backend SDK      | `@supabase/supabase-js` `2.106.2`, `@supabase/ssr` `0.12.0`       |
| Validation/forms | Zod `4.4.3`, React Hook Form `7.79.0`, Hookform resolvers `5.4.0` |
| Server state     | TanStack Query `5.101.0`                                          |
| Client state     | Zustand `5.0.14`                                                  |
| Testing          | Vitest `4.1.9`, Testing Library, jsdom                            |
| Formatting       | Prettier `3.8.4`, EditorConfig                                    |
| Database tooling | Supabase project skeleton exists; no real migrations yet          |

Planned but not installed: shadcn/ui, Drizzle ORM, Playwright.

## Implementation Reality

Current code shape:

- `app/` contains route pages and page-level UI logic.
- `components/layout/`, `components/ui/`, and `components/gym/` contain shared
  UI components.
- `store/` contains Zustand stores backed by mock data.
- `data/` contains mock commits and circle activity.
- `types/` contains domain-facing TypeScript types.
- `features/` exists as an empty feature-first skeleton.
- `lib/supabase/` exposes browser, server, and proxy helper foundations, but the
  app does not yet use Supabase as source of truth.
- `supabase/` exists with config, seed placeholder, functions folder, and
  generated-types placeholder. No definitive migrations exist yet.
- `app/providers.tsx` wires TanStack Query, Supabase client context, and a no-op
  Theme provider.

Current routes:

- `/` today hub
- `/commit` commit creation flow
- `/circle` circle overview
- `/archive` commit archive
- `/profile` profile summary

## Architecture Reality

The reference docs describe a future architecture:

- `features/` directories
- Server Components by default
- Server Actions for mutations
- TanStack Query for server state in client components
- Zod and React Hook Form for validation and forms
- Supabase Auth, RLS, Storage, Realtime, and migrations

The current implementation is not there yet. It is a client-side prototype.

## Known Contradictions

| Topic                   | Current mismatch                                                                                                                                         | Status             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Next version            | Prompts/reference mention Next.js 15; `package.json` uses Next `16.2.7`.                                                                                 | Open               |
| Installed stack         | Zod, RHF, TanStack Query, Supabase SSR, Vitest, Testing Library, and Prettier are installed; shadcn/ui, Drizzle, and Playwright are not.                 | Partially resolved |
| Architecture            | Feature skeleton and providers exist; current pages are still client-heavy and route-local.                                                              | Partially resolved |
| Database table count    | Canonical MVP contract freezes `auth.users`, `profiles`, `commits`, `reflections`, `circle_memberships`, and `supports`; no `progress_snapshots` in MVP. | Resolved           |
| Circle bidirectionality | Canonical MVP contract assigns reciprocity to the database.                                                                                              | Resolved           |
| Migrations              | Supabase CLI is canonical; `supabase/` skeleton exists, but no real SQL migrations exist yet.                                                            | Partially resolved |
| README                  | Previously default Next README; now replaced with project overview.                                                                                      | Resolved           |
| AI entry point          | Previously AGENTS only warned about Next; now bootloader routes to kernel.                                                                               | Resolved           |

## Active Roadmap

1. Stabilize the knowledge kernel.
2. Decide and record ADRs for open contradictions that affect implementation.
3. Align dependencies with the chosen stack.
4. Move prototype code toward the canonical architecture incrementally.
5. Implement Supabase schema, migrations, RLS, auth, and server data flow.

## Technical Debt

- Mock data is used as product state.
- Zustand stores currently hold domain data that should eventually live in
  Supabase and server-state tooling.
- No database implementation exists.
- Supabase generated types are still a placeholder.
- Long reference docs contain duplicated and conflicting truth.

## Reference Sources

- Product philosophy: `docs/00-observations.md`, `docs/01-truth.md`,
  `docs/02-manifesto.md`
- Product/domain map: `docs/product/00-product-map.md`
- Architecture reference: `docs/architecture/`
- Engineering reference: `docs/engineering/`
- Database reference: `docs/database/`
- Domain reference: `docs/domain/`
