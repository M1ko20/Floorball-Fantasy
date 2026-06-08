-- ============================================================
-- FLOORTASY — Supabase schema + seed
-- Paste this entire file into Supabase SQL Editor and run it.
-- ============================================================

-- ── Tables ───────────────────────────────────────────────────

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int not null,
  position text not null check (position in ('goalkeeper', 'defender', 'attacker')),
  team text not null,
  price int not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table matchdays (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  name text not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- One squad per user per matchday. matchday_id = null = current draft.
create table squads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  matchday_id uuid references matchdays(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, matchday_id)
);

create table squad_slots (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references squads(id) on delete cascade,
  line text not null check (line in ('1', '2', 'gk')),
  slot_index int not null,
  player_id uuid not null references players(id),
  is_captain boolean not null default false,
  unique(squad_id, line, slot_index)
);

create table match_performances (
  id uuid primary key default gen_random_uuid(),
  matchday_id uuid not null references matchdays(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  played boolean not null default false,
  goals int not null default 0,
  assists int not null default 0,
  penalty boolean not null default false,
  mvp boolean not null default false,
  hattrick boolean not null default false,
  clean_sheet boolean not null default false,
  saves int,
  save_rate numeric(4,3),
  won_match boolean,
  lost_match boolean,
  extra_time text check (extra_time in ('won', 'lost')),
  created_at timestamptz default now(),
  unique(matchday_id, player_id)
);

create table matchday_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  matchday_id uuid not null references matchdays(id) on delete cascade,
  total_score int not null default 0,
  updated_at timestamptz default now(),
  unique(user_id, matchday_id)
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references profiles(id) on delete cascade,
  invite_code text unique not null default substring(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_at timestamptz default now()
);

create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- ── Auto-create profile on sign-up ───────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Row Level Security ────────────────────────────────────────

alter table players enable row level security;
alter table profiles enable row level security;
alter table matchdays enable row level security;
alter table squads enable row level security;
alter table squad_slots enable row level security;
alter table match_performances enable row level security;
alter table matchday_scores enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;

-- Players: everyone can read
create policy "players_read" on players for select using (true);

-- Profiles: everyone can read; only owner can update
create policy "profiles_read" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Matchdays: everyone can read
create policy "matchdays_read" on matchdays for select using (true);

-- Squads: owner only
create policy "squads_select" on squads for select using (auth.uid() = user_id);
create policy "squads_insert" on squads for insert with check (auth.uid() = user_id);
create policy "squads_update" on squads for update using (auth.uid() = user_id);
create policy "squads_delete" on squads for delete using (auth.uid() = user_id);

-- Squad slots: owner only (via squad)
create policy "squad_slots_select" on squad_slots for select
  using (exists (select 1 from squads where squads.id = squad_slots.squad_id and squads.user_id = auth.uid()));
create policy "squad_slots_insert" on squad_slots for insert
  with check (exists (select 1 from squads where squads.id = squad_slots.squad_id and squads.user_id = auth.uid()));
create policy "squad_slots_update" on squad_slots for update
  using (exists (select 1 from squads where squads.id = squad_slots.squad_id and squads.user_id = auth.uid()));
create policy "squad_slots_delete" on squad_slots for delete
  using (exists (select 1 from squads where squads.id = squad_slots.squad_id and squads.user_id = auth.uid()));

-- Match performances: everyone can read
create policy "performances_read" on match_performances for select using (true);

-- Matchday scores: everyone can read; only owner can update
create policy "scores_read" on matchday_scores for select using (true);
create policy "scores_upsert" on matchday_scores for insert with check (auth.uid() = user_id);
create policy "scores_update" on matchday_scores for update using (auth.uid() = user_id);

-- Groups: members can read; creator can manage
create policy "groups_read" on groups for select
  using (exists (select 1 from group_members where group_members.group_id = groups.id and group_members.user_id = auth.uid()));
create policy "groups_insert" on groups for insert with check (auth.uid() = created_by);
create policy "groups_delete" on groups for delete using (auth.uid() = created_by);

-- Group members
create policy "group_members_read" on group_members for select
  using (exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid()));
create policy "group_members_insert" on group_members for insert with check (auth.uid() = user_id);
create policy "group_members_delete" on group_members for delete using (auth.uid() = user_id);

-- ── Player seed data ──────────────────────────────────────────
-- Prices: goalkeeper = 8, defender = 6, attacker = 12

insert into players (name, age, position, team, price) values
-- Mlada boleslav
('Lukáš Bauer', 35, 'goalkeeper', 'Mlada boleslav', 8),
('Tomáš Týc', 21, 'goalkeeper', 'Mlada boleslav', 8),
('Jáchym Eliáš', 20, 'defender', 'Mlada boleslav', 6),
('Martin Feigl', 19, 'defender', 'Mlada boleslav', 6),
('Miroslav Fořt', 24, 'defender', 'Mlada boleslav', 6),
('Adam Hemerka', 24, 'defender', 'Mlada boleslav', 6),
('Patrik Suchánek', 35, 'defender', 'Mlada boleslav', 6),
('Filip Zakonov', 26, 'defender', 'Mlada boleslav', 6),
('Dominik Beneš', 24, 'attacker', 'Mlada boleslav', 12),
('Jiří Besta', 27, 'attacker', 'Mlada boleslav', 12),
('Adam Delong', 29, 'attacker', 'Mlada boleslav', 12),
('Ondřej Duben', 20, 'attacker', 'Mlada boleslav', 12),
('Michal Sládek', 26, 'attacker', 'Mlada boleslav', 12),
('Martin Tokoš', 35, 'attacker', 'Mlada boleslav', 12),
('Milan Tomašík', 37, 'attacker', 'Mlada boleslav', 12),
('Jakub Vařecha', 19, 'attacker', 'Mlada boleslav', 12),
('Vojtěch Wiener', 23, 'attacker', 'Mlada boleslav', 12),
('Jan Zoufalý', 23, 'attacker', 'Mlada boleslav', 12),
-- Karlovy vary
('Miroslav Kovařík', 20, 'goalkeeper', 'Karlovy vary', 8),
('Jiří Hanzal', 17, 'defender', 'Karlovy vary', 6),
('Jakub Hejzlar', 22, 'defender', 'Karlovy vary', 6),
('Jakub Pařízek', 25, 'defender', 'Karlovy vary', 6),
('Samuel Virga', 23, 'defender', 'Karlovy vary', 6),
('Dominik Bürger', 19, 'attacker', 'Karlovy vary', 12),
('Jakub Buršík', 25, 'attacker', 'Karlovy vary', 12),
('Matúš Gajdoš', 23, 'attacker', 'Karlovy vary', 12),
('Maxim Grega', 20, 'attacker', 'Karlovy vary', 12),
('Jakub Klápa', 19, 'attacker', 'Karlovy vary', 12),
('Matyáš Krebner', 26, 'attacker', 'Karlovy vary', 12),
('Ladislav Mirt', 25, 'attacker', 'Karlovy vary', 12),
('Karel Petrák', 24, 'attacker', 'Karlovy vary', 12),
('Jaroslav Petrák', 21, 'attacker', 'Karlovy vary', 12),
('Lukáš Rada', 19, 'attacker', 'Karlovy vary', 12),
('Adam Zahraj', 21, 'attacker', 'Karlovy vary', 12),
-- Tatran
('Lev Kliment', 19, 'goalkeeper', 'Tatran', 8),
('Lukáš Kříž', 25, 'goalkeeper', 'Tatran', 8),
('Milan Meliš', 27, 'defender', 'Tatran', 6),
('Jan Procházka', 26, 'defender', 'Tatran', 6),
('Pavel Sládeček', 26, 'defender', 'Tatran', 6),
('Adam Tlapák', 28, 'defender', 'Tatran', 6),
('Marek Beneš', 28, 'attacker', 'Tatran', 12),
('Adam Bureš', 20, 'attacker', 'Tatran', 12),
('Tomáš Hanák', 23, 'attacker', 'Tatran', 12),
('Radek Hanák', 27, 'attacker', 'Tatran', 12),
('Matěj Havlas', 24, 'attacker', 'Tatran', 12),
('Adam Karel', 19, 'attacker', 'Tatran', 12),
('Martin Kisugite', 31, 'attacker', 'Tatran', 12),
('Mikuláš Komárek', 30, 'attacker', 'Tatran', 12),
('Jonáš Kreysa', 25, 'attacker', 'Tatran', 12),
('Šimon Vavroušek', 21, 'attacker', 'Tatran', 12),
-- Sparta
('Martin Beneš', 39, 'goalkeeper', 'Sparta', 8),
('Viktor Hejna', 21, 'goalkeeper', 'Sparta', 8),
('Vítek Šimáček', 20, 'goalkeeper', 'Sparta', 8),
('Jakub Gruber', 31, 'defender', 'Sparta', 6),
('David Horký', 23, 'defender', 'Sparta', 6),
('Adam Kos', 19, 'defender', 'Sparta', 6),
('Jakub Mühlfait', 20, 'defender', 'Sparta', 6),
('Martin Pražan', 31, 'defender', 'Sparta', 6),
('Michael Wertheim', 20, 'defender', 'Sparta', 6),
('Jiří Curney', 36, 'attacker', 'Sparta', 12),
('Daniel Dolejš', 20, 'attacker', 'Sparta', 12),
('Radek Drba', 21, 'attacker', 'Sparta', 12),
('Mikuláš Krbec', 27, 'attacker', 'Sparta', 12),
('Jakub Mádlo', 24, 'attacker', 'Sparta', 12),
('Christopher Nojovič', 23, 'attacker', 'Sparta', 12),
('Lukáš Pešat', 30, 'attacker', 'Sparta', 12),
('Jan Peška', 24, 'attacker', 'Sparta', 12),
('Matyáš Šindler', 26, 'attacker', 'Sparta', 12),
('Lukáš Ujhelyi', 29, 'attacker', 'Sparta', 12),
('Jan Vondruška', 19, 'attacker', 'Sparta', 12),
('Marek Zouzal', 27, 'attacker', 'Sparta', 12),
-- Vitkovice
('Adam Kohút', 26, 'goalkeeper', 'Vitkovice', 8),
('Matěj Prašivka', 19, 'goalkeeper', 'Vitkovice', 8),
('Jakub Hubálek', 34, 'defender', 'Vitkovice', 6),
('Ondřej Jankovský', 21, 'defender', 'Vitkovice', 6),
('Štěpán Kaleta', 23, 'defender', 'Vitkovice', 6),
('Michal Pažák', 28, 'defender', 'Vitkovice', 6),
('Ondřej Vítovec', 30, 'defender', 'Vitkovice', 6),
('Šimon Batkovič', 21, 'attacker', 'Vitkovice', 12),
('Lukáš Fukala', 20, 'attacker', 'Vitkovice', 12),
('Rostislav Gattnar', 25, 'attacker', 'Vitkovice', 12),
('Marek Matejčík', 32, 'attacker', 'Vitkovice', 12),
('Adam Palčinský', 21, 'attacker', 'Vitkovice', 12),
('Ondřej Sidunov', 24, 'attacker', 'Vitkovice', 12),
('David Slončík', 21, 'attacker', 'Vitkovice', 12),
('Kacper Szałański', 20, 'attacker', 'Vitkovice', 12),
('Filip Szemla', 21, 'attacker', 'Vitkovice', 12),
('Adam Šmíd', 24, 'attacker', 'Vitkovice', 12),
('Nikolas Vizváry', 20, 'attacker', 'Vitkovice', 12),
('Adam Zubek', 21, 'attacker', 'Vitkovice', 12),
-- Chodov
('Tadeáš Dittrich', 24, 'goalkeeper', 'Chodov', 8),
('Karel Hodík', 23, 'goalkeeper', 'Chodov', 8),
('Josef Šedivý', 20, 'goalkeeper', 'Chodov', 8),
('Matěj Bezpalec', 19, 'defender', 'Chodov', 6),
('Marek Matoušek', 21, 'defender', 'Chodov', 6),
('Bohumil Piskáček', 23, 'defender', 'Chodov', 6),
('Adam Sláma', 20, 'defender', 'Chodov', 6),
('Tomáš Sýkora', 37, 'defender', 'Chodov', 6),
('Marek Šmíd', 23, 'defender', 'Chodov', 6),
('Matyáš Vašíček', 19, 'defender', 'Chodov', 6),
('Vojtěch Bagin', 32, 'attacker', 'Chodov', 12),
('Matěj Jambor', 22, 'attacker', 'Chodov', 12),
('Filip Kovářík', 21, 'attacker', 'Chodov', 12),
('Vojtěch Kún', 22, 'attacker', 'Chodov', 12),
('Erik Papež', 24, 'attacker', 'Chodov', 12),
('Matěj Pěnička', 24, 'attacker', 'Chodov', 12),
('Vojtěch Petráň', 19, 'attacker', 'Chodov', 12),
('Bartoloměj Smolka', 20, 'attacker', 'Chodov', 12),
('David Špaček', 21, 'attacker', 'Chodov', 12),
('Ondřej Štefek', 20, 'attacker', 'Chodov', 12),
('Marek Vávra', 33, 'attacker', 'Chodov', 12),
('Antonín Votava', 21, 'attacker', 'Chodov', 12);
