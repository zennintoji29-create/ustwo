-- UsTwo 💗 - Supabase Database Schema & Realtime Setup
-- Migration: 20261031_init_ustwo.sql

-- Enable UUID & crypto extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nickname text not null check (char_length(nickname) between 2 and 30),
  avatar_id text not null default 'bunny',
  custom_status text default 'Feeling happy!',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- 2. COUPLE ROOMS TABLE
-- ==========================================
create table if not exists public.couple_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'archived')),
  anniversary_date date,
  theme_id text not null default 'cherry_blossom',
  activity_count int not null default 0,
  streak_days int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_couple_rooms_code on public.couple_rooms(code);

-- ==========================================
-- 3. ROOM MEMBERS TABLE
-- ==========================================
create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('creator', 'partner')),
  is_ready boolean not null default false,
  mood text not null default 'happy',
  last_seen_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  constraint unique_room_member unique (room_id, user_id)
);

create index if not exists idx_room_members_room on public.room_members(room_id);
create index if not exists idx_room_members_user on public.room_members(user_id);

-- Trigger: Strictly limit room to 2 members
create or replace function public.check_room_capacity()
returns trigger as $$
declare
  member_count int;
begin
  select count(*) into member_count from public.room_members where room_id = NEW.room_id;
  if member_count >= 2 then
    raise exception 'This private room is already full (maximum 2 partners allowed).';
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_check_room_capacity on public.room_members;
create trigger trg_check_room_capacity
before insert on public.room_members
for each row execute function public.check_room_capacity();

-- ==========================================
-- 4. GAME SESSIONS & AUDIT MOVES
-- ==========================================
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  game_type text not null,
  status text not null default 'in_progress' check (status in ('lobby', 'in_progress', 'round_complete', 'completed', 'abandoned')),
  round_number int not null default 1,
  total_rounds int not null default 5,
  current_turn uuid references public.profiles(id),
  scores jsonb not null default '{}'::jsonb,
  game_state jsonb not null default '{}'::jsonb,
  winner_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_game_sessions_room on public.game_sessions(room_id, status);

create table if not exists public.game_moves (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  move_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 5. OUR LITTLE CORNER TABLES
-- ==========================================
create table if not exists public.bucket_list_items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 140),
  description text default '',
  category text not null default 'adventure',
  is_completed boolean not null default false,
  completed_at timestamptz,
  target_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.love_notes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  sticker_id text default 'heart_sparkle',
  stationery_style text default 'pastel_blush',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  category text not null default 'romantic',
  created_at timestamptz not null default now()
);

create table if not exists public.daily_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  question_id uuid not null references public.daily_questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answer text not null,
  date_answered date not null default current_date,
  revealed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint unique_user_daily_answer unique (room_id, question_id, user_id, date_answered)
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  event_date date not null,
  event_type text not null default 'date_night' check (event_type in ('anniversary', 'birthday', 'date_night', 'trip', 'milestone')),
  reminder_days_before int default 1,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.virtual_gifts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  gift_type text not null check (gift_type in ('bouquet', 'teddy_bear', 'chocolates', 'heart_locket', 'shooting_star', 'cupcake')),
  message text,
  is_opened boolean not null default false,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_memories (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.couple_rooms(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  memory_date date not null,
  location_name text,
  story text not null,
  photo_url text,
  tag text default 'favorite',
  created_at timestamptz not null default now()
);

-- ==========================================
-- 6. SEED STARTER DAILY QUESTIONS
-- ==========================================
insert into public.daily_questions (prompt, category) values
  ('What was the exact moment you knew you had feelings for me?', 'romantic'),
  ('If we could pack our bags right now and go anywhere for 48 hours, where would we go?', 'adventure'),
  ('What is a small, quiet gesture I do that makes your heart flutter?', 'cute'),
  ('What is our silliest inside joke that nobody else would understand?', 'playful'),
  ('What song instantly reminds you of us or makes you smile about me?', 'nostalgic'),
  ('What is one dream or goal you want us to accomplish together this year?', 'future'),
  ('If you could describe our relationship using three cozy food or drink items, what would they be?', 'playful'),
  ('What is your absolute favorite photo of the two of us?', 'memories'),
  ('What is something new you want us to try together for our next date night?', 'adventure'),
  ('What is one thing you appreciate about how we handle disagreements or tough days?', 'deep')
on conflict do nothing;

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.profiles enable row level security;
alter table public.couple_rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_moves enable row level security;
alter table public.bucket_list_items enable row level security;
alter table public.love_notes enable row level security;
alter table public.daily_questions enable row level security;
alter table public.daily_answers enable row level security;
alter table public.calendar_events enable row level security;
alter table public.virtual_gifts enable row level security;
alter table public.saved_memories enable row level security;

-- Helper security definer function for room membership check
create or replace function public.is_room_member(target_room_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.room_members
    where room_id = target_room_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql;

-- Profiles Policies
create policy "View profiles policy"
  on public.profiles for select using (
    id = auth.uid() or exists (
      select 1 from public.room_members rm1
      join public.room_members rm2 on rm1.room_id = rm2.room_id
      where rm1.user_id = auth.uid() and rm2.user_id = profiles.id
    )
  );

create policy "Insert own profile"
  on public.profiles for insert with check (id = auth.uid());

create policy "Update own profile"
  on public.profiles for update using (id = auth.uid());

-- Couple Rooms Policies
create policy "View couple rooms policy"
  on public.couple_rooms for select using (
    created_by = auth.uid() or public.is_room_member(id)
  );

create policy "Create couple room policy"
  on public.couple_rooms for insert with check (created_by = auth.uid());

create policy "Update couple room policy"
  on public.couple_rooms for update using (public.is_room_member(id));

-- Room Members Policies
create policy "View room members policy"
  on public.room_members for select using (public.is_room_member(room_id) or user_id = auth.uid());

create policy "Join room policy"
  on public.room_members for insert with check (user_id = auth.uid());

create policy "Update room member policy"
  on public.room_members for update using (user_id = auth.uid());

create policy "Leave room policy"
  on public.room_members for delete using (user_id = auth.uid());

-- Game Sessions & Moves Policies
create policy "View game sessions policy"
  on public.game_sessions for select using (public.is_room_member(room_id));

create policy "Manage game sessions policy"
  on public.game_sessions for all using (public.is_room_member(room_id));

create policy "View game moves policy"
  on public.game_moves for all using (
    exists (
      select 1 from public.game_sessions gs
      where gs.id = game_moves.session_id and public.is_room_member(gs.room_id)
    )
  );

-- Shared Activities Policies
create policy "Bucket list policy"
  on public.bucket_list_items for all using (public.is_room_member(room_id));

create policy "Love notes select policy"
  on public.love_notes for select using (public.is_room_member(room_id));

create policy "Love notes insert policy"
  on public.love_notes for insert with check (
    public.is_room_member(room_id) and sender_id = auth.uid()
  );

create policy "Love notes update policy"
  on public.love_notes for update using (public.is_room_member(room_id));

create policy "Daily questions policy"
  on public.daily_questions for select to authenticated using (true);

create policy "Daily answers policy"
  on public.daily_answers for all using (public.is_room_member(room_id));

create policy "Calendar policy"
  on public.calendar_events for all using (public.is_room_member(room_id));

create policy "Gifts policy"
  on public.virtual_gifts for all using (public.is_room_member(room_id));

create policy "Memories policy"
  on public.saved_memories for all using (public.is_room_member(room_id));

-- ==========================================
-- 8. SECURITY DEFINER ATOMIC ROOM RPCs
-- ==========================================
create or replace function public.join_room_by_code(
  p_code text,
  p_user_id uuid,
  p_nickname text default 'Partner',
  p_avatar_id text default 'kitty'
)
returns jsonb
security definer
set search_path = public
as $$
declare
  v_room record;
  v_member_count int;
  v_existing_member record;
begin
  -- 1. Find room by uppercase code
  select * into v_room from public.couple_rooms
  where upper(code) = upper(trim(p_code));

  if not found then
    return jsonb_build_object('success', false, 'error', 'Room code not found. Please verify the code.');
  end if;

  -- 2. Check if user is already a member
  select * into v_existing_member from public.room_members
  where room_id = v_room.id and user_id = p_user_id;

  if found then
    return jsonb_build_object(
      'success', true,
      'room', row_to_json(v_room),
      'already_member', true
    );
  end if;

  -- 3. Check capacity (strict 2 players)
  select count(*) into v_member_count from public.room_members
  where room_id = v_room.id;

  if v_member_count >= 2 then
    return jsonb_build_object('success', false, 'error', 'This private room is already full (maximum 2 partners allowed).');
  end if;

  -- 4. Insert profile if missing
  insert into public.profiles (id, nickname, avatar_id, custom_status)
  values (p_user_id, p_nickname, p_avatar_id, 'Playing together 💗')
  on conflict (id) do update set
    nickname = coalesce(nullif(excluded.nickname, ''), profiles.nickname),
    avatar_id = coalesce(nullif(excluded.avatar_id, ''), profiles.avatar_id);

  -- 5. Insert member as partner
  insert into public.room_members (room_id, user_id, role, mood, is_ready)
  values (v_room.id, p_user_id, 'partner', 'happy', false);

  -- 6. Mark room active
  update public.couple_rooms
  set status = 'active', updated_at = now()
  where id = v_room.id;

  return jsonb_build_object(
    'success', true,
    'room', row_to_json(v_room),
    'already_member', false
  );
end;
$$ language plpgsql;

-- Grant execution to authenticated & anon
grant execute on function public.join_room_by_code to anon, authenticated;

-- ==========================================
-- 9. REALTIME REPLICATION CONFIGURATION
-- ==========================================
-- Add tables to the supabase_realtime publication for live CDC subscriptions
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end;
$$;

alter publication supabase_realtime add table public.room_members;
alter publication supabase_realtime add table public.game_sessions;
alter publication supabase_realtime add table public.love_notes;
alter publication supabase_realtime add table public.virtual_gifts;
alter publication supabase_realtime add table public.daily_answers;
alter publication supabase_realtime add table public.calendar_events;
alter publication supabase_realtime add table public.bucket_list_items;

