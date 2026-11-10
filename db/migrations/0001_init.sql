-- a-tom Portfolio Dashboard — Neon schema
--
-- One file, safe to run top to bottom on a fresh Neon database.
--
-- Differences from the old Supabase schema, all because Neon is plain Postgres:
--   · no auth.users table, so team_members.auth_user_id and the signup trigger
--     are gone — the app authenticates with its own admin password
--   · no RLS: there is no auth.uid() and nothing connects to the database
--     except the app's own server, using the connection string
--   · everything else — tables, enums, indexes, the progress trigger and the
--     two reporting views — carries over unchanged

create extension if not exists "pgcrypto";

-- ── Types ───────────────────────────────────────────────────────────────

do $$ begin
  create type project_category as enum ('social','campaigns','corporate','events','bts');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('live','draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type link_type as enum ('video','portfolio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type row_source as enum ('manual','form','import','sheet');
exception when duplicate_object then null; end $$;

-- ── Tables ──────────────────────────────────────────────────────────────

create table if not exists team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  role       text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  category     project_category not null,
  name         text not null,
  client       text,
  description  text,
  status       project_status not null default 'draft',
  project_date date,
  source       row_source not null default 'manual',
  -- Stable key from whatever created the row: a form response id, or
  -- sheet:<sheetId>:<rowNumber>. Lets a re-delivered row update in place.
  external_ref text,
  progress_pct int not null default 0,
  created_by   uuid references team_members(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Video links and portfolio links share a table, split by `type`.
create table if not exists project_links (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type       link_type not null,
  label      text not null,
  url        text not null,
  sort_order int not null default 0,
  source     row_source not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists activity_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references team_members(id) on delete set null,
  project_id  uuid references projects(id) on delete set null,
  action_type text not null,
  description text not null,
  created_at  timestamptz not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────────────────

create index if not exists idx_projects_category on projects(category);
create index if not exists idx_projects_created  on projects(created_at desc);
create index if not exists idx_projects_date     on projects(project_date desc nulls last);
create index if not exists idx_links_project     on project_links(project_id);
create index if not exists idx_links_project_url on project_links(project_id, type, url);
create index if not exists idx_activity_created  on activity_log(created_at desc);

-- One project per external row. Partial, so hand-made rows (null ref) are exempt.
create unique index if not exists uq_projects_external_ref
  on projects (external_ref) where external_ref is not null;

-- Case-insensitive name lookup, used when matching a sheet row by name.
create index if not exists idx_projects_name_lower on projects (lower(name));

-- Search across name, client and description.
create index if not exists idx_projects_search on projects
  using gin (to_tsvector('english',
    coalesce(name,'') || ' ' || coalesce(client,'') || ' ' || coalesce(description,'')));

-- ── Triggers ────────────────────────────────────────────────────────────

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_touch on projects;
create trigger trg_projects_touch before update on projects
for each row execute function touch_updated_at();

-- ── Views ───────────────────────────────────────────────────────────────

create or replace view v_category_stats as
select
  c.category,
  count(p.id)                                   as total,
  count(p.id) filter (where p.status = 'live')  as live,
  count(p.id) filter (where p.status = 'draft') as draft,
  coalesce(sum(l.video_count), 0)::bigint       as video_links,
  coalesce(sum(l.portfolio_count), 0)::bigint   as portfolio_links
from (select unnest(enum_range(null::project_category)) as category) c
left join projects p on p.category = c.category
left join lateral (
  select
    count(*) filter (where type = 'video')     as video_count,
    count(*) filter (where type = 'portfolio') as portfolio_count
  from project_links where project_id = p.id
) l on true
group by c.category;

create or replace view v_portfolio_summary as
select
  (select count(*) from projects)                              as total_projects,
  (select count(*) from projects where status = 'live')         as live_projects,
  (select count(*) from projects where status = 'draft')        as draft_projects,
  (select count(*) from project_links where type = 'video')     as total_video_links,
  (select count(*) from project_links where type = 'portfolio') as total_portfolio_links;
