-- ApplyX production persistence schema.
-- Run in a Supabase project's SQL editor after enabling email/password or magic-link Auth.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school text not null,
  program text not null default 'Application',
  deadline date,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  name text not null,
  category text,
  status text not null default 'missing' check (status in ('done','missing','review')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  organization text,
  category text,
  description text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.requirement_evidence (
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  evidence_id uuid not null references public.evidence(id) on delete cascade,
  match_score integer not null default 0 check (match_score between 0 and 100),
  primary key (requirement_id, evidence_id)
);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.requirements enable row level security;
alter table public.evidence enable row level security;
alter table public.requirement_evidence enable row level security;

create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "applications own rows" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "requirements through own application" on public.requirements for all using (exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())) with check (exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "evidence own rows" on public.evidence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "requirement evidence own rows" on public.requirement_evidence for all using (
  exists (select 1 from public.requirements r join public.applications a on a.id = r.application_id where r.id = requirement_id and a.user_id = auth.uid())
  and exists (select 1 from public.evidence e where e.id = evidence_id and e.user_id = auth.uid())
) with check (
  exists (select 1 from public.requirements r join public.applications a on a.id = r.application_id where r.id = requirement_id and a.user_id = auth.uid())
  and exists (select 1 from public.evidence e where e.id = evidence_id and e.user_id = auth.uid())
);
