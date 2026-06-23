-- Local development seed for Gym Circle.
-- Password for all demo users: gymcircle-demo

delete from auth.users
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'dia@gymcircle.local',
    extensions.crypt('gymcircle-demo', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Dia"}'::jsonb,
    now() - interval '45 days',
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'mara@gymcircle.local',
    extensions.crypt('gymcircle-demo', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Mara"}'::jsonb,
    now() - interval '40 days',
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'noah@gymcircle.local',
    extensions.crypt('gymcircle-demo', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Noah"}'::jsonb,
    now() - interval '30 days',
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'leo@gymcircle.local',
    extensions.crypt('gymcircle-demo', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Leo"}'::jsonb,
    now() - interval '20 days',
    now(),
    '',
    '',
    '',
    ''
  );

update public.profiles
set
  bio = seed.bio,
  visibility_preference = seed.visibility_preference,
  onboarding_completed = true
from (
  values
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Building consistency without spectacle.', 'circle'),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'Shows up early and keeps the rhythm steady.', 'circle'),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Returning after a pause, one clean action at a time.', 'private'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Quiet member with a small but real training thread.', 'circle')
) as seed(id, bio, visibility_preference)
where profiles.id = seed.id;

insert into public.circle_memberships (user_id, circle_user_id, status, joined_at)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'active',
    now() - interval '35 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'active',
    now() - interval '21 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'active',
    now() - interval '12 days'
  );

insert into public.commits (
  id,
  user_id,
  title,
  type,
  recorded_at,
  duration_minutes,
  intensity,
  note,
  visibility,
  evidence,
  deleted_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Lower body restart',
    'training',
    now() - interval '2 hours',
    45,
    'steady',
    'Kept the promise small and finished it.',
    'circle',
    '["45 minutes", "leg press", "stretch"]'::jsonb,
    null
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Private mobility work',
    'mobility',
    now() - interval '1 day',
    20,
    'light',
    'Quiet maintenance.',
    'private',
    '["20 minutes"]'::jsonb,
    null
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Archived false start',
    'training',
    now() - interval '9 days',
    15,
    'light',
    'Soft-deleted sample for exclusion checks.',
    'circle',
    '[]'::jsonb,
    now() - interval '8 days'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Morning strength block',
    'training',
    now() - interval '5 hours',
    55,
    'deep',
    'Strong session before work.',
    'circle',
    '["55 minutes", "squats"]'::jsonb,
    null
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    'Return walk',
    'recovery',
    now() - interval '4 days',
    30,
    'light',
    'First action back after the gap.',
    'circle',
    '["30 minutes"]'::jsonb,
    null
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000004',
    'Silent full body',
    'training',
    now() - interval '10 days',
    40,
    'steady',
    null,
    'circle',
    '["40 minutes"]'::jsonb,
    null
  );

insert into public.reflections (
  id,
  user_id,
  commit_id,
  content,
  type,
  visibility
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'A small promise is easier to protect when it is visible to the right people.',
    'process',
    'circle'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'Mobility is not dramatic, but it keeps the rest possible.',
    'identity',
    'private'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000004',
    'Depth came from pacing the first half instead of chasing the lift.',
    'technical',
    'circle'
  );

insert into public.supports (id, from_user_id, to_user_id, message, created_at)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'That restart looked calm and real.',
    now() - interval '1 hour'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Good return. Small counts.',
    now() - interval '3 days'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Your consistency made it easier to show up.',
    now() - interval '11 days'
  );

update public.circle_memberships
set status = 'paused'
where user_id = '00000000-0000-0000-0000-000000000001'
  and circle_user_id = '00000000-0000-0000-0000-000000000003';

update public.circle_memberships
set status = 'ended'
where user_id = '00000000-0000-0000-0000-000000000001'
  and circle_user_id = '00000000-0000-0000-0000-000000000004';
