-- REPLAY — Supabase schema
-- Run in Supabase project: Database → SQL Editor → New query

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text unique not null,
  country text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.gaming_dna (
  user_id uuid primary key references auth.users(id) on delete cascade,
  genres text[] default '{}',
  franchises text[] default '{}',
  favorite_game_ids int[] default '{}',
  hours_per_week int default 0,
  budget text default 'mid',
  graphics text default 'medium',
  playstyles text[] default '{}',
  difficulty text default 'balanced',
  mechanics text[] default '{}',
  personality text default 'Explorer',
  computed_at timestamptz default now()
);

create table if not exists public.play_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id int not null,
  game_name text not null,
  game_image text,
  played_at date not null default current_date,
  minutes int not null default 0,
  mood text,
  stats jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id int not null,
  game_name text not null,
  game_image text,
  priority text default 'normal',
  added_at timestamptz default now(),
  unique (user_id, game_id)
);

create table if not exists public.game_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id int not null,
  liked boolean not null,
  created_at timestamptz default now(),
  unique (user_id, game_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  done boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.gaming_dna enable row level security;
alter table public.play_sessions enable row level security;
alter table public.wishlist enable row level security;
alter table public.game_feedback enable row level security;
alter table public.goals enable row level security;

create policy "profiles: owner read/write" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "gaming_dna: owner read/write" on public.gaming_dna
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "play_sessions: owner read/write" on public.play_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wishlist: owner read/write" on public.wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "game_feedback: owner read/write" on public.game_feedback
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals: owner read/write" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
