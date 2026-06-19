# Supabase

This directory owns the local Supabase project structure for Gym Circle.

Canonical model source:

- `docs/database/12-mvp-data-contract.md`
- `docs/database/13-data-infrastructure-plan.md`

Rules:

- Do not edit production schema manually in the Supabase dashboard.
- Schema changes must be versioned under `supabase/migrations/`.
- Generated types live in `supabase/types/database.generated.ts`.
- `seed.sql` is for local development data only.
- No definitive migrations exist yet in Phase 1.
