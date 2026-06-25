-- Shared presence (Phase 42) reuses the notifications carrier instead of a new
-- table: the canonical MVP table set stays frozen. A "shared_presence"
-- notification is one person quietly proposing to appear alongside another. The
-- partner accepts by acknowledging it (read_at), and whether both showed up is
-- DERIVED from existing commit evidence — nothing about the pact is tracked
-- beyond the proposal itself.
alter table public.notifications
  drop constraint if exists notifications_type_check,
  add constraint notifications_type_check
    check (
      type in (
        'support_received',
        'circle_invitation',
        'invitation_accepted',
        'reflection_received',
        'shared_presence'
      )
    );
