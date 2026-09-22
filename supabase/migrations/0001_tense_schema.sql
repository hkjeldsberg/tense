-- The Memory Diorama: learning content lives in its own schema.
-- After running, add "tense" to Project Settings → API → Exposed schemas.

create schema if not exists tense;

create table if not exists tense.rooms (
  id           text primary key,              -- slug, e.g. 'cocina'
  order_index  int  not null unique,
  title        text not null,                 -- Spanish title
  subtitle     text not null,                 -- English subtitle
  focus        text not null                  -- learning focus, shown in UI
);

create table if not exists tense.puzzles (
  id             uuid primary key default gen_random_uuid(),
  room_id        text not null references tense.rooms (id) on delete cascade,
  order_index    int  not null,
  scene_object   text not null,               -- target mesh id in the R3F room
  sentence_pre   text not null,
  sentence_post  text not null,
  verb_base      text not null,               -- infinitive
  options        jsonb not null,              -- [{ form, type: 'imperfect'|'preterite', correct }]
  rule_feedback  text not null,
  translation    text,
  anim_trigger   text not null,
  unique (room_id, order_index),
  unique (room_id, scene_object),
  constraint options_is_array check (jsonb_typeof(options) = 'array')
);

create index if not exists puzzles_room_idx on tense.puzzles (room_id, order_index);

-- Public read-only access (content is not secret; writes via dashboard/service role only).
alter table tense.rooms   enable row level security;
alter table tense.puzzles enable row level security;

drop policy if exists "rooms are public" on tense.rooms;
create policy "rooms are public" on tense.rooms for select to anon, authenticated using (true);

drop policy if exists "puzzles are public" on tense.puzzles;
create policy "puzzles are public" on tense.puzzles for select to anon, authenticated using (true);

grant usage on schema tense to anon, authenticated, service_role;
grant select on all tables in schema tense to anon, authenticated;
grant all on all tables in schema tense to service_role;
