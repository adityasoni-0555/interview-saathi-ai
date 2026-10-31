-- Interview Saathi AI: saved practice sessions.
-- Additive only: does not touch any existing table (e.g. "tasks").

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  role text not null check (char_length(role) between 1 and 80),
  level text not null check (level in ('intern', 'fresher', 'junior', 'mid', 'senior')),
  interview_type text not null check (interview_type in ('technical', 'behavioral', 'hr', 'mixed')),
  focus text check (focus is null or char_length(focus) <= 200),
  average_score integer check (average_score between 0 and 100),
  answered_count integer not null default 0,
  question_count integer not null default 0,
  -- Array of { question, category, difficulty, hint, answer, evaluation }
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists interview_sessions_user_created_idx
  on public.interview_sessions (user_id, created_at desc);

alter table public.interview_sessions enable row level security;

drop policy if exists "Users read own sessions" on public.interview_sessions;
create policy "Users read own sessions"
  on public.interview_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own sessions" on public.interview_sessions;
create policy "Users insert own sessions"
  on public.interview_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own sessions" on public.interview_sessions;
create policy "Users delete own sessions"
  on public.interview_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
