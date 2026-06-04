create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  display_name text not null,
  nickname text,
  avatar text not null default 'maharaja',
  preferred_language text not null default 'en',
  favorite_game text not null default 'rummy',
  is_guest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  host_player_id uuid references public.players(id) on delete set null,
  selected_game text not null default 'rummy',
  status text not null default 'lobby',
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_room_code_format check (room_code ~ '^[A-Z0-9]{6}$')
);

create table if not exists public.room_settings (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  allow_spectators boolean not null default false,
  voice_enabled boolean not null default false,
  video_enabled boolean not null default false,
  language text not null default 'en',
  max_players integer not null default 6,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_settings_max_players_check check (max_players between 2 and 6)
);

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  role text not null default 'guest',
  seat_index integer,
  is_ready boolean not null default false,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint room_players_role_check check (role in ('host', 'guest', 'spectator')),
  constraint room_players_seat_index_check check (seat_index is null or seat_index between 0 and 5),
  constraint room_players_unique_member unique (room_id, player_id)
);

create unique index if not exists room_players_active_seat_idx
  on public.room_players(room_id, seat_index)
  where left_at is null and seat_index is not null;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  message_type text not null default 'chat',
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint messages_message_type_check check (message_type in ('chat', 'system', 'emoji'))
);

create table if not exists public.game_state (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.rooms(id) on delete cascade,
  game_id text not null default 'rummy',
  phase text not null default 'waiting',
  state jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  last_action_by uuid references public.players(id) on delete set null,
  last_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  game_id text,
  icon text not null default 'trophy',
  created_at timestamptz not null default now()
);

create table if not exists public.player_achievements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  constraint player_achievements_unique_unlock unique (player_id, achievement_id)
);

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  game_id text not null,
  winner_player_id uuid references public.players(id) on delete set null,
  scores jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists players_client_id_idx on public.players(client_id);
create index if not exists rooms_room_code_idx on public.rooms(room_code);
create index if not exists rooms_host_player_id_idx on public.rooms(host_player_id);
create index if not exists room_players_room_id_idx on public.room_players(room_id);
create index if not exists room_players_player_id_idx on public.room_players(player_id);
create index if not exists room_players_ready_idx on public.room_players(room_id, is_ready);
create index if not exists messages_room_created_idx on public.messages(room_id, created_at);
create index if not exists messages_player_id_idx on public.messages(player_id);
create index if not exists game_state_room_id_idx on public.game_state(room_id);
create index if not exists room_events_room_created_idx on public.room_events(room_id, created_at);
create index if not exists room_events_event_type_idx on public.room_events(event_type);
create index if not exists player_achievements_player_id_idx on public.player_achievements(player_id);
create index if not exists game_results_room_id_idx on public.game_results(room_id);
create index if not exists game_results_winner_player_id_idx on public.game_results(winner_player_id);

drop trigger if exists set_players_updated_at on public.players;
create trigger set_players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists set_room_settings_updated_at on public.room_settings;
create trigger set_room_settings_updated_at
before update on public.room_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_room_players_updated_at on public.room_players;
create trigger set_room_players_updated_at
before update on public.room_players
for each row execute function public.set_updated_at();

drop trigger if exists set_game_state_updated_at on public.game_state;
create trigger set_game_state_updated_at
before update on public.game_state
for each row execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.rooms enable row level security;
alter table public.room_settings enable row level security;
alter table public.room_players enable row level security;
alter table public.messages enable row level security;
alter table public.game_state enable row level security;
alter table public.room_events enable row level security;
alter table public.achievements enable row level security;
alter table public.player_achievements enable row level security;
alter table public.game_results enable row level security;

create policy "guest players can read players"
on public.players for select
to anon, authenticated
using (true);

create policy "guest players can create guest profiles"
on public.players for insert
to anon, authenticated
with check (is_guest = true);

create policy "guest players can update guest profiles"
on public.players for update
to anon, authenticated
using (is_guest = true)
with check (is_guest = true);

create policy "guest players can read rooms"
on public.rooms for select
to anon, authenticated
using (true);

create policy "guest players can create rooms"
on public.rooms for insert
to anon, authenticated
with check (true);

create policy "guest players can update rooms"
on public.rooms for update
to anon, authenticated
using (true)
with check (true);

create policy "guest players can read room settings"
on public.room_settings for select
to anon, authenticated
using (true);

create policy "guest players can create room settings"
on public.room_settings for insert
to anon, authenticated
with check (true);

create policy "guest players can update room settings"
on public.room_settings for update
to anon, authenticated
using (true)
with check (true);

create policy "guest players can read room memberships"
on public.room_players for select
to anon, authenticated
using (true);

create policy "guest players can join rooms"
on public.room_players for insert
to anon, authenticated
with check (true);

create policy "guest players can update room memberships"
on public.room_players for update
to anon, authenticated
using (true)
with check (true);

create policy "guest players can read messages"
on public.messages for select
to anon, authenticated
using (true);

create policy "guest players can send messages"
on public.messages for insert
to anon, authenticated
with check (true);

create policy "guest players can read game state"
on public.game_state for select
to anon, authenticated
using (true);

create policy "guest players can create game state"
on public.game_state for insert
to anon, authenticated
with check (true);

create policy "guest players can update game state"
on public.game_state for update
to anon, authenticated
using (true)
with check (true);

create policy "guest players can read room events"
on public.room_events for select
to anon, authenticated
using (true);

create policy "guest players can write room events"
on public.room_events for insert
to anon, authenticated
with check (true);

create policy "guest players can read achievements"
on public.achievements for select
to anon, authenticated
using (true);

create policy "guest players can create achievements"
on public.achievements for insert
to anon, authenticated
with check (true);

create policy "guest players can read player achievements"
on public.player_achievements for select
to anon, authenticated
using (true);

create policy "guest players can unlock achievements"
on public.player_achievements for insert
to anon, authenticated
with check (true);

create policy "guest players can read game results"
on public.game_results for select
to anon, authenticated
using (true);

create policy "guest players can create game results"
on public.game_results for insert
to anon, authenticated
with check (true);

insert into public.achievements (id, title, description, game_id, icon)
values
  ('first-game', 'First Game', 'Join or start your first private room.', null, 'sparkles'),
  ('rummy-master', 'Rummy Master', 'Win a Rummy night with friends.', 'rummy', 'cards'),
  ('mendicot-expert', 'Mendicot Expert', 'Play a confident Mendicot session.', 'mendicot', 'shield'),
  ('304-champion', '304 Champion', 'Complete a 304 match.', '304', 'crown'),
  ('teen-patti-king', 'Teen Patti King', 'Host a Teen Patti table.', 'teen-patti', 'king'),
  ('marathon-player', 'Marathon Player', 'Stay through a long family game session.', null, 'clock'),
  ('social-star', 'Social Star', 'Invite friends into a private room.', null, 'users')
on conflict (id) do nothing;

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.game_state;
